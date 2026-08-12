const crypto = require('crypto');

const SUPABASE_URL = 'https://bicmwjtkncjkguumbidq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_vt_RE80rfii-6Pb6wtPLhA_t_hyYiTE';

const NO_CACHE = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'Pragma': 'no-cache',
};

// Public IDs are generated as substr(replace(gen_random_uuid()::text,'-',''),1,8):
// exactly 8 lowercase hex chars. Validate against that exact shape so malformed
// or oversized input is rejected before it ever reaches the database.
const PUBLIC_ID_RE = /^[0-9a-f]{8}$/i;

module.exports = async (req, res) => {
  const { pid } = req.query;

  if (process.env.BOLO_RESOLVER_KILLSWITCH === 'true') {
    res.writeHead(307, { ...NO_CACHE, Location: '/vehicle-status-unavailable.html' });
    return res.end();
  }

  if (!pid || !PUBLIC_ID_RE.test(pid)) {
    res.writeHead(302, { Location: '/' });
    return res.end();
  }

  // Rate-limit key: SHA-256 of the caller IP. Hashing keeps a raw IP out of the
  // bb_private.qr_resolver_hits table; the DB enforces 30 resolutions/minute per
  // key (misses count too, which is what throttles public-id enumeration).
  const fwd = req.headers['x-forwarded-for'];
  const callerIp = (typeof fwd === 'string' && fwd.split(',')[0].trim()) ||
    (req.socket && req.socket.remoteAddress) || 'unknown';
  const callerKey = crypto.createHash('sha256').update(callerIp).digest('hex');

  try {
    const rpcRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/resolve_vehicle_qr_limited`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ p_public_id: pid, p_caller_key: callerKey }),
    });

    if (!rpcRes.ok) {
      // Surface the failure in the Vercel function logs instead of silently
      // bouncing home — a clean dashboard must not hide a broken resolver.
      console.error(`resolve_vehicle_qr_limited failed: HTTP ${rpcRes.status} for pid=${pid}`);
      res.writeHead(302, { Location: '/' });
      return res.end();
    }

    const rows = await rpcRes.json();

    if (rows && rows.length > 0 && rows[0].rate_limited) {
      res.writeHead(429, { 'Content-Type': 'text/html', 'Retry-After': '60', ...NO_CACHE });
      return res.end('<!doctype html><html><head><title>Slow down</title></head><body style="background:#0f0f0f;color:#ccc;font-family:sans-serif;text-align:center;padding:80px"><h1>Too many scans</h1><p>Give it a minute and scan again.</p><a href="/" style="color:#E85D2C">Return home</a></body></html>');
    }

    if (!rows || rows.length === 0) {
      res.writeHead(404, { 'Content-Type': 'text/html', ...NO_CACHE });
      return res.end('<!doctype html><html><head><title>Not Found</title></head><body style="background:#0f0f0f;color:#ccc;font-family:sans-serif;text-align:center;padding:80px"><h1>Vehicle not found</h1><p>This QR code does not match any vehicle.</p><a href="/" style="color:#E85D2C">Return home</a></body></html>');
    }

    const v = rows[0];

    // Record the scan. AWAIT it (bounded) so the serverless invocation cannot
    // freeze or return before the write lands — qr_scans is the data moat and a
    // dropped scan is unrecoverable. There is no package.json in this repo, so
    // Vercel's waitUntil (@vercel/functions) is unavailable without adding a
    // build step; a timeout-bounded await is the reliable alternative. A slow or
    // failing insert can delay the redirect by at most the timeout, never hang
    // it, and never throws.
    try {
      const scanController = new AbortController();
      const scanTimeout = setTimeout(() => scanController.abort(), 2500);
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/qr_scans`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({ vehicle_id: v.vehicle_id }),
          signal: scanController.signal,
        });
      } finally {
        clearTimeout(scanTimeout);
      }
    } catch (scanErr) {
      console.error(`qr_scans insert failed for vehicle_id=${v.vehicle_id}: ${scanErr}`);
    }

    const isStolen = v.vehicle_status === 'stolen' && v.active_report_id;
    const isTotalLoss = v.vehicle_status === 'total_loss';

    if (isStolen) {
      res.writeHead(307, { ...NO_CACHE, Location: `/alert.html?vid=${v.vehicle_id}` });
      return res.end();
    }

    if (isTotalLoss) {
      res.writeHead(307, { ...NO_CACHE, Location: `/vehicle-profile.html?id=${v.vehicle_id}&archived=true` });
      return res.end();
    }

    res.writeHead(307, { ...NO_CACHE, Location: `/vehicle-profile.html?id=${v.vehicle_id}&qr=1` });
    return res.end();
  } catch (err) {
    console.error(`QR resolver error for pid=${pid}: ${err}`);
    res.writeHead(302, { Location: '/' });
    return res.end();
  }
};
