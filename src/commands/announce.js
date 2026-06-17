// ─── /announce ────────────────────────────────────────────────────────────
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Kirim pengumuman ke channel announcements (Admin only)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption(opt => opt
      .setName('message')
      .setDescription('Isi pengumuman')
      .setRequired(true)
    )
    .addStringOption(opt => opt
      .setName('title')
      .setDescription('Judul pengumuman (opsional, default: "Pengumuman")')
      .setRequired(false)
    )
    .addBooleanOption(opt => opt
      .setName('ping')
      .setDescription('Ping @everyone? (default: tidak)')
      .setRequired(false)
    ),

  async execute(interaction, { state }) {
    const message = interaction.options.getString('message');
    const title   = interaction.options.getString('title') || 'Pengumuman';
    const ping    = interaction.options.getBoolean('ping') ?? false;

    const channelId = process.env.ANNOUNCE_CHANNEL_ID;
    const channel   = channelId
      ? interaction.guild.channels.cache.get(channelId)
      : interaction.channel;

    if (!channel) {
      await interaction.reply({
        content: '❌ Channel announcements tidak ditemukan. Isi `ANNOUNCE_CHANNEL_ID` di `.env` dulu.',
        ephemeral: true,
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(0xFFD700)
      .setTitle(`📢 ${title}`)
      .setDescription(message)
      .setAuthor({
        name: interaction.user.displayName,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setTimestamp();

    await channel.send({
      content: ping ? '@everyone' : undefined,
      embeds: [embed],
    });

    await interaction.reply({
      content: `✅ Pengumuman berhasil dikirim ke ${channel}!`,
      ephemeral: true,
    });
  },
};
