require('dotenv/config');
const { Client, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const query = require('./utils/mysql').query;
const queries = require('./utils/mysql-queries');

const client = new Client({
  intents: 'Guilds',
});

client.commands = new Collection();

client.once('ready', async () => {
  console.log('The client is ready!');

  // Set Commands
  const commandsPath = path.join(__dirname, 'commands');
  fs.readdirSync(commandsPath).forEach((filePath) => {
    const command = require(path.join(commandsPath, filePath));

    client.commands.set(command.data.name, command);
  });

  // Set slash commands
  const globalCommands = Array.from(client.commands.values())
    .filter((c) => !c?.options?.private)
    .map((c) => c.data.toJSON());

  const privateCommands = Array.from(client.commands.values())
    .filter((c) => c?.options?.private)
    .map((c) => c.data.toJSON());

  await client.application.commands.set(globalCommands);

  await client.guilds.fetch(process.env.GUILD_ID).then((guild) => {
    guild.commands.set(privateCommands);
  });

  // MySQL Migrations
  await query(
    `CREATE TABLE IF NOT EXISTS _migrations (id VARCHAR(255) PRIMARY KEY);`,
  );

  const migrationsPath = path.join(__dirname, 'migrations');
  fs.readdirSync(migrationsPath).forEach(async (file) => {
    const filePath = path.join(migrationsPath, file);

    const [res] = await query('SELECT * FROM _migrations WHERE id = ?', [
      filePath,
    ]);

    if (!res) {
      const sql = fs.readFileSync(filePath, 'utf-8');
      await query(sql);
      await query('INSERT INTO _migrations VALUES (?)', [filePath]);

      console.log(`Migration Ran: ${path.basename(filePath)}`);
    }
  });
});

client.on('interactionCreate', async (inteaction) => {
  if (inteaction.isChatInputCommand()) {
    const { user, commandName } = inteaction;

    const command = client.commands.get(commandName);

    // create a user account
    await queries.createUser(user.id);

    await command.run(client, inteaction);

    await query('UPDATE users SET commandsRan = commandsRan + 1 WHERE id = ?', [
      user.id,
    ]);
  }
});

client.login(process.env.TOKEN);
