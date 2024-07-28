const query = require('../utils/mysql').query;
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

const formatDuration = (ms) => {
  if (ms < 0) ms = -ms;
  const time = {
    d: Math.floor(ms / 86_400_000),
    h: Math.floor(ms / 3_600_000) % 24,
    m: Math.floor(ms / 60_000) % 60,
    s: Math.floor(ms / 1_000) % 60,
    ms: Math.floor(ms) % 1_000,
  };
  return Object.entries(time)
    .filter((val) => val[1] !== 0)
    .map(([key, val]) => `${val}${key}`)
    .join(', ');
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('See stats of the bot.'),
  options: {
    private: true,
  },
  async run(client, interaction) {
    const [{ userCount }] = await query(
      'SELECT COUNT(id) AS userCount FROM users;',
    );
    const [{ commandCount }] = await query(
      'SELECT SUM(commandsRan) AS commandCount FROM users;',
    );

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `${client.user.displayName}'s Stats`,
        iconURL: client.user.displayAvatarURL(),
      })
      .setDescription(
        `**Uptime:** ${formatDuration(client.uptime)}\n` +
          `**Total User Count:** ${userCount.toLocaleString()}\n` +
          `**Total Commands Ran:** ${commandCount.toLocaleString()}`,
      )
      .setColor('Random')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
