import express from "express";

import { orderBook, booksWithQuantity, Fill } from "./orderbook";
import { OrderInputSchema } from "./types";

const BASE_ASSET = "BTC";
const QUOTE_ASSET = "USD";

const app = express();
app.use(express.json());

let GLOBAL_TRADE_ID = 0;

app.post("/api/v1/order", (req, res) => {
  const order = OrderInputSchema.safeParse(req.body);
  if (!order.success) {
    res.status(400).send(order.error.message);
    return;
  }
  const { baseAsset, quoteAsset, price, quantity, side, kind } = order.data;
  const orderId = getOrderId();
  if (baseAsset !== BASE_ASSET || quoteAsset !== QUOTE_ASSET) {
    res.status(400).send("Invalid base or quote asset");
    return;
  }

  const { executedQty, fills } = fillOrder(
    orderId,
    price,
    quantity,
    side,
    kind
  );
  res.send({
    orderId,
    executedQty,
    fills,
  });
});

app.listen(3000, () => {
  console.log("Server listening on port: 3000");
});

function getOrderId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

function fillOrder(
  orderId: string,
  price: number,
  quantity: number,
  side: "buy" | "sell",
  type?: "ioc"
): { status: "rejected" | "accepted"; executedQty: number; fills: Fill[] } {
  const fills: Fill[] = [];
  const maxFillQuantity = getFillAmount(price, quantity, side);
  let executedQty = 0;

  if (type == "ioc" && maxFillQuantity < quantity) {
    return {
      status: "rejected",
      executedQty: maxFillQuantity,
      fills: [],
    };
  }
  if (side === "buy") {
    orderBook.asks.sort();
    orderBook.asks.forEach((o) => {
      if (o.price <= price && quantity > 0) {
        const filledQuantity = Math.min(quantity, o.quantity);
        console.log("Filled Quantity", filledQuantity);
        o.quantity -= quantity;
        booksWithQuantity.asks[o.price] =
          (booksWithQuantity.asks[o.price] || 0) - filledQuantity;
        fills.push({
          price: o.price,
          quantity: filledQuantity,
          tradeId: GLOBAL_TRADE_ID++,
        });

        executedQty += filledQuantity;
        quantity -= filledQuantity;
        if (o.quantity === 0) {
          orderBook.asks.splice(orderBook.asks.indexOf(o), 1);
        }
        if (booksWithQuantity.asks[o.price] === 0) {
          delete booksWithQuantity.asks[price];
        }
      }
    });

    if (quantity != 0) {
      orderBook.bids.push({
        price,
        quantity: quantity - executedQty,
        side: "bid",
        orderId,
      });
      booksWithQuantity.bids[price] =
        (booksWithQuantity.bids[price] || 0) + (quantity - executedQty);
    }
  }
  if (side === "sell") {
    orderBook.bids.sort().reverse();
    orderBook.bids.forEach((order) => {
      if (order.price >= price && quantity > 0) {
        const filledQuantity = Math.min(quantity, order.quantity);
        console.log("filled Quantity", filledQuantity);
        order.quantity -= quantity;
        booksWithQuantity.bids[price] =
          (booksWithQuantity.bids[price] || 0) - filledQuantity;
        fills.push({
          price: order.price,
          quantity: filledQuantity,
          tradeId: GLOBAL_TRADE_ID++,
        });
        executedQty += filledQuantity;
        quantity -= filledQuantity;
        if (order.quantity === 0) {
          orderBook.bids.splice(orderBook.bids.indexOf(order), 1);
        }
        if (booksWithQuantity.bids[price] === 0) {
          delete booksWithQuantity.bids[price];
        }
      }
      if (quantity != 0) {
        orderBook.asks.push({
          price,
          quantity: quantity,
          side: "ask",
          orderId,
        });
        booksWithQuantity.bids[price] =
          (booksWithQuantity.bids[price] || 0) + (quantity - executedQty);
      }
    });
  }
  return {
    status: "accepted",
    executedQty,
    fills,
  };
}

function getFillAmount(
  price: number,
  quantity: number,
  side: "buy" | "sell"
): number {
  let filled = 0;
  if (side === "buy") {
    orderBook.asks.forEach((order) => {
      if (order.price < price) {
        filled += Math.min(quantity, order.quantity);
      }
    });
  } else {
    orderBook.bids.forEach((order) => {
      if (order.price > price) {
        filled += Math.min(quantity, order.quantity);
      }
    });
  }
  return filled;
}
