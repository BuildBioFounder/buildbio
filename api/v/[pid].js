const SUPABASE_URL = 'https://bicmwjtkncjkguumbidq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_vt_RE80rfii-6Pb6wtPLhA_t_hyYiTE';

const NO_CACHE = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'Pragma': 'no-cache',
};

module.exports = async (req, res) => {
  const { pid } = req.query;

  if (process.env.BOLO_RESOLVER_KILLSWITCH === 'true') {
    res.writeHead(307, { ...NO_CACHE, Location: '/vehicle-status-unavailable.html' });
    return res.end();
  }

  if (!pid || pid.length < 8) {
    res.writeHead(302, { Location: '/' });
    return res.end();
  }

  try {
    const rpcRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/resolve_vehicle_qr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ p_public_id: pid }),
    });

    if (!rpcRes.ok) {
      res.writeHead(302, { Location: '/' });
      return res.end();
    }

    const rows = await rpcRes.json();

    if (!rows || rows.length === 0) {
      res.writeHead(404, { 'Content-Type': 'text/html', ...NO_CACHE });
      return res.end('<!doctype html><html><head><title>Not Found</title></head><body style="background:#0f0f0f;color:#ccc;font-family:sans-serif;text-align:center;padding:80px"><h1>Vehicle not found</h1><p>This QR code does not match any vehicle.</p><a href="/" style="color:#E85D2C">Return home</a></body></html>');
    }

    const v = rows[0];

    fetch(`${SUPABASE_URL}/rest/v1/qr_scans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({ vehicle_id: v.vehicle_id }),
    }).catch(() => {});

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
    res.writeHead(302, { Location: '/' });
    return res.end();
  }
};
