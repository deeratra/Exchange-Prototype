import fs from "fs";
require("dotenv").config();

import {
  CANCEL_ORDER,
  CREATE_ORDER,
  GET_DEPTH,
  GET_OPEN_ORDERS,
  GET_TICKERS,
  GET_TRADES,
  MessageFromApi,
  ON_RAMP,
} from "../types/fromApi";
import { Fill, Order, OrderBook } from "./OrderBook";
import { RedisManager } from "../RedisManager";

interface UserBalance {
  // key is the asset like BTC, ETH, EUR, INR. can be quote or base as well
  [key: string]: {
    available: number;
    locked: number;
  };
}
export class Engine {
  private orderBooks: OrderBook[] = [];
  private balances: Map<string, UserBalance> = new Map();

  constructor() {
    let snapshot = null;
    try {
      console.log("WITH_SNAPSHOT", process.env.WITH_SNAPSHOT);
      if (process.env.WITH_SNAPSHOT) {
        snapshot = fs.readFileSync("./snapshot.json", "utf-8");
      }
    } catch (e) {
      console.log("No snapshot found");
    }

    if (snapshot) {
      const snapshotData = JSON.parse(snapshot);
      this.orderBooks = snapshotData.orderbooks.map(
        (o: any) =>
          new OrderBook(
            o.baseAsset,
            o.bids,
            o.asks,
            o.lastTradeId,
            o.currentPrice
          )
      );
      this.setBaseBalances();
    } else {
      this.orderBooks = [new OrderBook("BTC", [], [], 0, "0")];
      this.orderBooks.push(new OrderBook("SOL", [], [], 0, "0"));
      this.orderBooks.push(new OrderBook("ETH", [], [], 0, "0"));
      this.setBaseBalances();
    }
  }
  process({
    clientId,
    message,
  }: {
    message: MessageFromApi;
    clientId: string;
  }) {
    switch (message.type) {
      case CREATE_ORDER:
        try {
          const data = message.data;
          const { fills, executedQty, orderId } = this.createOrder(
            data.market,
            data.quantity,
            data.price,
            data.side,
            data.userId
          );
          const sanitizedFills: {
            price: string;
            quantity: number;
            tradeId: number;
          }[] = fills.map(({ price, quantity, tradeId }) => ({
            price: price,
            quantity: quantity,
            tradeId: tradeId,
          }));
          RedisManager.getInstance().sendToApi(clientId, {
            type: "ORDER_PLACED",
            payload: {
              orderId,
              executedQty,
              fills: sanitizedFills,
            },
          });
        } catch (e) {
          console.log(e);
          RedisManager.getInstance().sendToApi(clientId, {
            type: "ORDER_CANCELLED",
            payload: {
              orderId: "",
            },
          });
        }
        break;
      case GET_DEPTH:
        try {
          const market = message.data.market;
          const orderBook = this.orderBooks.find(
            (ob) => ob.ticker() === market
          );
          if (!orderBook) throw new Error("Order book not found");
          RedisManager.getInstance().sendToApi(clientId, {
            type: "DEPTH",
            payload: orderBook.getDepth(),
          });
        } catch (e) {
          console.log(e);
        }
        break;
      case CANCEL_ORDER:
        try {
          const market = message.data.market;
          console.log("Market:", market);
          const orderId = message.data.orderId;
          const orderBook = this.orderBooks.find(
            (ob) => ob.ticker() === market
          );
          if (!orderBook) throw new Error("Order book not found");
          const order =
            orderBook.bids.find((order) => order.orderId === orderId) ||
            orderBook.asks.find((order) => order.orderId === orderId);
          if (!order) throw new Error("Order not found");
          if (order.side === "buy") {
            const price = orderBook.cancelBid(order);
          }
          if (order.side === "sell") {
            const price = orderBook.cancelAsk(order);
            const leftQuantity = order.quantity - order.filled;

            // const userBalance = this.balances.get(order.userId);
            // if (userBalance) {
            //   const asset = market.split("_")[0];
            //   if (userBalance[asset]) {
            //     userBalance[asset].available += leftQuantity;
            //   } else {
            //     userBalance[asset] = { available: leftQuantity, locked: 0 };
            //   }
            // }
          }
          RedisManager.getInstance().sendToApi(clientId, {
            type: "ORDER_CANCELLED",
            payload: {
              orderId,
            },
          });
        } catch (e) {
          console.log(e);
        }
        break;
      case GET_TICKERS:
        try {
          const tickers = this.orderBooks.map((ob) => ({
            symbol: ob.ticker(),
            firstPrice: ob.firstPrice,
            high: ob.high,
            low: ob.low,
            lastPrice: ob.lastPrice,
            priceChange: ob.priceChange,
            priceChangePercent: ob.priceChangePercent,
          }));
          RedisManager.getInstance().sendToApi(clientId, {
            type: "TICKERS",
            payload: tickers,
          });
        } catch (e) {
          console.log(e);
        }
        break;
      case GET_OPEN_ORDERS:
        try {
          const market = message.data.market;
          const userId = message.data.userId;
          const orderBook = this.orderBooks.find(
            (ob) => ob.ticker() === market
          );
          if (!orderBook) throw new Error("Order book not found");
          const openOrders = orderBook.getOpenOrders(userId);
          RedisManager.getInstance().sendToApi(clientId, {
            type: "OPEN_ORDERS",
            payload: openOrders,
          });
        } catch (e) {
          console.log(e);
        }
        break;
      case GET_TRADES:
        try{
          const orderBook = this.orderBooks.find((order) => order.ticker() === message.data.market);
          if (!orderBook) throw new Error("Order book not found");
          const trades = orderBook.getTrades();
        }
    }
  }

  createOrder(
    market: string,
    quantity: string,
    price: string,
    side: "buy" | "sell",
    userId: string
  ) {
    const baseAsset = market.split("_")[0];
    const quoteAsset = market.split("_")[1];
    const orderBook = this.orderBooks.find((ob) => ob.ticker() === market);

    if (!orderBook) throw new Error("Order book not found");

    this.checkAndLockFunds(
      baseAsset,
      quoteAsset,
      quantity,
      price,
      side,
      String(userId)
    );

    const order: Order = {
      price: Number(price),
      quantity: Number(quantity),
      orderId:
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15),
      filled: 0,
      side: side,
      userId: String(userId),
    };

    const { fills, executedQty } = orderBook.addOrder(order);
    this.updateBalances(
      String(userId),
      fills,
      baseAsset,
      quoteAsset,
      side,
      executedQty
    );

    this.createDBTrades(fills, market, userId);

    this.publishWSDepthUpdates(fills, price, side, market);
    if (fills.length > 0) {
      // Trade Happened
      // Publish trade updates to WS
      this.publishWSTradeUpdates(fills, side, market, userId);
    }

    return { executedQty, fills, orderId: order.orderId };
  }

  private checkAndLockFunds(
    baseAsset: string,
    quoteAsset: string,
    quantity: string,
    price: string,
    side: "buy" | "sell",
    userId: string
  ) {
    const userBalance = this.balances.get(userId);

    if (userBalance === undefined) {
      throw new Error("User balance not found");
    }
    if (side === "buy") {
      const quoteBalance = userBalance[quoteAsset];
      if (quoteBalance?.available === undefined) {
        throw new Error("Insufficient funds");
      }

      if (quoteBalance.available < Number(quantity) * Number(price)) {
        throw new Error("Insufficient funds");
      }
      quoteBalance.available -= Number(quantity) * Number(price);
      quoteBalance.locked += Number(quantity) * Number(price);
    }

    if (side === "sell") {
      const baseBalance = userBalance[baseAsset];
      if (baseBalance?.available === undefined) {
        throw new Error("Insufficient funds");
      }
      if (baseBalance.available < Number(quantity)) {
        throw new Error("Insufficient funds");
      }
      baseBalance.available -= Number(quantity);
      baseBalance.locked += Number(quantity);
    }
  }

  updateBalances(
    userId: string,
    fills: Fill[],
    baseAsset: string,
    quoteAsset: string,
    side: "buy" | "sell",
    executedQty: number
  ) {
    // if (side === "buy") {
    //   fills.forEach((fill) => {
    //     this.balances?.get(fill.otherUserId)?[quoteAsset].available += fill.price * fill.quantity;
    //     this.balances?.get(fill.otherUserId)?[baseAsset].available -= fill.quantity;
    //     this.balances?.get(userId)?[quoteAsset].available -= fill.price * fill.quantity;
    //     this.balances?.get(userId)?[baseAsset].available += fill.quantity;
    //   });
    // }
    // else {
    //   fills.forEach((fill) => {
    //     this.balances?.get(fill.otherUserId)?[quoteAsset].available -= fill.price * fill.quantity;
    //     this.balances?.get(fill.otherUserId)?[baseAsset].available += fill.quantity;
    //     this.balances?.get(userId)?[quoteAsset].available += fill.price * fill.quantity;
    //     this.balances?.get(userId)?[baseAsset].available -= fill.quantity;
    //   });
    // }

    const buyerBalances = this.balances.get(userId);
    if (!buyerBalances) {
      throw new Error(`Buyer balance for userId ${userId} not found`);
    }

    fills.forEach((fill) => {
      const sellerBalances = this.balances.get(fill.otherUserId);
      if (!sellerBalances) {
        throw new Error(
          `Seller balance for userId ${fill.otherUserId} not found`
        );
      }

      const fillQuantity = fill.quantity;
      const fillPrice = Number(fill.price);
      const totalCost = fillQuantity * fillPrice;

      if (side === "buy") {
        // Seller updates
        sellerBalances[quoteAsset].available += totalCost;
        sellerBalances[baseAsset].locked -= fillQuantity;

        // Buyer updates
        buyerBalances[quoteAsset].locked -= totalCost;
        buyerBalances[baseAsset].available += fillQuantity;
      } else if (side === "sell") {
        // Buyer updates
        sellerBalances[quoteAsset].locked -= totalCost;
        sellerBalances[baseAsset].available += fillQuantity;

        // Seller updates
        buyerBalances[quoteAsset].available += totalCost;
        buyerBalances[baseAsset].locked -= fillQuantity;
      }
    });
  }

  createDBTrades(fills: Fill[], market: string, userId: string) {
    fills.forEach((fill) => {
      RedisManager.getInstance().pushMessages({
        type: "TRADE_ADDED",
        data: {
          market,
          id: fill.tradeId.toString(),
          price: fill.price,
          quantity: fill.quantity.toString(),
          quoteQuantity: (Number(fill.price) * fill.quantity).toString(),
          timestamp: Date.now(),
          isBuyerMaker: fill.otherUserId === userId,
        },
      });
    });
  }

  publishWSDepthUpdates(
    fills: Fill[],
    price: string,
    side: "buy" | "sell",
    market: string
  ) {
    const orderBook = this.orderBooks.find((ob) => ob.ticker() === market);
    if (!orderBook) throw new Error("Order book not found");
    const depth = orderBook.getDepth();
    if (side === "buy") {
      //Checking in the orderbook that ask contains the price of the fill and we send that fill only as response to ws
      const fillPrices = fills.map((fill) => fill.price.toString()); // Extract fill prices as strings

      // Find matching asks
      const updatedAsks = depth?.asks.filter((ask) =>
        fillPrices.includes(ask[0])
      );

      // Add fully executed prices as 0
      fillPrices.forEach((fillPrice) => {
        if (!updatedAsks.some((ask) => ask[0] === fillPrice)) {
          updatedAsks.push([fillPrice, "0"]); // Add price with quantity 0
        }
      });

      // Check in orderbook that the bid contain the price at which the order was placed.
      // If order placed and not executed or partially executed, it was added in the depth bid orderbook and we send that as reponse to ws
      let updatedBids = depth?.bids.find((bid) => bid[0] === price.toString());

      RedisManager.getInstance().publishMessage(`depth.${market}`, {
        stream: `depth.${market}`,
        data: {
          a: updatedAsks,
          b: updatedBids ? [updatedBids] : [],
          e: "depth",
          s: market,
        },
      });
    } else {
      const fillPrices = fills.map((fill) => fill.price.toString()); // Extract fill prices as strings

      // Find matching bids
      const updatedBids = depth?.bids.filter((bid) =>
        fillPrices.includes(bid[0])
      );

      // Add fully executed prices as 0
      fillPrices.forEach((fillPrice) => {
        if (!updatedBids.some((bid) => bid[0] === fillPrice)) {
          updatedBids.push([fillPrice, "0"]); // Add price with quantity 0
        }
      });
      let updatedAsks = depth?.asks.find((ask) => ask[0] === price.toString());

      if (updatedBids.length === 0 && updatedAsks) {
        updatedBids.push([price, "0"]);
      }

      RedisManager.getInstance().publishMessage(`depth.${market}`, {
        stream: `depth.${market}`,
        data: {
          a: updatedAsks ? [updatedAsks] : [],
          b: updatedBids,
          e: "depth",
          s: market,
        },
      });
    }
  }

  setBaseBalances() {
    this.balances.set("1", {
      BTC: { available: 100000000, locked: 60000 },
      EUR: { available: 100000000, locked: 60000 },
      SOL: { available: 120, locked: 0 },
      ETH: { available: 1470, locked: 0 },
    });

    this.balances.set("2", {
      BTC: { available: 100, locked: 0 },
      EUR: { available: 16700, locked: 0 },
    });

    this.balances.set("3", {
      BTC: { available: 400, locked: 0 },
      EUR: { available: 16700, locked: 0 },
    });
  }

  publishWSTradeUpdates(
    fills: Fill[],
    side: string,
    market: string,
    userId: string
  ) {
    const isBuyerMaker = side === "sell";
    const trades = fills.map((fill) => ({
      p: fill.price,
      q: fill.quantity.toString(),
      t: fill.tradeId.toString(),
      m: isBuyerMaker,
      b: userId,
      a: fill.otherUserId,
      e: "trade",
    }));
    trades.forEach((trade) => {
      RedisManager.getInstance().publishMessage(`trade.${market}`, {
        stream: `trade.${market}`,
        data: trade,
      });
    });
  }

  getBalances() {
    return this.balances;
  }
}
