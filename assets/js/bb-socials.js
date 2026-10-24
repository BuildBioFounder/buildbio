/* bb-socials.js — public social handles (founder instruction 2026-10-24).
   One source for the five platforms, used by account.html (edit + normalize)
   and vehicle-profile.html (public pills). Exposes window.BBSocials; also
   module.exports so the normalizer can be unit-tested in node.

   Storage rule (profiles.social_*): a BARE handle, no URL and no "@".
   Exception: social_youtube may hold a full channel URL — legacy rows, plus
   youtube.com/c|channel|user/... links that have no @handle to reduce to.
   Icons are inline SVG because the production CSP allows no remote images. */
(function (root) {
  'use strict';

  var P = {
    instagram: { key: 'instagram', col: 'social_instagram', name: 'Instagram', prefix: 'instagram.com/', hosts: ['instagram.com', 'instagr.am'], at: false, re: /^[A-Za-z0-9_.]+$/, max: 60, example: 'yourbuild' },
    x:         { key: 'x', col: 'social_x', name: 'X', prefix: 'x.com/', hosts: ['x.com', 'twitter.com'], at: false, re: /^[A-Za-z0-9_]+$/, max: 15, example: 'yourbuild' },
    youtube:   { key: 'youtube', col: 'social_youtube', name: 'YouTube', prefix: 'youtube.com/@', hosts: ['youtube.com'], at: true, re: /^[A-Za-z0-9_.-]+$/, max: 60, example: 'yourchannel' },
    tiktok:    { key: 'tiktok', col: 'social_tiktok', name: 'TikTok', prefix: 'tiktok.com/@', hosts: ['tiktok.com'], at: true, re: /^[A-Za-z0-9_.]+$/, max: 60, example: 'yourbuild' },
    facebook:  { key: 'facebook', col: 'social_facebook', name: 'Facebook', prefix: 'facebook.com/', hosts: ['facebook.com', 'fb.com'], at: false, re: /^[A-Za-z0-9.-]+$/, max: 60, example: 'your.page' }
  };
  var ORDER = ['instagram', 'x', 'youtube', 'tiktok', 'facebook'];
  var HARD_MAX = 60;

  function hostOf(s) {
    var m = String(s).replace(/^[a-z][a-z0-9+.-]*:\/\//i, '').match(/^([^\/?#\s]+)(.*)$/);
    if (!m) return null;
    return { host: m[1].toLowerCase().replace(/:\d+$/, '').replace(/^www\./, ''), rest: m[2] };
  }
  function onHosts(host, hosts) {
    for (var i = 0; i < hosts.length; i++) if (host === hosts[i] || host.slice(-(hosts[i].length + 1)) === '.' + hosts[i]) return true;
    return false;
  }
  function mentionsHost(v, hosts) {
    for (var i = 0; i < hosts.length; i++) {
      var h = hosts[i].replace(/\./g, '\\.');
      if (new RegExp('^([a-z0-9-]+\\.)*' + h + '(?=[/?#]|$)', 'i').test(v)) return true;
    }
    return false;
  }
  function isUrlValue(v) { return /:\/\//.test(v) || /^www\./i.test(v) || /^[a-z0-9-]+(\.[a-z0-9-]+)+\//i.test(v); }

  /* normalize(platform, raw) -> { ok: true, value: string|null } | { ok: false, error } */
  function normalize(platform, raw) {
    var p = P[platform];
    if (!p) return { ok: false, error: 'Unknown platform' };
    var bad = { ok: false, error: 'Just the handle, like ' + p.example };
    var v = String(raw == null ? '' : raw).trim();
    if (!v) return { ok: true, value: null };
    v = v.replace(/^@+/, '');

    if (/:\/\//.test(v) || /^www\./i.test(v) || mentionsHost(v, p.hosts) || (platform === 'youtube' && isUrlValue(v))) {
      var hr = hostOf(v);
      if (!hr) return bad;
      if (!onHosts(hr.host, p.hosts)) {
        // Legacy YouTube: a link that is not on youtube.com stays as entered.
        if (platform === 'youtube' && v.length <= 200 && !/\s/.test(v) && (!/:\/\//.test(v) || /^https?:\/\//i.test(v))) return { ok: true, value: v };
        return bad;
      }
      var path = hr.rest.replace(/[?#].*$/, '').replace(/^\/+|\/+$/g, '');
      if (p.at) {
        var at = path.indexOf('@');
        if (at >= 0) path = path.slice(at + 1).replace(/\/.*$/, '');
        else if (platform === 'youtube' && /^(c|channel|user)\/[A-Za-z0-9_.-]+$/.test(path)) {
          // Old-style channel link with no @handle to reduce to: keep it as a URL.
          return { ok: true, value: 'https://www.youtube.com/' + path };
        }
      }
      v = path;
    }

    v = v.replace(/^@+/, '');
    if (!v || /[\/\s]/.test(v) || v.length > HARD_MAX || v.length > p.max) return bad;
    if (!p.re.test(v)) return bad;
    if (platform === 'facebook' && /\.php$/i.test(v)) return bad;   // profile.php?id=... cannot be a handle
    return { ok: true, value: v };
  }

  /* Public link + muted label for a stored value. Returns null when the value
     cannot be shown safely (garbage in an old row): no pill beats a bad pill. */
  function link(platform, stored) {
    var p = P[platform];
    var raw = String(stored == null ? '' : stored).trim();
    if (!p || !raw) return null;
    if (platform === 'youtube' && isUrlValue(raw)) {
      var url = /:\/\//.test(raw) ? raw : 'https://' + raw;
      if (!/^https?:\/\//i.test(url)) return null;
      var hr = hostOf(url);
      if (!hr) return null;
      var m = hr.rest.match(/^\/(?:c|user)\/([^\/?#]+)/);
      var label = hr.host === 'youtube.com' ? (m ? m[1] : 'Channel') : hr.host;
      return { url: url, label: label };
    }
    var n = normalize(platform, raw);
    if (!n.ok || !n.value) return null;
    var h = n.value, e = encodeURIComponent(h);
    var href = platform === 'instagram' ? 'https://instagram.com/' + e
             : platform === 'x' ? 'https://x.com/' + e
             : platform === 'youtube' ? 'https://youtube.com/@' + e
             : platform === 'tiktok' ? 'https://tiktok.com/@' + e
             : 'https://facebook.com/' + e;
    return { url: href, label: platform === 'facebook' ? h : '@' + h };
  }

  // Simple monochrome marks, 16px, currentColor. Plain drawings, not brand artwork.
  var A = 'width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  var ICONS = {
    instagram: '<svg ' + A + '><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor"/></svg>',
    x:         '<svg ' + A + '><path d="M4 4l16 16M20 4L4 20"/></svg>',
    youtube:   '<svg ' + A + '><rect x="2.5" y="5" width="19" height="14" rx="4"/><path d="M10 9l5 3-5 3z" fill="currentColor"/></svg>',
    tiktok:    '<svg ' + A + '><path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 3c.4 2.6 2.2 4.4 5 4.6"/></svg>',
    facebook:  '<svg ' + A + '><path d="M14.5 21v-8h3l.5-3.5h-3.5V7.5c0-1 .4-1.6 1.7-1.6H18V2.8c-.6-.1-1.6-.2-2.6-.2-2.7 0-4.4 1.6-4.4 4.6v2.3H8V13h3v8"/></svg>'
  };

  var api = { PLATFORMS: P, ORDER: ORDER, normalize: normalize, link: link, ICONS: ICONS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.BBSocials = api;
})(typeof window !== 'undefined' ? window : this);
