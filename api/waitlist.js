// Pre-launch waitlist capture for the coming-soon page.
//
// Writes go through the waitlist_join RPC, never a direct table insert: the
// waitlist table has RLS on with no policies, so PostgREST cannot touch it with
// the publishable key. That keeps validation, rate limiting and the honeypot on
// the server side without needing a service-role key in this environment.
//
// A duplicate reports success. Telling a stranger whether an address is already
// on the list would turn this endpoint into an email-membership oracle.

const { callerKey, readJsonBody, json } = require('./_vault');

const SUPABASE_URL = 'https://bicmwjtkncjkguumbidq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_vt_RE80rfii-6Pb6wtPLhA_t_hyYiTE';

module.exports = async (req, res) => {
  if (req.method !== 'POST') return json(res, 405, { ok: false });

  const body = await readJsonBody(req);
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const honeypot = typeof body.company === 'string' && body.company.trim() !== '';
  const referrer = typeof body.referrer === 'string' ? body.referrer.slice(0, 500) : null;

  if (!email || email.length > 254) return json(res, 400, { ok: false });

  try {
    const rpcRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/waitlist_join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        p_email: email,
        p_caller_key: callerKey(req),
        p_referrer: referrer,
        p_honeypot: honeypot,
      }),
    });

    if (!rpcRes.ok) {
      console.error(`waitlist_join failed: HTTP ${rpcRes.status}`);
      return json(res, 502, { ok: false });
    }

    const outcome = await rpcRes.json();

    if (outcome === 'rate_limited') return json(res, 429, { ok: false }, { 'Retry-After': '600' });
    if (outcome === 'invalid') return json(res, 400, { ok: false });

    // 'ok' and 'duplicate' both report success, on purpose (see header).
    return json(res, 200, { ok: true });
  } catch (err) {
    console.error(`waitlist error: ${err}`);
    return json(res, 502, { ok: false });
  }
};
