"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const in_1 = require("./types/in");
const SubscriptionManager_1 = require("./SubscriptionManager");
class User {
    constructor(id, ws) {
        this.subscriptions = [];
        this.id = id;
        this.ws = ws;
        this.addListeners();
    }
    subscribe(channel) {
        this.subscriptions.push(channel);
    }
    unsubscribe(channel) {
        this.subscriptions = this.subscriptions.filter((sub) => sub !== channel);
    }
    emit(message) {
        this.ws.send(JSON.stringify(message));
    }
    addListeners() {
        this.ws.on("message", (message) => {
            const parsedMessage = JSON.parse(message);
            if (parsedMessage.method === in_1.SUBSCRIBE) {
                parsedMessage.params.forEach((channel) => {
                    SubscriptionManager_1.SubscriptionManager.getInstance().subscribe(channel, this.id);
                });
            }
            if (parsedMessage.method === in_1.UNSUBSCRIBE) {
                parsedMessage.params.forEach((channel) => {
                    SubscriptionManager_1.SubscriptionManager.getInstance().unsubscribe(channel, this.id);
                });
            }
        });
    }
}
exports.User = User;
