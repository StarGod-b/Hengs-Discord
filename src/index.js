// ─── index.js ─────────────────────────────────────────────────────────────
// Discord Bot Henzzz — entry point
//
// Cara pakai:
// 1. Isi .env (DISCORD_TOKEN, DISCORD_CLIENT_ID, DISCORD_GUILD_ID, dll)
// 2. npm install
// 3. npm run deploy  ← register slash commands (sekali saja)
// 4. npm start       ← jalankan bot

require('dotenv').config();
const {
  Client, GatewayIntentBits, Collection,
  Events, EmbedBuilder, PermissionFlagsBits, ActivityType,
} = require('discord.js');
const fs   = require('node:fs');
const path = require('node:path');
const agent = require('./agent');
const state = require('./state');
const { generateCard } = require('./utils/welcome-card');
const { AttachmentBuilder } = require('discord.js');
const roleStore = require('./utils/role-store');

// ── Client setup ────────────────────────────────────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions, // needed for reaction roles
  ],
});

// ── Load slash commands ──────────────────────────────────────────────────────
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
for (const file of fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'))) {
  const cmd = require(path.join(commandsPath, file));
  if (cmd.data && cmd.execute) {
    client.commands.set(cmd.data.name, cmd);
    console.log(`  📌 Command loaded: /${cmd.data.name}`);
  }
}

// ── Server Stats updater ─────────────────────────────────────────────────────
// Update voice channels yang jadi stat display (member count, bots, dll)
// Discord rate limit: 2 rename per channel per 10 menit — tidak boleh terlalu sering
async function updateServerStats(guild) {
  try {
    const memberCount = guild.memberCount;
    const botCount = guild.members.cache.filter(m => m.user.bot).size;
    const humanCount = memberCount - botCount;
    // Prefix harus sama dengan yang di /admin setup
    const statsMap = {
      '👥・All Members:': `👥・All Members: ${memberCount}`,
      '👤・Members:':     `👤・Members: ${humanCount}`,
      '🤖・Bots:':        `🤖・Bots: ${botCount}`,
    };
    for (const ch of guild.channels.cache.values()) {
      for (const [prefix, newName] of Object.entries(statsMap)) {
        if (ch.name.startsWith(prefix) && ch.name !== newName) {
          await ch.setName(newName).catch(() => {});
          break;
        }
      }
    }
  } catch (e) {
    console.error('⚠️ updateServerStats error:', e.message);
  }
}

// ── Ready ────────────────────────────────────────────────────────────────────
client.once(Events.ClientReady, async (c) => {
  console.log('\n✅ Discord Bot Online!');
  console.log(`   Tag : ${c.user.tag}`);
  console.log(`   ID  : ${c.user.id}`);
  console.log(`   Server: ${c.guilds.cache.map(g => g.name).join(', ')}`);
  console.log('─────────────────────────────────────');
  console.log('Slash commands tersedia:');
  console.log('  /study on [topic] | /study off | /study status');
  console.log('  /scrim on [game]  | /scrim off');
  console.log('  /announce [message]');
  console.log('  /fun quote | /fun 8ball | /fun roll | /fun flip | /fun meme');
  console.log('  Mention bot untuk AI chat!');
  console.log('─────────────────────────────────────\n');

  // Mode mulai OFF — aktifkan manual via /study on atau /scrim on
  // (tidak auto-study seperti WA bot, Discord bot dipakai lebih sosial)

  // Status bot — biar keliatan cara minta bantuan
  c.user.setPresence({
    activities: [{ name: 'mention aku buat ngobrol 🤖 | /fun', type: ActivityType.Listening }],
    status: 'online',
  });

  // Update server stats sekali saat bot nyala
  for (const guild of c.guilds.cache.values()) {
    await updateServerStats(guild).catch(() => {});
  }
});

// ── Welcome member baru ──────────────────────────────────────────────────────
client.on(Events.GuildMemberAdd, async (member) => {
  const channelId = process.env.WELCOME_CHANNEL_ID;
  if (!channelId) return;
  const channel = member.guild.channels.cache.get(channelId);
  if (!channel) return;

  try {
    const cardBuffer = await generateCard(member, 'welcome');
    const ch = (id) => (id ? ` di <#${id}>` : '');
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setDescription(
        `👋 Halo <@${member.id}>! Selamat datang di **${member.guild.name}**! 🎉\n\n` +
        `📜 Baca dulu **rules**${ch(process.env.RULES_CHANNEL_ID)}\n` +
        `🎭 Ambil **role** kamu${ch(process.env.ROLES_CHANNEL_ID)}\n` +
        `📢 Info & pengumuman${ch(process.env.ANNOUNCE_CHANNEL_ID)}\n\n` +
        `Butuh bantuan atau mau ngobrol? Tinggal **mention aku** (@Hengs Bot) ya — atau coba \`/fun\` & \`/study\`! 🤖`
      )
      .setTimestamp();

    if (cardBuffer) {
      const attachment = new AttachmentBuilder(cardBuffer, { name: 'welcome.png' });
      embed.setImage('attachment://welcome.png');
      await channel.send({ embeds: [embed], files: [attachment] });
    } else {
      embed.setTitle(`👋 Selamat datang, ${member.displayName}!`);
      embed.setThumbnail(member.user.displayAvatarURL({ dynamic: true }));
      embed.setFooter({ text: `Member ke-${member.guild.memberCount}` });
      await channel.send({ embeds: [embed] });
    }
  } catch (err) {
    console.error('❌ Welcome card error:', err.message);
  }

  // Update stats
  await updateServerStats(member.guild).catch(() => {});

  // Auto-assign Member role on join — by ID (kalau di-set) atau by nama "Member"
  const memberRoleId = process.env.MEMBER_ROLE_ID;
  const memberRole = (memberRoleId && member.guild.roles.cache.get(memberRoleId))
    || member.guild.roles.cache.find(r => r.name.toLowerCase().replace(/[^a-z]/g, '').includes('member'));
  if (memberRole) {
    await member.roles.add(memberRole)
      .then(() => console.log(`  ✅ Role "${memberRole.name}" → ${member.user.username}`))
      .catch(err => console.error(`  ❌ Gagal kasih role Member: ${err.message} — cek: bot punya izin "Manage Roles" & role BOT harus di ATAS role Member`));
  } else {
    console.log('  ⚠️ Role "Member" nggak ketemu. Bikin role bernama "Member", atau isi MEMBER_ROLE_ID di .env');
  }
});

// ── Leave message ─────────────────────────────────────────────────────────────
client.on(Events.GuildMemberRemove, async (member) => {
  // Bisa ke channel sendiri (LEAVE_CHANNEL_ID), atau default ke welcome channel
  const channelId = process.env.LEAVE_CHANNEL_ID || process.env.WELCOME_CHANNEL_ID;
  if (!channelId) return;
  const channel = member.guild.channels.cache.get(channelId);
  if (!channel) return;

  try {
    const cardBuffer = await generateCard(member, 'leave');
    const embed = new EmbedBuilder()
      .setColor(0xE53935)
      .setDescription(`**${member.user.username}** telah meninggalkan server. Sampai jumpa! 👋`)
      .setTimestamp();

    if (cardBuffer) {
      const attachment = new AttachmentBuilder(cardBuffer, { name: 'leave.png' });
      embed.setImage('attachment://leave.png');
      await channel.send({ embeds: [embed], files: [attachment] });
    } else {
      await channel.send({ embeds: [embed] });
    }
  } catch (err) {
    console.error('❌ Leave card error:', err.message);
  }

  // Update stats
  await updateServerStats(member.guild).catch(() => {});
});

// ── AI Chat via mention ──────────────────────────────────────────────────────
client.on(Events.MessageCreate, async (msg) => {
  if (msg.author.bot) return;
  if (!msg.mentions.has(client.user)) return;

  // Bersihkan mention dari teks
  const text = msg.content
    .replace(/<@!?\d+>/g, '')
    .trim();

  if (!text) {
    await msg.reply('Ada yang bisa aku bantu? Tulis apa yang mau kamu tanya 😊');
    return;
  }

  // Typing indicator biar keliatan lagi "mikir"
  await msg.channel.sendTyping();

  try {
    const reply = await agent.chat(text, msg.author.username);
    // Discord max 2000 karakter per pesan
    await msg.reply(reply.substring(0, 2000));
  } catch (err) {
    console.error('❌ AI error:', err.message);
    await msg.reply('Aduh, lagi error nih. Coba lagi nanti! 🙏');
  }
});

// ── Slash command handler ─────────────────────────────────────────────────────
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // Restrict commands ke BOT_CHANNEL_ID
  // Admin bypass: kalau punya permission Administrator → bisa dari channel manapun (bot-settings, dll)
  // Regular user: harus di BOT_CHANNEL_ID, kecuali /announce dan /admin
  const botChannelId = process.env.BOT_CHANNEL_ID;
  const freeCommands = ['announce', 'admin'];
  const isAdmin = interaction.memberPermissions?.has(PermissionFlagsBits.Administrator) ?? false;
  if (botChannelId && !isAdmin && interaction.channelId !== botChannelId && !freeCommands.includes(interaction.commandName)) {
    await interaction.reply({
      content: `❌ Command hanya bisa dipakai di <#${botChannelId}>!`,
      ephemeral: true,
    });
    return;
  }

  const cmd = client.commands.get(interaction.commandName);
  if (!cmd) {
    await interaction.reply({ content: '❌ Command tidak ditemukan.', ephemeral: true });
    return;
  }

  try {
    await cmd.execute(interaction, { state, agent });
  } catch (err) {
    console.error(`❌ Error di /${interaction.commandName}:`, err);
    const errMsg = { content: '❌ Ada error saat menjalankan command ini.', ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errMsg).catch(() => {});
    } else {
      await interaction.reply(errMsg).catch(() => {});
    }
  }
});

// ── Reaction Roles ─────────────────────────────────────────────────────────
async function handleReaction(reaction, user, add) {
  if (user.bot) return;

  // Fetch partial reactions/messages
  if (reaction.partial) {
    try { await reaction.fetch(); } catch { return; }
  }

  const mapping = roleStore.getMessageRoles(reaction.message.id);
  if (!mapping) return;

  const emoji = reaction.emoji.name;
  const roleId = mapping.roles[emoji];
  if (!roleId) return;

  const guild  = reaction.message.guild;
  const member = await guild.members.fetch(user.id).catch(() => null);
  if (!member) return;

  try {
    if (add) {
      await member.roles.add(roleId);
      console.log(`  ✅ Role added: ${guild.roles.cache.get(roleId)?.name} → ${user.username}`);
    } else {
      await member.roles.remove(roleId);
      console.log(`  ➖ Role removed: ${guild.roles.cache.get(roleId)?.name} → ${user.username}`);
    }
  } catch (err) {
    console.error('❌ Role error:', err.message);
  }
}

client.on(Events.MessageReactionAdd,    (r, u) => handleReaction(r, u, true));
client.on(Events.MessageReactionRemove, (r, u) => handleReaction(r, u, false));

// ── Login ────────────────────────────────────────────────────────────────────
console.log('🚀 Starting Discord Bot...\n');
client.login(process.env.DISCORD_TOKEN);
