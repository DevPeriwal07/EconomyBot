require('dotenv/config');
const { Client, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commands = new Collection();

const client = new Client({
  intents: 'Guilds',
});

client.once('ready', async () => {
  console.log('The client is ready!');

  // Set Commands
  const commandsPath = path.join(__dirname, 'commands');
  fs.readdirSync(commandsPath).forEach((filePath) => {
    const command = require(path.join(commandsPath, filePath));

    commands.set(command.data.name, command);
  });

  // Set slash commands
  const globalCommands = Array.from(commands.values())
    .filter((c) => !c?.options?.private)
    .map((c) => c.data.toJSON());

  const privateCommands = Array.from(commands.values())
    .filter((c) => c?.options?.private)
    .map((c) => c.data.toJSON());

  await client.application.commands.set(globalCommands);

  client.guilds.fetch(process.env.GUILD_ID).then((guild) => {
    guild.commands.set(privateCommands);
  });
});

client.on('interactionCreate', async (inteaction) => {
  if (inteaction.isChatInputCommand()) {
    const { commandName } = inteaction;

    const command = commands.get(commandName);

    await command.run(client, inteaction);
  }
});

client.login(process.env.TOKEN);