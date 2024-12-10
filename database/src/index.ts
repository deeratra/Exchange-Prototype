import { Client } from "pg";
import { createClient } from "redis";
import { DbMessage } from "./types";
require("dotenv").config();

const pgClient = new Client({
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});


async function main() {
  const redisClient = createClient();
  await pgClient.connect();
  await redisClient.connect();
  console.log("connected to redis");

  while (true) {
    const response = await redisClient.rPop("db_processor" as string);
    if (!response) {
    } else {
      const data: DbMessage = JSON.parse(response);
      if (data.type === "TRADE_ADDED") {
        console.log("adding data");
        console.log(data);
        const price = data.data.price;
        const timestamp = new Date(data.data.timestamp);
        const query = "INSERT INTO tata_prices (time, price) VALUES ($1, $2)";
        // TODO: How to add volume?
        const values = [timestamp, price];
        await pgClient.query(query, values);
      }
    }
  }
}

main();
