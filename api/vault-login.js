// Vault step 1 of 2: password -> single-use ~2-minute stage token.
// Founder ruling 2026-09-08 (ledger 1552). See api/_vault.js for the crypto.
//
// Returns a deliberately uniform failure shape. The page must not be able to
// tell "wrong password" from "misconfigured server" from "rate limited" beyond
// the one signal it needs (retry-after), because the whole point of the hidden
// entry is that a passer-by learns nothing.

const {
  safeEqual, callerKey, mintStageToken, rateLimited, readJsonBody, json, STAGE_TTL_MS,
} = require('./_vault');

const PASSWORD_ATTEMPTS_PER_10_MIN = 10;

module.exports = async (req, res) => {
  if (req.method !== 'POST') return json(res, 405, { ok: false });

  const secret = process.env.VAULT_SECRET;
  const expected = process.env.VAULT_PASSWORD;
  if (!secret || !expected) {
    console.error('vault-login: VAULT_SECRET or VAULT_PASSWORD not configured');
    return json(res, 503, { ok: false });
  }

  const key = callerKey(req);

  if (await rateLimited(key, 'password', PASSWORD_ATTEMPTS_PER_10_MIN)) {
    return json(res, 429, { ok: false, retryAfter: 600 }, { 'Retry-After': '600' });
  }

  const body = await readJsonBody(req);
  const supplied = typeof body.password === 'string' ? body.password : '';

  // Cap before hashing so an enormous body cannot be used to burn CPU.
  if (supplied.length === 0 || supplied.length > 256 || !safeEqual(supplied, expected)) {
    return json(res, 401, { ok: false });
  }

  return json(res, 200, {
    ok: true,
    stage: mintStageToken(secret, key),
    expiresIn: Math.floor(STAGE_TTL_MS / 1000),
  });
};
