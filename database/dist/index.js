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
const redis_1 = require("redis");
const DBManager_1 = require("./DBManager");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const redisClient = (0, redis_1.createClient)();
        yield redisClient.connect();
        console.log("connected to redis");
        while (true) {
            const response = yield redisClient.brPop("db_processor", 0);
            console.log("Response", response);
            if (!response) {
            }
            else {
                const data = JSON.parse(response.element);
                console.log("Data", data);
                // Call DBManager to process the data
                try {
                    DBManager_1.DBManager.getInstance().processData(data);
                }
                catch (e) {
                    console.log("Getting error", e);
                }
                // if (data.type === "TRADE_ADDED") {
                //   console.log("adding data");
                //   console.log(data);
                //   const price = data.data.price;
                //   const timestamp = new Date(data.data.timestamp);
                //   const currency_code = data.data.market.split("_")[0];
                //   const query = "INSERT INTO btc_prices (time, price) VALUES ($1, $2, $3, $4)";
                //   const values = [timestamp, price, volume, currencyCode];
                //   await pgClient.query(query, values);
                // }
            }
        }
    });
}
console.log("Starting db processor");
main();
