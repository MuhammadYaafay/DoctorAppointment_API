require('dotenv').config();
const mysql = require('mysql2/promise');

let pool;

async function Connection() {
  try {
    pool = await mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port:process.env.DB_PORT,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // Test query to verify connection
    const [rows] = await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully');

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

module.exports = { Connection, pool };
