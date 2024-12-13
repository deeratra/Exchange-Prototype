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
client
  .connect()
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

export async function getKLines(
  market: string,
  interval: string,
  startTime: string,
  endTime: string
) {
  if (!market || !startTime || !endTime) {
    throw new Error("Missing required parameters");
  }

  let query;
  switch (interval) {
    case "1m":
      query = `SELECT * FROM klines_1m WHERE market_id = $1 AND bucket >= $2 AND bucket <= $3`;
      break;
    case "1h":
      query = `SELECT * FROM klines_1h WHERE market_id = $1 AND bucket >= $2 AND bucket <= $3`;
      break;
    case "1w":
      query = `SELECT * FROM klines_1w WHERE market_id = $1 AND bucket >= $2 AND bucket <= $3`;
      break;
    default:
      throw new Error("Invalid interval");
  }

  try {
    // const marketId = await getMarketId(market); // Get market_id

    // Query using the correct parameters
    console.log("QUery", query);
    const result = await client.query(query, [
      1, // market_id
      new Date(Number(startTime) * 1000).toISOString(), // Explicitly converted to ISO string
      new Date(Number(endTime) * 1000).toISOString(), // Explicitly converted to ISO string
    ]);
    
    return result.rows.map((x) => ({
      close: x.close,
      end: x.bucket,
      high: x.high,
      low: x.low,
      open: x.open,
      volume: x.volume,
    }));
  } catch (err) {
    console.error(err);
    throw new Error("Error fetching kline data");
  }
}

async function getMarketId(market: string) {
  const result = await client.query(
    "SELECT market_id FROM markets WHERE market_id = $1"
  );
  if (result.rows.length === 0) {
    throw new Error("Market not found");
  }
  return result.rows[0].market_id;
}
