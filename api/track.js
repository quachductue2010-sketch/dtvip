const { ALLOWED_GAME_IDS, getClientIp, getConfig, hashIp, apiHeaders, send } = require('./_lib');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'Method not allowed' });

  try {
    const { url, key, secret } = getConfig();
    const ip = getClientIp(req);
    if (!ip) return send(res, 400, { ok: false, error: 'Không xác định được IP.' });

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const gameId = String(body.gameId || '').trim();
    if (!ALLOWED_GAME_IDS.has(gameId)) return send(res, 400, { ok: false, error: 'Game không hợp lệ.' });

    const ipHash = hashIp(ip, secret);
    const now = new Date().toISOString();
    const endpoint = `${url}/rest/v1/ip_game_usage?on_conflict=ip_hash,game_id`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        ...apiHeaders(key),
        Prefer: 'resolution=merge-duplicates,return=minimal'
      },
      body: JSON.stringify({ ip_hash: ipHash, game_id: gameId, last_seen: now })
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error('Supabase track error:', response.status, detail);
      return send(res, 500, { ok: false, error: 'Không ghi được dữ liệu kiểm tra.' });
    }

    return send(res, 200, { ok: true });
  } catch (error) {
    console.error(error);
    return send(res, 500, { ok: false, error: error.code === 'CONFIG_MISSING' ? error.message : 'Lỗi máy chủ.' });
  }
};
