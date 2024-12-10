import { WebSocket } from "ws";
import { IncomingMessage, SUBSCRIBE, UNSUBSCRIBE } from "./types/in";
import { SubscriptionManager } from "./SubscriptionManager";
import { OutgoingMessage } from "./types/out";

export class User {
  private id: string;
  private ws: WebSocket;

  constructor(id: string, ws: WebSocket) {
    this.id = id;
    this.ws = ws;
    this.addListeners();
  }

  private subscriptions: string[] = [];

  public subscribe(channel: string) {
    this.subscriptions.push(channel);
  }

  public unsubscribe(channel: string) {
    this.subscriptions = this.subscriptions.filter((sub) => sub !== channel);
  }

  emit(message: OutgoingMessage) {
    this.ws.send(JSON.stringify(message));
}

  private addListeners() {
    this.ws.on("message", (message: string) => {
      const parsedMessage: IncomingMessage = JSON.parse(message);
      if (parsedMessage.method === SUBSCRIBE) {
        parsedMessage.params.forEach((channel) => {
          SubscriptionManager.getInstance().subscribe(channel, this.id);
        });
      }
      if (parsedMessage.method === UNSUBSCRIBE) {
        parsedMessage.params.forEach((channel) => {
          SubscriptionManager.getInstance().unsubscribe(channel, this.id);
        });
      }
    });
  }
}
