// ─── role-store.js ────────────────────────────────────────────────────────
// Simpan mapping reaction roles ke file JSON (no database needed)

const fs   = require('node:fs');
const path = require('node:path');

const FILE = path.join(__dirname, '../../data/reaction-roles.json');

function load() {
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    if (!fs.existsSync(FILE)) return {};
    return JSON.parse(fs.readFileSync(FILE, 'utf8'));
  } catch { return {}; }
}

function save(data) {
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('[role-store] GAGAL simpan reaction-roles:', err.message);
  }
}

function getMessageRoles(messageId) {
  return load()[messageId] || null;
}

function setMessageRoles(messageId, channelId, emojiRoleMap) {
  const data = load();
  data[messageId] = { channelId, roles: emojiRoleMap };
  save(data);
}

function removeMessage(messageId) {
  const data = load();
  delete data[messageId];
  save(data);
}

function getAllMessages() {
  return load();
}

module.exports = { getMessageRoles, setMessageRoles, removeMessage, getAllMessages };
