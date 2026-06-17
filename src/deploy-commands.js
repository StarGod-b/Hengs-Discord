// ─── deploy-commands.js ────────────────────────────────────────────────────
// Jalankan SEKALI untuk register slash commands ke Discord:
//   npm run deploy
//
// Kalau kamu tambah/ubah command, jalankan lagi.

require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs   = require('node:fs');
const path = require('node:path');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');

for (const file of fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'))) {
  const cmd = require(path.join(commandsPath, file));
  if (cmd.data) {
    commands.push(cmd.data.toJSON());
    console.log(`  + ${cmd.data.name}`);
  }
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  console.log(`\nRegistering ${commands.length} slash commands ke server...`);
  try {
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.DISCORD_CLIENT_ID,
        process.env.DISCORD_GUILD_ID,
      ),
      { body: commands },
    );
    console.log('✅ Semua commands berhasil didaftarkan!\n');
    console.log('Sekarang jalankan: npm start');
  } catch (err) {
    console.error('❌ Gagal register commands:', err.message);
    if (err.message.includes('Missing Access')) {
      console.error('   → Pastikan bot sudah diundang ke server dengan scope "applications.commands"');
    }
  }
})();
