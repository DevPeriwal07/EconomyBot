const path = require('path');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reload')
    .setDescription('Reload a command.')
    .addStringOption((option) =>
      option.setName('command').setDescription('The command to reload'),
    ),
  options: {
    private: true,
  },
  async run(client, interaction) {
    const commandName = interaction.options.getString('command');

    // delete cached command
    delete require.cache[require.resolve(`./${commandName}.js`)];

    const newCommand = require(`./${commandName}`);
    client.commands.set(newCommand.data.name, newCommand);

    await interaction.reply(`Reload "${commandName}" command.`);
  },
};
