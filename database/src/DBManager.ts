import { Client } from "pg";
import { DbMessage } from "./types";
require("dotenv").config();

export class DBManager {
  // create a singleton instance
  private static instance: DBManager;
  private client: Client;

  private constructor() {
    this.client = new Client({
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
    });
    this.client
      .connect()
      .then(() => console.log("Database connected successfully"))
      .catch((err) => console.error("Database connection error", err));
  }

  public static getInstance(): DBManager {
    if (!this.instance) {
      this.instance = new DBManager();
    }
    return this.instance;
  }
  // Connec the client

  async processData(data: DbMessage) {
    switch (data.type) {
      case "TRADE_ADDED":
        try {
          // Check with a function that market exist, if not create it
          console.log("Processing trade data", data.data);
          const market = data.data.market;
          const trade = data.data;
          const marketName = market.split("_")[0].toLowerCase();
          await this.checkMarket(market);
          const insertQuery = `
          INSERT INTO trades (trade_id, market_id, price, quantity, is_buyer_maker, timestamp)
          VALUES ($1, 
                  (SELECT market_id FROM markets WHERE market = $2), 
                  $3, $4, $5, $6)
        `;

          await this.client.query(insertQuery, [
            trade.id,
            market,
            trade.price,
            trade.quantity,
            trade.isBuyerMaker,
            new Date(trade.timestamp),
          ]);
          console.log("Trade inserted successfully");
        } catch (e) {
          console.log("Getting error", e);
        }
        break;
    }
  }

  //Checking if there is no market in the database and if not create it
  private async checkMarket(market: string) {
    const baseAsset = market.split("_")[0];
    const quoteAsset = market.split("_")[1];
    const query = `SELECT * FROM markets WHERE market = '${market}'`;
    const response = await this.client.query(query);
    if (response.rows.length === 0) {
      const insertQuery = `
      INSERT INTO markets (base_asset, quote_asset, market)
      VALUES ($1, $2, $3)
    `;
      await this.client.query(insertQuery, [baseAsset, quoteAsset, market]);
      console.log(`Market ${market} created successfully`);
    } else {
      console.log(`Market ${market} already exists.`);
    }
  }
}
