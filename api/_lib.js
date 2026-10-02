const crypto = require('crypto');
const games = require('../games.json');

const ALLOWED_GAME_IDS = new Set(games.flatMap(group => group.games.map(game => game.id)));

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) return forwarded.split(',')[0].trim();
  if (Array.isArray(forwarded) && forwarded.length) return String(forwarded[0]).split(',')[0].trim();
  const real = req.headers['x-real-ip'];
  if (real) return String(real).trim();
  return req.socket?.remoteAddress || '';
}

function getConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  const secret = process.env.IP_HASH_SECRET;
  if (!url || !key || !secret) {
    const error = new Error('Server chưa cấu hình SUPABASE_URL, SUPABASE_SECRET_KEY hoặc IP_HASH_SECRET.');
    error.code = 'CONFIG_MISSING';
    throw error;
  }
  return { url: url.replace(/\/$/, ''), key, secret };
}

function hashIp(ip, secret) {
  return crypto.createHmac('sha256', secret).update(ip).digest('hex');
}

function apiHeaders(key) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json'
  };
}

function send(res, status, data) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.status(status).json(data);
}

module.exports = { ALLOWED_GAME_IDS, getClientIp, getConfig, hashIp, apiHeaders, send };
