import { RedisClientType, createClient } from "redis";
import { UserManager } from "./UserManager";

export class SubscriptionManager {
  private static instance: SubscriptionManager;

  // Subscription from userId to channels
  private subscriptions: Map<string, string[]> = new Map();

  // Efficient lookup to find all users subscribed to a specific channel
  private reverseSubscriptions: Map<string, string[]> = new Map();

  private redisClient: RedisClientType;

  private constructor() {
    this.redisClient = createClient();
    this.redisClient.connect();
  }

  public static getInstance(): SubscriptionManager {
    if (!this.instance) {
      this.instance = new SubscriptionManager();
    }
    return this.instance;
  }

  public subscribe(channel: string, userId: string) {
    // Means that the user is already subscribed to the channel
    if (this.subscriptions.get(userId)?.includes(channel)) {
      return;
    }

    this.subscriptions.set(
      userId,
      (this.subscriptions.get(userId) || []).concat(channel)
    );
    this.reverseSubscriptions.set(
      channel,
      (this.reverseSubscriptions.get(channel) || []).concat(userId)
    );
    console.log("Subscriptions", this.subscriptions);
    console.log("Reverse Subscriptions", this.reverseSubscriptions);
    if (this.reverseSubscriptions.get(channel)?.length === 1) {
      this.redisClient.subscribe(channel, this.redisCallBackHandler.bind(this));
    }
  }

  private redisCallBackHandler(message: string, channel: string) {
    console.log("Channel", channel);
    console.log("Message from Engine", message);
    const parsedMessage = JSON.parse(message);
    console.log("Parsed Message", parsedMessage);
    console.log("Reverse Subscriptions", this.reverseSubscriptions);
    this.reverseSubscriptions.get(channel)?.forEach((userId) => {
      UserManager.getInstance().getUser(userId)?.emit(parsedMessage);
    });
  }
  public unsubscribe(channel: string, userId: string) {
    const subscription = this.subscriptions.get(userId);
    if (subscription) {
      this.subscriptions.set(
        userId,
        subscription.filter((sub) => sub !== channel)
      );
    }
    const reverseSubscriptions = this.reverseSubscriptions.get(channel);
    if (reverseSubscriptions) {
      this.reverseSubscriptions.set(
        channel,
        reverseSubscriptions.filter((sub) => sub !== userId)
      );
      if (this.reverseSubscriptions.get(channel)?.length === 0) {
        this.reverseSubscriptions.delete(channel);
        this.redisClient.unsubscribe(channel);
      }
    }
  }

  public userLeft(userId: string) {
    this.subscriptions.get(userId)?.forEach((channel) => {
      this.unsubscribe(channel, userId);
    });
  }
}
