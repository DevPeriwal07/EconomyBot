const query = require('./mysql').query;

/**
 * A function to create a user account.
 * @param {string} id The user id
 */
exports.createUser = async function (id) {
  await query('INSERT IGNORE INTO users (id) VALUES (?);', [id]);
};
