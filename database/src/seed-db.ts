const { Client } = require("pg");
require("dotenv").config();
const client = new Client({
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

async function initializeDB() {
  console.log("Initializing database");
  await client.connect();

  await client.query(`
        DROP TABLE IF EXISTS trades;
        DROP TABLE IF EXISTS markets;
        CREATE TABLE markets (
            market_id SERIAL PRIMARY KEY,
            base_asset VARCHAR(10),  -- e.g., BTC
            quote_asset VARCHAR(10), -- e.g., USD
            market VARCHAR(20) UNIQUE  -- e.g., 'BTC_USD'
        );
        CREATE TABLE trades (
            trade_id VARCHAR(50),
            market_id INT REFERENCES markets(market_id) ON DELETE CASCADE,
            price DOUBLE PRECISION,
            quantity DOUBLE PRECISION,
            is_buyer_maker BOOLEAN,  -- 'buy' or 'sell'
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
        );
        -- Fix: Create the unique index including the 'timestamp' for proper partitioning
        CREATE UNIQUE INDEX trades_unique_index ON trades (trade_id, market_id, timestamp);

        SELECT create_hypertable('trades', 'timestamp', 'market_id', 4);
    `);
  console.log("Query ran successfully");
}

initializeDB();
