export const BASE_CURRENCY = "EUR";

export interface Order {
  price: number;
  quantity: number;
  side: "buy" | "sell";
  orderId: string;
  filled: number;
  userId: string;
}

export interface Fill {
  price: string;
  quantity: number;
  tradeId: number;
  otherUserId: string;
  makerOrderId: string;
}

export class OrderBook {
  bids: Order[];
  asks: Order[];
  baseAsset: string;
  quoteAsset: string = BASE_CURRENCY;
  lastTradeId: number;
  currentPrice: string;

  firstPrice: string; // Price at the start of the day
  high: string; // Highest price during the day
  low: string; // Lowest price during the day
  lastPrice: string; // Most recent trade price
  priceChange: string; // Absolute price change
  priceChangePercent: string; // Percentage change in price
  quoteVolume: string; // Total value of trades in quote currency
  volume: string; // Total quantity of base asset traded
  trades: number; // Total number of trades

  constructor(
    baseAsset: string,
    bids: Order[],
    asks: Order[],
    lastTradeId: number,
    currentPrice: string
  ) {
    this.bids = bids;
    this.asks = asks;
    this.baseAsset = baseAsset;
    this.lastTradeId = lastTradeId || 0;
    this.currentPrice = currentPrice || "0";
    this.firstPrice = "0";
    this.high = "0";
    this.low = "0";
    this.lastPrice = "0";
    this.priceChange = "0";
    this.priceChangePercent = "0";
    this.quoteVolume = "0";
    this.volume = "0";
    this.trades = 0;
  }

  ticker() {
    return `${this.baseAsset}_${this.quoteAsset}`;
  }

  addOrder(order: Order): { fills: Fill[]; executedQty: number } {
    if (order.side === "buy") {
      const { fills, executedQty } = this.matchBid(order);
      order.filled = executedQty;
      if (executedQty === order.quantity) {
        return { fills, executedQty };
      }
      this.bids.push(order);
      return { fills, executedQty };
    } else {
      const { fills, executedQty } = this.matchAsk(order);
      order.filled = executedQty;
      if (executedQty === order.quantity) {
        return { fills, executedQty };
      }
      this.asks.push(order);
      return { fills, executedQty };
    }
  }

  matchBid(order: Order): { fills: Fill[]; executedQty: number } {
    const fills: Fill[] = [];
    let executedQty = 0;
    this.asks.sort((a, b) => a.price - b.price);

    for (let i = 0; i < this.asks.length; i++) {
      const ask = this.asks[i];
      if (ask.price <= order.price && executedQty < order.quantity) {
        const filledQuantity = Math.min(
          order.quantity - executedQty,
          ask.quantity - ask.filled
        );
        this.currentPrice = ask.price.toString();
        this.updateMarketStats(this.currentPrice);
        executedQty += filledQuantity;
        ask.filled += filledQuantity;
        fills.push({
          price: ask.price.toString(),
          quantity: filledQuantity,
          tradeId: this.lastTradeId++,
          otherUserId: ask.userId,
          makerOrderId: ask.orderId,
        });
      }
    }

    for (let i = 0; i < this.asks.length; i++) {
      if (this.asks[i].quantity === this.asks[i].filled) {
        this.asks.splice(i, 1);
        i--;
      }
    }
    return {
      fills,
      executedQty,
    };
  }

  matchAsk(order: Order): { fills: Fill[]; executedQty: number } {
    const fills: Fill[] = [];
    let executedQty = 0;
    this.bids.sort((a, b) => b.price - a.price);

    for (let i = 0; i < this.bids.length; i++) {
      const bid = this.bids[i];
      if (bid.price >= order.price && executedQty < order.quantity) {
        const filledQuantity = Math.min(
          order.quantity - executedQty,
          bid.quantity - bid.filled
        );
        this.currentPrice = bid.price.toString();
        this.updateMarketStats(this.currentPrice);
        executedQty += filledQuantity;
        bid.filled += filledQuantity;
        fills.push({
          price: bid.price.toString(),
          quantity: filledQuantity,
          tradeId: this.lastTradeId++,
          otherUserId: bid.userId,
          makerOrderId: bid.orderId,
        });
      } else break;
    }

    for (let i = 0; i < this.bids.length; i++) {
      if (this.bids[i].quantity === this.bids[i].filled) {
        this.bids.splice(i, 1);
        i--;
      }
    }
    return {
      fills,
      executedQty,
    };
  }

  getDepth() {
    const bids: [string, string][] = [];
    const asks: [string, string][] = [];

    const bidsObject: { [key: string]: number } = {};
    const asksObject: { [key: string]: number } = {};

    for (let i = 0; i < this.bids.length; i++) {
      const order = this.bids[i];
      if (!bidsObject[order.price]) {
        bidsObject[order.price] = 0;
      }
      bidsObject[order.price] += order.quantity - order.filled;
    }
    for (let i = 0; i < this.asks.length; i++) {
      const order = this.asks[i];
      if (!asksObject[order.price]) {
        asksObject[order.price] = 0;
      }
      asksObject[order.price] += order.quantity - order.filled;
    }

    for (const price in bidsObject) {
      bids.push([price, bidsObject[price].toString()]);
    }
    for (const price in asksObject) {
      asks.push([price, asksObject[price].toString()]);
    }
    return {
      market: this.ticker(),
      asks,
      bids,
    };
  }

  async updateMarketStats(newPrice: string) {
    if (this.firstPrice === "0") {
      this.firstPrice = newPrice; // Set first price when first trade happens
    }
    this.lastPrice = newPrice;

    // Update high/low prices
    if (parseFloat(newPrice) > parseFloat(this.high)) {
      this.high = newPrice;
    }
    if (parseFloat(newPrice) < parseFloat(this.low) || this.low === "0") {
      this.low = newPrice;
    }

    // Calculate price change and percentage change
    const priceChange =
      parseFloat(this.lastPrice) - parseFloat(this.firstPrice);
    this.priceChange = priceChange.toFixed(2);
    this.priceChangePercent = (
      (priceChange / parseFloat(this.firstPrice)) *
      100
    ).toFixed(4);
  }

  getOpenOrders(userId: string): Order[] {
    const openOrders = [];
    for (let i = 0; i < this.bids.length; i++) {
      if (this.bids[i].userId === userId) {
        openOrders.push(this.bids[i]);
      }
    }
    for (let i = 0; i < this.asks.length; i++) {
      if (this.asks[i].userId === userId) {
        openOrders.push(this.asks[i]);
      }
    }
    return openOrders;
  }

  cancelBid(order: Order) {
    const index = this.bids.findIndex((o) => o.orderId === order.orderId);
    if (index !== -1) {
      const price = this.bids[index].price;
      this.bids.splice(index, 1);
      return price;
    }
  }

  cancelAsk(order: Order) {
    const index = this.asks.findIndex((o) => o.orderId === order.orderId);
    if (index !== -1) {
      const price = this.asks[index].price;
      this.asks.splice(index, 1);
      return price;
    }
  }

  getTrades(){
    
  }
}
