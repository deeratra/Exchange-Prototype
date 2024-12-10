import { createClient, RedisClientType } from "redis";
import { MessageToEngine } from "./types/to";
import { MessageFromOrderBook } from "./types";

export class RedisManager {
  private client: RedisClientType;
  private publisher: RedisClientType;
  private static instance: RedisManager;

  private constructor() {
    this.client = createClient(); // Listen to the subscription of the pubsub
    this.client.connect();
    this.publisher = createClient(); // Push something to the queue
    this.publisher.connect();
  }

  public static getInstance(): RedisManager {
    if (!this.instance) {
      this.instance = new RedisManager();
    }
    return this.instance;
  }

  public sendAndAwait(message: MessageToEngine): Promise<MessageFromOrderBook> {
    return new Promise<MessageFromOrderBook>((resolve) => {
      const id = this.getRandomClientId();
      this.client.subscribe(id, (message) => {
        this.client.unsubscribe(id);
        resolve(JSON.parse(message));
      });
      this.publisher.lPush(
        "messages",
        JSON.stringify({ clientId: id, message })
      );
    });
  }
  private getRandomClientId() {
    return (
      Math.random().toString(36).substring(5, 15) +
      Math.random().toString(36).substring(3, 15)
    );
  }
}
