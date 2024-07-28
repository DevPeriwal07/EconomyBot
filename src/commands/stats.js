const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('See stats of the bot.'),
  options: {
    private: true,
  },
  async run(client, interaction) {
    const embed = new EmbedBuilder()
      .setDescription(`**Uptime:** ${client.uptime}ms`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
