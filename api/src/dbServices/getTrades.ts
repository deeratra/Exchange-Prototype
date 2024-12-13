import { Client } from "pg";
require("dotenv").config();

const client = new Client({
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

// Ensure the client connects once and is reused
client.connect()
  .then(() => console.log("Database connected"))
  .catch((err) => console.error("Database connection error:", err));

export async function getTrades(market: string) {
  const [baseAsset, quoteAsset] = market.split("_").map((s) => s.toLowerCase());

  try {
    // Dynamically fetch market_id
    const marketQuery = `SELECT market_id FROM markets WHERE market = $1`;
    const marketResponse = await client.query(marketQuery, [market]);

    if (marketResponse.rows.length === 0) {
      console.error(`Market ${market} not found.`);
      return [];
    }

    const marketId = marketResponse.rows[0].market_id;

    // Fetch trades for the market
    const tradeQuery = `SELECT * FROM trades WHERE market_id = $1 ORDER BY timestamp DESC LIMIT 100`;
    const tradeResponse = await client.query(tradeQuery, [marketId]);

    return tradeResponse.rows;
  } catch (e) {
    console.error("Error fetching trades:", e);
    return [];
  }
}
