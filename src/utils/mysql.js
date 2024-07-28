require('dotenv/config');
const mysql = require('mysql2');

const config = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  multipleStatements: true,
};

const pool = mysql.createPool(config);

exports.getCon = function () {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, con) => {
      if (err) return reject(err);

      resolve(con);
    });
  });
};

exports.query = function (sql, variables = []) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, con) => {
      if (err) return reject(err);

      con.query(sql, variables, (err, rows) => {
        if (err) return reject(err);

        resolve(rows);

        con.release();
      });
    });
  });
};
