const { Client } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: true,
  },
});

async function Connection() {
  try {
    await client.connect();
    const result = await client.query("SELECT NOW()");
    console.log("Database connection successful:", result.rows[0].now);
    return true;
  } catch (error) {
    console.log("Database connection failed", error);
    return false;
  }
}

module.exports = { Connection, client };
