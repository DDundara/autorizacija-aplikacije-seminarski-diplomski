// const mysql = require('mysql');
// const connection = mysql.createConnection({
//   host: 'localhost',
//   user: 'phpuser',
//   database: 'vuelogin',
//   password: '12345'
// });
// connection.connect();
// module.exports = connection;

const Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'testdb',
  password: 'postgres',
  port: 5432,
})
module.exports = pool;