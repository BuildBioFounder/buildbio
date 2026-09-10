// Shared helpers for the vault gate (founder ruling 2026-09-08, ledger 1552).
//
// Two-step entry: password -> single-use ~2-minute stage token -> 4-digit PIN
// -> 30-day signed cookie. This module holds the crypto and the Supabase RPC
// calls so /api/vault-login and /api/vault-pin cannot drift apart.
//
// The stage token is signed here rather than minted in Postgres on purpose: if
// an anon caller could mint one it would skip the password step and brute-force
// a 4-digit PIN directly. Only this server holds VAULT_SECRET, so only this
// server can mint. The database records CONSUMPTION, which is what makes the
// token single-use. See migration 20260910202500.

const crypto = require('crypto');

const SUPABASE_URL = 'https://bicmwjtkncjkguumbidq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_vt_RE80rfii-6Pb6wtPLhA_t_hyYiTE';

const STAGE_TTL_MS = 120 * 1000;        // ~2 minutes, per the founder ruling
const COOKIE_TTL_MS = 30 * 24 * 60 * 60 * 1000;  // 30 days
const COOKIE_NAME = 'bb_vault';

const NO_STORE = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'Pragma': 'no-cache',
};

function b64url(buf) {
  return Buffer.from(buf).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function hmac(secret, payload) {
  return b64url(crypto.createHmac('sha256', secret).update(payload).digest());
}

// Constant-time compare that does not leak length either. Both sides are hashed
// first so timingSafeEqual always sees equal-length buffers.
function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a ?? '')).digest();
  const hb = crypto.createHash('sha256').update(String(b ?? '')).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function callerKey(req) {
  const fwd = req.headers['x-forwarded-for'];
  const ip = (typeof fwd === 'string' && fwd.split(',')[0].trim()) ||
    (req.socket && req.socket.remoteAddress) || 'unknown';
  return crypto.createHash('sha256').update(ip).digest('hex');
}

// --- stage token -----------------------------------------------------------
// Format: <jti>.<expMs>.<sig>   sig = HMAC(secret, "stage.jti.exp.callerKey")
// Bound to the caller key so a token lifted off the wire is useless elsewhere.

function mintStageToken(secret, key) {
  const jti = crypto.randomUUID();
  const exp = Date.now() + STAGE_TTL_MS;
  return `${jti}.${exp}.${hmac(secret, `stage.${jti}.${exp}.${key}`)}`;
}

function verifyStageToken(secret, key, token) {
  if (typeof token !== 'string' || token.length > 300) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [jti, expRaw, sig] = parts;
  if (!/^[0-9a-f-]{36}$/i.test(jti)) return null;
  const exp = Number(expRaw);
  if (!Number.isFinite(exp)) return null;
  if (!safeEqual(sig, hmac(secret, `stage.${jti}.${exp}.${key}`))) return null;
  if (Date.now() > exp) return null;
  return { jti };
}

// --- session cookie --------------------------------------------------------
// Format: <expMs>.<sig>   sig = HMAC(secret, "vault.exp")
// Not bound to IP: the founder moves between networks and a 30-day cookie that
// dies on every network change would be worse than useless.

function mintCookieValue(secret) {
  const exp = Date.now() + COOKIE_TTL_MS;
  return `${exp}.${hmac(secret, `vault.${exp}`)}`;
}

function cookieHeader(value) {
  const maxAge = Math.floor(COOKIE_TTL_MS / 1000);
  return `${COOKIE_NAME}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
}

// --- Supabase RPCs ---------------------------------------------------------

async function rpc(fn, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${fn} failed: HTTP ${res.status}`);
  return res.json();
}

// Fail CLOSED. If the limiter cannot be reached we deny rather than allow —
// an unreachable limiter is exactly when an attacker would want to be trying.
async function rateLimited(key, step, limit) {
  try {
    return await rpc('vault_rate_limited', {
      p_caller_key: key, p_step: step, p_limit: limit, p_window_minutes: 10,
    }) === true;
  } catch (err) {
    console.error(`vault: rate limiter unavailable for step=${step}: ${err}`);
    return true;
  }
}

async function consumeStage(jti, pinOk) {
  try {
    return await rpc('vault_consume_stage', { p_jti: jti, p_pin_ok: pinOk });
  } catch (err) {
    console.error(`vault: consume_stage failed for jti=${jti}: ${err}`);
    return 'error';
  }
}

function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return Promise.resolve(req.body);
  return new Promise(resolve => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
      if (raw.length > 4096) { raw = ''; req.destroy(); resolve({}); }
    });
    req.on('end', () => { try { resolve(JSON.parse(raw || '{}')); } catch { resolve({}); } });
    req.on('error', () => resolve({}));
  });
}

function json(res, status, payload, extraHeaders) {
  res.writeHead(status, { 'Content-Type': 'application/json', ...NO_STORE, ...(extraHeaders || {}) });
  res.end(JSON.stringify(payload));
}

module.exports = {
  COOKIE_NAME, STAGE_TTL_MS,
  safeEqual, callerKey,
  mintStageToken, verifyStageToken,
  mintCookieValue, cookieHeader,
  rateLimited, consumeStage,
  readJsonBody, json,
};
