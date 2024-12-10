import { createClient } from "redis";
import { Engine } from "./trade/Engine";

async function main() {
  const redisClient = createClient();
  await redisClient.connect();
  const engine = new Engine();

  while (true) {
    const response = await redisClient.brPop("messages", 0);
    if (!response) {
    } else {
      engine.process(JSON.parse(response.element));
    }
  }
}

main();
