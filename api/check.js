const { getClientIp, getConfig, hashIp, apiHeaders, send } = require('./_lib');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return send(res, 405, { ok: false, error: 'Method not allowed' });

  try {
    const { url, key, secret } = getConfig();
    const ip = getClientIp(req);
    if (!ip) return send(res, 400, { ok: false, error: 'Không xác định được IP.' });

    const ipHash = hashIp(ip, secret);
    const endpoint = `${url}/rest/v1/ip_game_usage?ip_hash=eq.${encodeURIComponent(ipHash)}&select=game_id,last_seen&order=last_seen.desc`;
    const response = await fetch(endpoint, { headers: apiHeaders(key) });

    if (!response.ok) {
      const detail = await response.text();
      console.error('Supabase check error:', response.status, detail);
      return send(res, 500, { ok: false, error: 'Không đọc được dữ liệu kiểm tra.' });
    }

    const rows = await response.json();
    return send(res, 200, {
      ok: true,
      ip,
      duplicated: rows.length > 0,
      count: rows.length,
      games: rows.map(row => ({ id: row.game_id, lastSeen: row.last_seen }))
    });
  } catch (error) {
    console.error(error);
    return send(res, 500, { ok: false, error: error.code === 'CONFIG_MISSING' ? error.message : 'Lỗi máy chủ.' });
  }
};
