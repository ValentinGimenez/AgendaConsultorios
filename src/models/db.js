const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  // host: 'bxn7jcxpv6ooxtj4i1vt-mysql.services.clever-cloud.com', 
  // user: 'u85hulfz3w5pfdw7',
  // password: '9QGJa13Rmp7Ge0kF5W65', 
  // database: 'bxn7jcxpv6ooxtj4i1vt' 
  host: 'localhost', 
  user: 'root',
  password: '', 
  database: 'AgendaMedica'
});
module.exports = pool;
