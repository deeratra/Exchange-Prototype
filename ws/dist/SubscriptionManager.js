"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionManager = void 0;
const redis_1 = require("redis");
const UserManager_1 = require("./UserManager");
class SubscriptionManager {
    constructor() {
        // Subscription from userId to channels
        this.subscriptions = new Map();
        // Efficient lookup to find all users subscribed to a specific channel
        this.reverseSubscriptions = new Map();
        this.redisClient = (0, redis_1.createClient)();
        this.redisClient.connect();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new SubscriptionManager();
        }
        return this.instance;
    }
    subscribe(channel, userId) {
        var _a, _b;
        // Means that the user is already subscribed to the channel
        if ((_a = this.subscriptions.get(userId)) === null || _a === void 0 ? void 0 : _a.includes(channel)) {
            return;
        }
        this.subscriptions.set(userId, (this.subscriptions.get(userId) || []).concat(channel));
        this.reverseSubscriptions.set(channel, (this.reverseSubscriptions.get(channel) || []).concat(userId));
        console.log("Subscriptions", this.subscriptions);
        console.log("Reverse Subscriptions", this.reverseSubscriptions);
        if (((_b = this.reverseSubscriptions.get(channel)) === null || _b === void 0 ? void 0 : _b.length) === 1) {
            this.redisClient.subscribe(channel, this.redisCallBackHandler.bind(this));
        }
    }
    redisCallBackHandler(message, channel) {
        var _a;
        console.log("Channel", channel);
        console.log("Message from Engine", message);
        const parsedMessage = JSON.parse(message);
        console.log("Parsed Message", parsedMessage);
        console.log("Reverse Subscriptions", this.reverseSubscriptions);
        (_a = this.reverseSubscriptions.get(channel)) === null || _a === void 0 ? void 0 : _a.forEach((userId) => {
            var _a;
            (_a = UserManager_1.UserManager.getInstance().getUser(userId)) === null || _a === void 0 ? void 0 : _a.emit(parsedMessage);
        });
    }
    unsubscribe(channel, userId) {
        var _a;
        const subscription = this.subscriptions.get(userId);
        if (subscription) {
            this.subscriptions.set(userId, subscription.filter((sub) => sub !== channel));
        }
        const reverseSubscriptions = this.reverseSubscriptions.get(channel);
        if (reverseSubscriptions) {
            this.reverseSubscriptions.set(channel, reverseSubscriptions.filter((sub) => sub !== userId));
            if (((_a = this.reverseSubscriptions.get(channel)) === null || _a === void 0 ? void 0 : _a.length) === 0) {
                this.reverseSubscriptions.delete(channel);
                this.redisClient.unsubscribe(channel);
            }
        }
    }
    userLeft(userId) {
        var _a;
        (_a = this.subscriptions.get(userId)) === null || _a === void 0 ? void 0 : _a.forEach((channel) => {
            this.unsubscribe(channel, userId);
        });
    }
}
exports.SubscriptionManager = SubscriptionManager;
