const { getClientIp, send } = require('./_lib');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return send(res, 405, { ok: false, error: 'Method not allowed' });
  const ip = getClientIp(req);
  return send(res, 200, { ok: true, ip: ip || null });
};
