import { Order } from "../trade/OrderBook";

export type MessageToApi =
  | {
      type: "DEPTH";
      payload: {
        market: string;
        asks: [string, string][];
        bids: [string, string][];
      };
    }
  | {
      type: "ORDER_PLACED";
      payload: {
        orderId: string;
        executedQty: number;
        fills: {
          price: string;
          quantity: number;
          tradeId: number;
        }[];
      };
    }
  | {
      type: "ORDER_CANCELLED";
      payload: {
        orderId: string;
      };
    }
  | {
      type: "OPEN_ORDERS";
      payload: Order[];
    }
  | {
      type: "TICKERS";
      payload: {
        symbol: string;
        firstPrice: string;
        high: string;
        low: string;
        lastPrice: string;
        priceChange: string;
        priceChangePercent: string;
      }[];
    };
