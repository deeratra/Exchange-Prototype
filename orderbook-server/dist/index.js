"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const orderbook_1 = require("./orderbook");
const types_1 = require("./types");
const BASE_ASSET = "BTC";
const QUOTE_ASSET = "USD";
const app = (0, express_1.default)();
app.use(express_1.default.json());
let GLOBAL_TRADE_ID = 0;
app.post("/api/v1/order", (req, res) => {
    const order = types_1.OrderInputSchema.safeParse(req.body);
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
    const { executedQty, fills } = fillOrder(orderId, price, quantity, side, kind);
    res.send({
        orderId,
        executedQty,
        fills,
    });
});
app.listen(3000, () => {
    console.log("Server listening on port: 3000");
});
function getOrderId() {
    return (Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15));
}
function fillOrder(orderId, price, quantity, side, type) {
    const fills = [];
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
        orderbook_1.orderBook.asks.sort();
        orderbook_1.orderBook.asks.forEach((o) => {
            if (o.price <= price && quantity > 0) {
                const filledQuantity = Math.min(quantity, o.quantity);
                console.log("Filled Quantity", filledQuantity);
                o.quantity -= quantity;
                orderbook_1.booksWithQuantity.asks[o.price] =
                    (orderbook_1.booksWithQuantity.asks[o.price] || 0) - filledQuantity;
                fills.push({
                    price: o.price,
                    quantity: filledQuantity,
                    tradeId: GLOBAL_TRADE_ID++,
                });
                executedQty += filledQuantity;
                quantity -= filledQuantity;
                if (o.quantity === 0) {
                    orderbook_1.orderBook.asks.splice(orderbook_1.orderBook.asks.indexOf(o), 1);
                }
                if (orderbook_1.booksWithQuantity.asks[o.price] === 0) {
                    delete orderbook_1.booksWithQuantity.asks[price];
                }
            }
        });
        if (quantity != 0) {
            orderbook_1.orderBook.bids.push({
                price,
                quantity: quantity - executedQty,
                side: "bid",
                orderId,
            });
            orderbook_1.booksWithQuantity.bids[price] =
                (orderbook_1.booksWithQuantity.bids[price] || 0) + (quantity - executedQty);
        }
    }
    if (side === "sell") {
        orderbook_1.orderBook.bids.sort().reverse();
        orderbook_1.orderBook.bids.forEach((order) => {
            if (order.price >= price && quantity > 0) {
                const filledQuantity = Math.min(quantity, order.quantity);
                console.log("filled Quantity", filledQuantity);
                order.quantity -= quantity;
                orderbook_1.booksWithQuantity.bids[price] =
                    (orderbook_1.booksWithQuantity.bids[price] || 0) - filledQuantity;
                fills.push({
                    price: order.price,
                    quantity: filledQuantity,
                    tradeId: GLOBAL_TRADE_ID++,
                });
                executedQty += filledQuantity;
                quantity -= filledQuantity;
                if (order.quantity === 0) {
                    orderbook_1.orderBook.bids.splice(orderbook_1.orderBook.bids.indexOf(order), 1);
                }
                if (orderbook_1.booksWithQuantity.bids[price] === 0) {
                    delete orderbook_1.booksWithQuantity.bids[price];
                }
            }
            if (quantity != 0) {
                orderbook_1.orderBook.asks.push({
                    price,
                    quantity: quantity,
                    side: "ask",
                    orderId,
                });
                orderbook_1.booksWithQuantity.bids[price] =
                    (orderbook_1.booksWithQuantity.bids[price] || 0) + (quantity - executedQty);
            }
        });
    }
    return {
        status: "accepted",
        executedQty,
        fills,
    };
}
function getFillAmount(price, quantity, side) {
    let filled = 0;
    if (side === "buy") {
        orderbook_1.orderBook.asks.forEach((order) => {
            if (order.price < price) {
                filled += Math.min(quantity, order.quantity);
            }
        });
    }
    else {
        orderbook_1.orderBook.bids.forEach((order) => {
            if (order.price > price) {
                filled += Math.min(quantity, order.quantity);
            }
        });
    }
    return filled;
}
