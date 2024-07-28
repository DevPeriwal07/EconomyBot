const { codeBlock, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const query = require('../utils/mysql').query;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sql')
    .setDescription('Execute a sql statement via the bot.')
    .addStringOption((option) =>
      option
        .setName('query')
        .setDescription('The SQL statement to run.')
        .setRequired(true),
    ),
  options: {
    private: true,
  },
  async run(client, interaction) {
    const queryString = interaction.options.getString('query');
    const result = await query(queryString);

    const description = codeBlock(JSON.stringify(result, null, 2));

    const embed = new EmbedBuilder().setDescription(description).setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
