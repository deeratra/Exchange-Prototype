import { createClient } from "redis";
import { DbMessage } from "./types";
import { DBManager } from "./DBManager";

async function main() {
  const redisClient = createClient();
  await redisClient.connect();
  console.log("connected to redis");

  while (true) {
    const response = await redisClient.brPop("db_processor", 0);
    console.log("Response", response);
    if (!response) {
    } else {
      const data: DbMessage = JSON.parse(response.element);
      console.log("Data", data);
      // Call DBManager to process the data
      try {
        DBManager.getInstance().processData(data);
      } catch (e) {
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
}
console.log("Starting db processor");

main();
