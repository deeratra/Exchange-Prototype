/* eslint-disable @typescript-eslint/no-explicit-any */
import { Ticker, Trade } from "./types";

// export const BASE_URL = "wss://ws.backpack.exchange/";
export const BASE_URL = "ws://localhost:3400";

export class SignalingManager {
  private ws: WebSocket;
  private static instance: SignalingManager;
  private initialized: boolean = false;
  private bufferedMessages: any[] = [];
  private callbacks: any = {};
  private id: number;
  private tickerData: Partial<Ticker> | null = null; // Cache for ticker data
  private depthData: { bids: any[]; asks: any[] } | null = null; // Cache for depth data

  private constructor() {
    this.ws = new WebSocket(BASE_URL);
    this.id = 1;
    this.bufferedMessages = [];
    this.init();
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new SignalingManager();
    }
    return this.instance;
  }

  init() {
    this.ws.onopen = () => {
      this.initialized = true;
      this.bufferedMessages.forEach((message) => {
        this.ws.send(JSON.stringify(message));
      });
      this.bufferedMessages = [];
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const type = message.data.e;
      if (this.callbacks[type]) {
        this.callbacks[type].forEach(({ callback }) => {
          if (type === "ticker") {
            const newTicker: Partial<Ticker> = {
              lastPrice: message.data.c,
              high: message.data.h,
              low: message.data.l,
              volume: message.data.v,
              quoteVolume: message.data.V,
              symbol: message.data.s,
            };
            this.tickerData = newTicker;
            callback(newTicker);
          }

          if (type === "depth") {
            const updatedBids = message.data.b;
            const updatedAsks = message.data.a;
            this.depthData = { bids: updatedBids, asks: updatedAsks };
            callback({
              bids: updatedBids,
              asks: updatedAsks,
              lastPrice: this.tickerData?.lastPrice,
            });
          }
          if (type === "trade") {
            console.log("ttass", message.data);
            const trade: Partial<Trade> = {
              price: message.data.p,
              quantity: message.data.q,
              isBuyerMaker: message.data.m,
            };
            callback(trade);
          }
        });
      }
    };
  }

  sendMessage(message: any) {
    const messageToSend = {
      ...message,
      id: this.id++,
    };

    if (!this.initialized) {
      this.bufferedMessages.push(messageToSend);
      return;
    }
    this.ws.send(JSON.stringify(messageToSend));
  }

  async deRegisterCallback(type: string, id: string) {
    if (this.callbacks[type]) {
      const index = this.callbacks[type].findIndex(
        (callback) => callback.id === id
      );
      if (index !== -1) {
        this.callbacks[type].splice(index, 1);
      }
    }
  }

  async registerCallback(type: string, callback: any, id: string) {
    this.callbacks[type] = this.callbacks[type] || [];
    this.callbacks[type].push({ callback, id });
  }
}
