const query = require('../utils/mysql').query;
const { EmbedBuilder, SlashCommandBuilder, codeBlock } = require('discord.js');

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

    const data = [
      { column: 'Uptime', value: formatDuration(client.uptime) },
      { column: 'Total User Count', value: userCount.toLocaleString() },
      {
        column: 'Total Commands Ran',
        value: (Number(commandCount) + 1).toLocaleString(),
      },
    ];

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `${client.user.displayName}'s Stats`,
        iconURL: client.user.displayAvatarURL(),
      })
      .setDescription(codeBlock(generateTable(data)))
      .setColor('Random')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};

function generateTable(data) {
  const maxColumnLength = Math.max(...data.map((row) => row.column.length));
  const maxValueLength = Math.max(...data.map((row) => row.value.length));

  let tableString = '';
  data.forEach((row) => {
    const columnPadding = ' '.repeat(maxColumnLength - row.column.length);
    const valuePadding = ' '.repeat(maxValueLength - row.value.length);
    tableString += `${row.column}${columnPadding} : ${row.value}${valuePadding}\n`;
  });

  return tableString;
}
