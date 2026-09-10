// Vault step 2 of 2: stage token + 4-digit PIN -> 30-day signed cookie.
// Founder ruling 2026-09-08 (ledger 1552). See api/_vault.js for the crypto.
//
// Order matters here: verify the HMAC and expiry FIRST, and only then touch the
// database. That way a caller who cannot forge a token can never create rows in
// vault_stage_tokens, which is what keeps the consume RPC safe to expose to anon.

const {
  safeEqual, callerKey, verifyStageToken, mintCookieValue, cookieHeader,
  rateLimited, consumeStage, readJsonBody, json,
} = require('./_vault');

const PIN_ATTEMPTS_PER_10_MIN = 20;

module.exports = async (req, res) => {
  if (req.method !== 'POST') return json(res, 405, { ok: false });

  const secret = process.env.VAULT_SECRET;
  const expectedPin = process.env.VAULT_PIN;
  if (!secret || !expectedPin) {
    console.error('vault-pin: VAULT_SECRET or VAULT_PIN not configured');
    return json(res, 503, { ok: false });
  }

  const key = callerKey(req);

  if (await rateLimited(key, 'pin', PIN_ATTEMPTS_PER_10_MIN)) {
    return json(res, 429, { ok: false, reset: true, retryAfter: 600 }, { 'Retry-After': '600' });
  }

  const body = await readJsonBody(req);
  const stage = verifyStageToken(secret, key, body.stage);

  // Expired, tampered, or issued to a different caller: send the page back to
  // step 1 rather than letting it sit on a dead PIN field.
  if (!stage) return json(res, 401, { ok: false, reset: true });

  const pin = typeof body.pin === 'string' ? body.pin : '';
  const pinOk = /^\d{4}$/.test(pin) && safeEqual(pin, expectedPin);

  const outcome = await consumeStage(stage.jti, pinOk);

  if (outcome === 'ok') {
    return json(res, 200, { ok: true }, { 'Set-Cookie': cookieHeader(mintCookieValue(secret)) });
  }

  // 'voided'      -> 5 misses used up, start over
  // 'already_used'-> single-use token replayed
  // 'error'       -> RPC unreachable; fail closed and make them start over
  if (outcome === 'voided' || outcome === 'already_used' || outcome === 'error') {
    return json(res, 401, { ok: false, reset: true });
  }

  // 'pin_fail' -> wrong PIN, token still alive for the remaining attempts
  return json(res, 401, { ok: false, reset: false });
};
