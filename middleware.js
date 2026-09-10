// Vault gate — Vercel Edge Middleware.
// Founder ruling 2026-09-08: buildbio.app goes live behind a coming-soon page
// while the 14-day launch plan runs, but the QR path stays fully open because a
// scanned sticker must never hit a wall.
//
// Public:  the coming-soon page, the waitlist, and everything a QR scan touches.
// Vaulted: the rest of the site, behind a 30-day HMAC cookie issued by the
//          two-step password + PIN flow (api/vault-login -> api/vault-pin).
//
// A holder of a valid cookie is sent from "/" to home.html, so unlocking does
// not strand the founder on the teaser.

const COOKIE_NAME = 'bb_vault';

// Exact paths that must resolve without a cookie.
const PUBLIC_FILES = new Set([
  '/',
  '/index.html',
  '/vehicle-profile.html',          // QR scan destination
  '/vehicle-status-unavailable.html', // killswitch destination
  '/alert.html',                    // stolen-vehicle destination of the resolver
  // Legal pages MUST stay public. The coming-soon page collects email
  // addresses and links to these; a privacy policy that redirects away
  // unread is worse than no link at all, and the same goes for the terms
  // the waitlist is collected under.
  '/terms.html',
  '/privacy.html',
  '/affiliate-disclosure.html',
  '/api/vault-login',
  '/api/vault-pin',
  '/api/waitlist',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
]);

// Prefixes that must resolve without a cookie.
const PUBLIC_PREFIXES = ['/v/', '/api/v/', '/assets/', '/images/'];

function isPublic(pathname) {
  if (PUBLIC_FILES.has(pathname)) return true;
  return PUBLIC_PREFIXES.some(p => pathname.startsWith(p));
}

function b64urlToBytes(s) {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
  const bin = atob(b64 + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function bytesToB64url(bytes) {
  let bin = '';
  for (const b of new Uint8Array(bytes)) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Must produce the same string as api/_vault.js hmac(). Node's createHmac and
// WebCrypto HMAC-SHA256 agree byte for byte; only the base64url encoding is
// reimplemented here because the Edge runtime has no Buffer.
async function sign(secret, payload) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  return bytesToB64url(await crypto.subtle.sign('HMAC', key, enc.encode(payload)));
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Read the cookie straight off the header. Vercel's framework-less middleware
// hands us a plain Request, so req.cookies (a Next.js convenience) may not exist.
function readCookie(req, name) {
  const header = req.headers.get('cookie');
  if (!header) return null;
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() === name) return part.slice(eq + 1).trim();
  }
  return null;
}

async function hasValidVault(req, secret) {
  const raw = readCookie(req, COOKIE_NAME);
  if (!raw || raw.length > 200) return false;
  const idx = raw.lastIndexOf('.');
  if (idx <= 0) return false;
  const expRaw = raw.slice(0, idx);
  const sig = raw.slice(idx + 1);
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;
  try {
    return timingSafeEqual(sig, await sign(secret, `vault.${exp}`));
  } catch {
    return false;
  }
}

export default async function middleware(req) {
  const url = new URL(req.url);
  const { pathname } = url;

  const secret = process.env.VAULT_SECRET;

  // No secret configured means the gate cannot be evaluated. Fail OPEN rather
  // than 503 the whole site: this gate protects an unlaunched marketing site,
  // and a misconfiguration that takes buildbio.app down entirely would be a
  // worse outcome than one that briefly shows it. Loud in the logs either way.
  if (!secret) {
    console.error('middleware: VAULT_SECRET not configured — vault gate is OPEN');
    return;
  }

  const unlocked = await hasValidVault(req, secret);

  // Cookie holders get the real landing page at "/".
  if (unlocked && (pathname === '/' || pathname === '/index.html')) {
    return Response.redirect(new URL('/home.html', url), 307);
  }

  if (isPublic(pathname) || unlocked) return;

  // Everything else: send visitors to the coming-soon page. Redirect rather
  // than rewrite so the URL bar does not keep showing a page they cannot see.
  return Response.redirect(new URL('/', url), 307);
}

export const config = {
  // Skip Vercel internals and anything with a file extension that is plainly a
  // static asset, so the gate does not add latency to every image request.
  matcher: ['/((?!_vercel|_next|.*\\.(?:png|jpg|jpeg|gif|svg|webp|avif|ico|css|js|woff2?|ttf|map)$).*)'],
};
