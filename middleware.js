// Front door — Vercel Edge Middleware.
// SITE LIVE (founder ruling 2026-10-15): the vault gate is retired from the
// request path. "/" now serves the real landing page for everyone. The vault
// teaser (index.html) and the vault APIs stay in the repo, dormant, so the
// site can be re-darkened by reverting this commit (the "detach" trigger).
//
// Founder ruling 2026-09-08 (QR path never hits a wall) is now trivially true:
// nothing is gated.

export default function middleware(req) {
  const url = new URL(req.url);
  if (url.pathname === '/' || url.pathname === '/index.html') {
    return Response.redirect(new URL('/home.html', url), 307);
  }
}

export const config = {
  matcher: ['/((?!_vercel|_next|.*\\.(?:png|jpg|jpeg|gif|svg|webp|avif|ico|css|js|woff2?|ttf|map)$).*)'],
};
