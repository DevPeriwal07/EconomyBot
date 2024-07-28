const query = require('../utils/mysql').query;
const createUser = require('../utils/mysql-queries').createUser;
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Shows your balance.')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('The user whose balance you want to see.')
        .setRequired(false),
    ),
  async run(client, interaction) {
    const targetUser = interaction.options.getUser('user') || interaction.user;

    let [userData] = await query(
      'SELECT coins, bank, bankSpace FROM users WHERE id = ?',
      [targetUser.id],
    );

    // Check if user a account exists if not create one and fetch it.
    if (!userData) {
      await createUser(targetUser.id);

      [userData] = await query(
        'SELECT coins, bank, bankSpace FROM users WHERE id = ?',
        [targetUser.id],
      );
    }

    const author = {
      name: `${targetUser.displayName}'s Balance`,
      iconURL: targetUser.displayAvatarURL(),
    };

    const embed = new EmbedBuilder()
      .setAuthor(author)
      .setDescription(
        `**Wallet:** ${userData.coins.toLocaleString()}\n` +
          `**Bank:** ${userData.bank.toLocaleString()} / ${userData.bankSpace.toLocaleString()}\n`,
      )
      .setColor('Orange')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
