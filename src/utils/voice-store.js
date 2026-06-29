// ─── voice-store.js ─────────────────────────────────────────────────────────
// Simpan voice channel terakhir yang bot join (per guild) → buat auto-rejoin
// pas bot nyala lagi. Disimpan ke data/voice-state.json (di-ignore Git).
const fs   = require('node:fs');
const path = require('node:path');

const FILE = path.join(__dirname, '../../data/voice-state.json');

function load() {
  try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); }
  catch { return {}; }
}

function save(data) {
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
  } catch (e) { console.error('⚠️ voice-store save error:', e.message); }
}

function setVoiceChannel(guildId, channelId) {
  const d = load(); d[guildId] = channelId; save(d);
}

function clearVoiceChannel(guildId) {
  const d = load(); delete d[guildId]; save(d);
}

function getVoiceChannel(guildId) {
  return load()[guildId] || null;
}

module.exports = { setVoiceChannel, clearVoiceChannel, getVoiceChannel };
