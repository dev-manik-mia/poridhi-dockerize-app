const express = require("express");
const { Client } = require("pg");
const redis = require("redis");

const app = express();

const PORT = process.env.PORT || 8080;

const pgClient = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

async function init() {
  try {
    await pgClient.connect();

    await pgClient.query(`
      CREATE TABLE IF NOT EXISTS visits (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await redisClient.connect();

    console.log("Connected to PostgreSQL");
    console.log("Connected to Redis");
  } catch (err) {
    console.error(err);
  }
}

init();

app.get("/", async (req, res) => {
  try {
    await pgClient.query("INSERT INTO visits DEFAULT VALUES");

    const result = await pgClient.query(
      "SELECT COUNT(*) FROM visits"
    );

    let cached = await redisClient.get("visits");

    if (!cached) {
      cached = result.rows[0].count;
      await redisClient.set("visits", cached);
    }

    res.json({
      message: "Backend Running",
      totalVisits: result.rows[0].count,
      cachedVisits: cached,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});