const query = require('./mysql').query;

exports.createUser = async function (id) {
  await query('INSERT IGNORE INTO users (id) VALUES (?);', [id]);
};
