/* BuildBio start-builder draft (bb_draft_v1).
   Shared by start.html (writes the draft while a visitor builds without an
   account) and welcome.html (publishes it once the account exists). Also
   loadable in Node for the unit test (module.exports).

   Shape: { version:1, savedAt, vehicle:{year,make,model,trim,color},
            photo:{dataUrl,name}|null,
            mods:[{category,brand,part,notes,rating,photo:{dataUrl}|null}],
            photosDropped?, localOnly?, publish?:{key,vehicleId,photoDone,modsDone} }

   Every storage access is wrapped: if localStorage is blocked (private mode,
   quota, disabled) the builder keeps working and the draft simply is not kept. */
(function (root) {
  'use strict';

  var KEY = 'bb_draft_v1';
  var MAX_CHARS = Math.floor(4.5 * 1024 * 1024);   // ~4.5 MB of serialized JSON
  var PHOTO_MAX = 1600, PHOTO_FALLBACK_MAX = 1200, JPEG_Q = 0.82;

  function storage() {
    try { var s = root.localStorage; return s || null; } catch (e) { return null; }
  }

  function read() {
    var s = storage(); if (!s) return null;
    try {
      var raw = s.getItem(KEY); if (!raw) return null;
      var d = JSON.parse(raw);
      if (!d || d.version !== 1 || !d.vehicle || !Array.isArray(d.mods)) return null;
      return d;
    } catch (e) { return null; }
  }

  function serialize(d) { return JSON.stringify(d); }

  /* Write a draft that has already been fitted. Returns true on success. */
  function writeRaw(d) {
    var s = storage(); if (!s) return false;
    try { s.setItem(KEY, serialize(d)); return true; } catch (e) { return false; }
  }

  function clear() {
    var s = storage(); if (!s) return false;
    try { s.removeItem(KEY); return true; } catch (e) { return false; }
  }

  /* Size cap. Pure apart from the optional shrinkProfile(dataUrl, maxSide)
     callback (canvas in the browser, a stub in the Node test), which may
     return a value or a Promise. Order: drop mod photos, then re-encode the
     profile photo at 1200px, then (last resort) drop the profile photo.
     Always resolves to a draft whose serialized length is <= cap. */
  function fit(draft, opts) {
    opts = opts || {};
    var cap = opts.cap || MAX_CHARS;
    var d = JSON.parse(serialize(draft));            // never mutate the caller's object
    if (serialize(d).length <= cap) return Promise.resolve(d);

    d.mods.forEach(function (m) { if (m.photo) { m.photo = null; d.photosDropped = true; } });
    if (serialize(d).length <= cap) return Promise.resolve(d);

    var step = (d.photo && d.photo.dataUrl && opts.shrinkProfile)
      ? Promise.resolve(opts.shrinkProfile(d.photo.dataUrl, PHOTO_FALLBACK_MAX)).then(function (u) {
          if (u) d.photo.dataUrl = u;
          d.photosDropped = true;
        }, function () {})
      : Promise.resolve();
    return step.then(function () {
      if (serialize(d).length <= cap) return d;
      if (d.photo) { d.photo = null; d.photosDropped = true; }
      return d;
    });
  }

  function save(draft, opts) {
    return fit(draft, opts).then(function (d) { return writeRaw(d) ? d : null; }, function () { return null; });
  }

  function hasVehicle(d) { return !!(d && d.vehicle && d.vehicle.year && d.vehicle.make && d.vehicle.model); }
  function publishableMods(d) { return (d && d.mods || []).filter(function (m) { return m && m.part && String(m.part).trim(); }); }
  function hasContent(d) {
    if (!d) return false;
    var v = d.vehicle || {};
    return !!(v.year || v.make || v.model || v.trim || v.color || d.photo || publishableMods(d).length);
  }

  function relativeTime(ts, now) {
    now = now || Date.now();
    var s = Math.max(0, Math.round((now - ts) / 1000));
    if (!isFinite(s)) return 'earlier';
    if (s < 60) return 'a moment ago';
    var m = Math.round(s / 60); if (m < 60) return m + (m === 1 ? ' minute ago' : ' minutes ago');
    var h = Math.round(m / 60); if (h < 24) return h + (h === 1 ? ' hour ago' : ' hours ago');
    var dd = Math.round(h / 24); if (dd < 7) return dd === 1 ? 'yesterday' : dd + ' days ago';
    var w = Math.round(dd / 7); return w === 1 ? 'last week' : w + ' weeks ago';
  }

  /* ---- browser-only helpers ---- */

  /* Downscale an image (data URL) to JPEG with longest side <= maxSide. Resolves
     with the new data URL, or the original if the browser cannot decode it. */
  function downscaleDataUrl(src, maxSide, quality) {
    return new Promise(function (ok) {
      var img = new root.Image();
      img.onload = function () {
        try {
          var w = img.naturalWidth, h = img.naturalHeight;
          var k = Math.min(1, (maxSide || PHOTO_MAX) / Math.max(w, h));
          var c = root.document.createElement('canvas');
          c.width = Math.max(1, Math.round(w * k)); c.height = Math.max(1, Math.round(h * k));
          var ctx = c.getContext('2d');
          ctx.fillStyle = '#000'; ctx.fillRect(0, 0, c.width, c.height);   // PNG transparency -> black, not JPEG grey
          ctx.drawImage(img, 0, 0, c.width, c.height);
          ok(c.toDataURL('image/jpeg', quality || JPEG_Q));
        } catch (e) { ok(src); }
      };
      img.onerror = function () { ok(src); };
      img.src = src;
    });
  }

  function fileToDataUrl(file) {
    return new Promise(function (ok, no) {
      var r = new root.FileReader();
      r.onload = function (e) { ok(e.target.result); };
      r.onerror = function () { no(r.error); };
      r.readAsDataURL(file);
    });
  }

  function downscaleFile(file, maxSide) {
    return fileToDataUrl(file).then(function (u) { return downscaleDataUrl(u, maxSide || PHOTO_MAX, JPEG_Q); });
  }

  /* data: URL -> Blob without fetch() (the production CSP connect-src does not
     allow data: URLs, so fetch(dataUrl) would be blocked). */
  function dataUrlToBlob(u) {
    var m = /^data:([^;,]+)?(;base64)?,(.*)$/.exec(u || '');
    if (!m) throw new Error('bad data url');
    var type = m[1] || 'application/octet-stream';
    var bin = m[2] ? root.atob(m[3]) : decodeURIComponent(m[3]);
    var arr = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new root.Blob([arr], { type: type });
  }

  function norm(s) { return String(s || '').toLowerCase().replace(/&|\band\b|\//g, ' ').replace(/[^a-z0-9]+/g, ' ').trim(); }

  /* Publish the draft for a signed-in user. Mirrors vehicle/new.html (create_vehicle
     RPC + images bucket + primary_photo) and vehicle/mod/new.html (modifications
     insert). Progress is written back into the draft after every step, so a retry
     never creates a second vehicle or a duplicate mod. Resolves { vehicleId,
     photoSkipped }; rejects with an Error whose .step names the failed step.
     opts.skipPhoto publishes without the profile photo. opts.existingVehicle
     ({id, primary_photo}) adds to a vehicle the account already has. */
  function publish(sb, user, draft, onProgress, opts) {
    opts = opts || {};
    var say = onProgress || function () {};
    var d = draft;
    d.publish = d.publish || {};
    var P = d.publish;
    function persist() { writeRaw(d); }
    function fail(step, msg) { var e = new Error(msg); e.step = step; throw e; }

    return Promise.resolve().then(function () {
      if (P.vehicleId) return { id: P.vehicleId, primary_photo: P.hadPhoto ? 'x' : null };
      if (opts.existingVehicle) {
        P.vehicleId = opts.existingVehicle.id; P.hadPhoto = !!opts.existingVehicle.primary_photo; persist();
        return opts.existingVehicle;
      }
      if (!hasVehicle(d)) fail('vehicle', 'Your build needs a year, make and model before it can be published.');
      say('Creating your vehicle profile...');
      var v = d.vehicle;
      var slug = (v.year + '-' + v.make + '-' + v.model + '-' + Date.now().toString(36)).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      P.key = P.key || root.crypto.randomUUID();
      persist();
      return sb.rpc('create_vehicle', {
        p_year: String(v.year), p_make: v.make, p_model: v.model,
        p_trim: v.trim || null, p_color: v.color || null, p_nickname: null,
        p_slug: slug, p_idempotency_key: P.key
      }).then(function (r) {
        if (r.error) fail('vehicle', /vehicle_cap_reached/.test(r.error.message)
          ? 'Your account already has its vehicle profile. Additional vehicle profiles are coming soon.'
          : r.error.message);
        P.vehicleId = r.data.id; P.hadPhoto = false; persist();
        return r.data;
      });
    }).then(function (vehicle) {
      var vid = vehicle.id;
      var photoSkipped = false;
      var photoStep = Promise.resolve();
      if (!P.photoDone && d.photo && d.photo.dataUrl && !opts.skipPhoto && !P.hadPhoto) {
        say('Uploading your profile photo...');
        var blob;
        try { blob = dataUrlToBlob(d.photo.dataUrl); } catch (e) { fail('photo', 'Your saved photo could not be read.'); }
        var type = blob.type || 'image/jpeg';
        var ext = type === 'image/png' ? 'png' : type === 'image/webp' ? 'webp' : 'jpg';
        // Same path pattern as vehicle/new.html. If storage policy rejects it
        // (policy in repo migrations scopes the 2nd folder to the user id),
        // retry under vehicles/<uid>/ which that policy allows.
        // vehicles/<uid>/ is the path production storage RLS accepts (verified live 2026-10-23);
        // the vehicle-id path is kept only as a fallback in case the policy changes.
        var paths = ['vehicles/' + user.id + '/' + vid + '-0.' + ext, 'vehicles/' + vid + '/0.' + ext];
        var tryUpload = function (i) {
          return sb.storage.from('images').upload(paths[i], blob, { contentType: type, upsert: true }).then(function (r) {
            if (!r.error) return paths[i];
            if (i + 1 < paths.length) return tryUpload(i + 1);
            fail('photo', 'Your profile photo could not be uploaded (' + r.error.message + ').');
          });
        };
        photoStep = tryUpload(0).then(function (path) {
          var url = sb.storage.from('images').getPublicUrl(path).data.publicUrl;
          return sb.from('vehicles').update({ primary_photo: url }).eq('id', vid).then(function (r) {
            if (r.error) fail('photo', r.error.message);
            P.photoDone = true; persist();
          });
        });
      } else if (d.photo && opts.skipPhoto) { photoSkipped = true; }

      return photoStep.then(function () {
        var mods = publishableMods(d);
        if (!mods.length) return null;
        return sb.from('mod_categories').select('name').then(function (r) { return (r && r.data) || []; }, function () { return []; });
      }).then(function (cats) {
        var mods = publishableMods(d);
        var byNorm = {};
        (cats || []).forEach(function (c) { byNorm[norm(c.name)] = c.name; });
        P.modsDone = P.modsDone || 0;
        var chain = Promise.resolve();
        mods.forEach(function (m, i) {
          chain = chain.then(function () {
            if (i < P.modsDone) return;
            say('Adding mod ' + (i + 1) + ' of ' + mods.length + '...');
            var cat = m.category || 'Other';
            return sb.from('modifications').insert({
              vehicle_id: vid,
              category: byNorm[norm(cat)] || cat,
              brand: (m.brand && String(m.brand).trim()) || null,
              product_name: String(m.part).trim(),
              part_number: null,
              notes: (m.notes && String(m.notes).trim()) || null
            }).then(function (r) {
              if (r.error) fail('mods', 'Mod ' + (i + 1) + ' could not be saved (' + r.error.message + ').');
              P.modsDone = i + 1; persist();
            });
          });
        });
        return chain;
      }).then(function () { return { vehicleId: vid, photoSkipped: photoSkipped }; });
    });
  }

  var api = {
    KEY: KEY, MAX_CHARS: MAX_CHARS, PHOTO_MAX: PHOTO_MAX, PHOTO_FALLBACK_MAX: PHOTO_FALLBACK_MAX, JPEG_Q: JPEG_Q,
    read: read, save: save, writeRaw: writeRaw, clear: clear, fit: fit, serialize: serialize,
    hasVehicle: hasVehicle, hasContent: hasContent, publishableMods: publishableMods, relativeTime: relativeTime,
    downscaleDataUrl: downscaleDataUrl, downscaleFile: downscaleFile, dataUrlToBlob: dataUrlToBlob,
    publish: publish, _norm: norm
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.BBDraft = api;
})(typeof window !== 'undefined' ? window : globalThis);
