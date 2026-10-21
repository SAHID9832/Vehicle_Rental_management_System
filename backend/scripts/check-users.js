require('dotenv').config();
const pool = require('../src/config/database');

async function listUsers() {
  const [rows] = await pool.query('SELECT u.id, u.email, r.name as role FROM users u JOIN roles r ON r.id = u.role_id');
  console.log('Registered Users:');
  console.table(rows);
  process.exit(0);
}

listUsers();
