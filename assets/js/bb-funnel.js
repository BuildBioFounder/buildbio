/* BuildBio build-funnel beacon (founder ask 2026-10-27).
   Records where visitors drop out between a flyer scan and a published vehicle:
     scan_landing -> start_open -> draft_saved -> signup_open -> signup_submit
     -> account_created -> vehicle_published
   One anonymous row per browser session and step, written through the
   SECURITY DEFINER RPC public.log_funnel_event (migration 20261103170000 in
   buildbio-supabase). No cookies: the session id lives in sessionStorage
   (bb_fs). A short localStorage hand-off (bb_fs_carry, 24 h) keeps the same id
   when the email-confirmation link opens welcome.html in a new tab, otherwise
   every confirmed signup would split into two sessions.

   Usage
     <script src="/assets/js/bb-funnel.js" data-bb-step="start_open"></script>
       fires that step on load. Any page loaded with a marketing code in the
       URL (?src=<code>, also ?from=<code>) also fires scan_landing and keeps
       the code for the rest of the session.
     window.bbFunnel.track('signup_submit')  // manual steps
   Never throws, never blocks: every failure is swallowed. */
(function (root) {
  'use strict';

  var URL_BASE = 'https://bicmwjtkncjkguumbidq.supabase.co';
  var ANON = 'sb_publishable_vt_RE80rfii-6Pb6wtPLhA_t_hyYiTE';
  var AUTH_KEY = 'sb-bicmwjtkncjkguumbidq-auth-token';   // supabase-js default storage key
  var STEPS = ['scan_landing', 'start_open', 'draft_saved', 'signup_open', 'signup_submit', 'account_created', 'vehicle_published'];
  var CODE_PARAMS = ['src', 'from'];
  var CODE_RE = /^[a-z0-9-]{1,32}$/;
  var CARRY_MS = 24 * 60 * 60 * 1000;

  function ss() { try { return root.sessionStorage || null; } catch (e) { return null; } }
  function ls() { try { return root.localStorage || null; } catch (e) { return null; } }
  function get(s, k) { try { return s ? s.getItem(k) : null; } catch (e) { return null; } }
  function set(s, k, v) { try { if (s) s.setItem(k, v); } catch (e) {} }

  function newId() {
    var a = '';
    try {
      var b = new Uint8Array(16);
      root.crypto.getRandomValues(b);
      for (var i = 0; i < b.length; i++) a += ('0' + b[i].toString(16)).slice(-2);
    } catch (e) {
      a = Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
    }
    return 'fs_' + a;
  }

  function readCarry() {
    try {
      var c = JSON.parse(get(ls(), 'bb_fs_carry') || 'null');
      if (c && typeof c.id === 'string' && /^[A-Za-z0-9_-]{8,64}$/.test(c.id) && Date.now() - c.t < CARRY_MS) return c;
    } catch (e) {}
    return null;
  }

  var state = (function () {
    var s = ss();
    var id = get(s, 'bb_fs');
    var code = get(s, 'bb_fs_code');
    if (!id || !/^[A-Za-z0-9_-]{8,64}$/.test(id)) {
      var c = readCarry();
      id = c ? c.id : newId();
      if (c && c.code && !code) code = c.code;
      set(s, 'bb_fs', id);
    }
    var fromUrl = null;
    try {
      var q = new root.URLSearchParams(root.location.search);
      for (var i = 0; i < CODE_PARAMS.length && !fromUrl; i++) {
        var v = (q.get(CODE_PARAMS[i]) || '').trim().toLowerCase();
        if (CODE_RE.test(v)) fromUrl = v;
      }
    } catch (e) {}
    if (fromUrl && !code) code = fromUrl;          // first code of the session wins
    if (code && !CODE_RE.test(code)) code = null;
    if (code) set(s, 'bb_fs_code', code);
    return { id: id, code: code, fromUrl: fromUrl };
  })();

  function sentList() { return (get(ss(), 'bb_fs_sent') || '').split(',').filter(Boolean); }

  function userToken() {
    try {
      var raw = get(ls(), AUTH_KEY);
      if (!raw) return null;
      var t = JSON.parse(raw);
      if (t && t.currentSession) t = t.currentSession;   // older supabase-js shape
      if (t && t.access_token && (!t.expires_at || t.expires_at * 1000 > Date.now() + 10000)) return t.access_token;
    } catch (e) {}
    return null;
  }

  function track(step) {
    try {
      if (STEPS.indexOf(step) === -1) return Promise.resolve(false);
      var sent = sentList();
      if (sent.indexOf(step) !== -1) return Promise.resolve(false);   // one row per step per session
      sent.push(step);
      set(ss(), 'bb_fs_sent', sent.join(','));
      set(ls(), 'bb_fs_carry', JSON.stringify({ id: state.id, code: state.code, t: Date.now() }));

      var path = '';
      try { path = String(root.location.pathname || '').slice(0, 120); } catch (e) {}
      var headers = { 'Content-Type': 'application/json', apikey: ANON };
      var tok = userToken();
      if (tok) headers.Authorization = 'Bearer ' + tok;
      if (typeof root.fetch !== 'function') return Promise.resolve(false);
      return root.fetch(URL_BASE + '/rest/v1/rpc/log_funnel_event', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ p_session: state.id, p_step: step, p_code: state.code, p_path: path }),
        keepalive: true,
        credentials: 'omit'
      }).then(function (r) { return !!(r && r.ok); }, function () { return false; });
    } catch (e) {
      return Promise.resolve(false);
    }
  }

  root.bbFunnel = { track: track, sessionId: function () { return state.id; }, code: function () { return state.code; } };

  try {
    var me = root.document && root.document.currentScript;
    var auto = me && me.getAttribute('data-bb-step');
    if (state.fromUrl) track('scan_landing');
    if (auto) track(auto);
  } catch (e) {}
})(window);
