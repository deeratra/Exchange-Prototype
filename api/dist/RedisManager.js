"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisManager = void 0;
const redis_1 = require("redis");
class RedisManager {
    constructor() {
        this.client = (0, redis_1.createClient)(); // Listen to the subscription of the pubsub
        this.client.connect();
        this.publisher = (0, redis_1.createClient)(); // Push something to the queue
        this.publisher.connect();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new RedisManager();
        }
        return this.instance;
    }
    sendAndAwait(message) {
        return new Promise((resolve) => {
            const id = this.getRandomClientId();
            this.client.subscribe(id, (message) => {
                this.client.unsubscribe(id);
                resolve(JSON.parse(message));
            });
            this.publisher.lPush("messages", JSON.stringify({ clientId: id, message }));
        });
    }
    getRandomClientId() {
        return (Math.random().toString(36).substring(5, 15) +
            Math.random().toString(36).substring(3, 15));
    }
}
exports.RedisManager = RedisManager;
