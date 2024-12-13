"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DBManager = void 0;
const pg_1 = require("pg");
require("dotenv").config();
class DBManager {
    constructor() {
        this.client = new pg_1.Client({
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
    static getInstance() {
        if (!this.instance) {
            this.instance = new DBManager();
        }
        return this.instance;
    }
    // Connec the client
    processData(data) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (data.type) {
                case "TRADE_ADDED":
                    try {
                        // Check with a function that market exist, if not create it
                        console.log("Processing trade data", data.data);
                        const market = data.data.market;
                        const trade = data.data;
                        const marketName = market.split("_")[0].toLowerCase();
                        yield this.checkMarket(market);
                        const insertQuery = `
          INSERT INTO trades (trade_id, market_id, price, quantity, is_buyer_maker, timestamp)
          VALUES ($1, 
                  (SELECT market_id FROM markets WHERE market = $2), 
                  $3, $4, $5, $6)
        `;
                        yield this.client.query(insertQuery, [
                            trade.id,
                            market,
                            trade.price,
                            trade.quantity,
                            trade.isBuyerMaker,
                            new Date(trade.timestamp),
                        ]);
                        console.log("Trade inserted successfully");
                    }
                    catch (e) {
                        console.log("Getting error", e);
                    }
                    break;
            }
        });
    }
    //Checking if there is no market in the database and if not create it
    checkMarket(market) {
        return __awaiter(this, void 0, void 0, function* () {
            const baseAsset = market.split("_")[0];
            const quoteAsset = market.split("_")[1];
            const query = `SELECT * FROM markets WHERE market = '${market}'`;
            const response = yield this.client.query(query);
            if (response.rows.length === 0) {
                const insertQuery = `
      INSERT INTO markets (base_asset, quote_asset, market)
      VALUES ($1, $2, $3)
    `;
                yield this.client.query(insertQuery, [baseAsset, quoteAsset, market]);
                console.log(`Market ${market} created successfully`);
            }
            else {
                console.log(`Market ${market} already exists.`);
            }
        });
    }
}
exports.DBManager = DBManager;
