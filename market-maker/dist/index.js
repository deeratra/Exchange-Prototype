"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const TOTAL_BIDS = 25;
const TOTAL_ASKS = 25;
const market = "BTC_EUR";
const userId = "1";
const baseUrl = "http://localhost:3000";
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const price = 1000 + Math.random() * 10;
            const openOrders = yield axios_1.default.get(`${baseUrl}/api/v1/order?userId=${userId}&market=${market}`);
            const openBids = openOrders.data.filter((order) => order.side === "buy").length;
            console.log("openBids", openBids);
            const openAsks = openOrders.data.filter((order) => order.side === "sell").length;
            console.log("openAsks", openAsks);
            const cancelledBids = yield cancelBidsLessThan(openOrders.data, price);
            const cancelledAsks = yield cancelAsksMoreThan(openOrders.data, price);
            let bidsToAdd = TOTAL_BIDS - openBids - cancelledBids;
            let asksToAdd = TOTAL_ASKS - openAsks - cancelledAsks;
            while (bidsToAdd > 0 || asksToAdd > 0) {
                if (bidsToAdd > 0) {
                    const quantity = Math.floor(Math.random() * 7) + 1;
                    // Make the new price upto 2 decimal places
                    const newPrice = (price - Math.random() * 10).toFixed(2).toString();
                    yield axios_1.default.post(`${baseUrl}/api/v1/order`, {
                        userId,
                        market,
                        side: "buy",
                        price: newPrice,
                        quantity,
                    });
                    bidsToAdd--;
                }
                if (asksToAdd > 0) {
                    // need quantuty between 0 and 7 randomly
                    const quantity = Math.floor(Math.random() * 7) + 1;
                    const newPrice = (price + Math.random() * 10).toFixed(2).toString();
                    yield axios_1.default.post(`${baseUrl}/api/v1/order`, {
                        userId,
                        market,
                        side: "sell",
                        price: newPrice,
                        quantity,
                    });
                    asksToAdd--;
                }
            }
            console.log("Bids and asks added");
            yield new Promise((resolve) => setTimeout(resolve, 1000));
            main();
        }
        catch (err) {
            console.log(err);
        }
    });
}
function cancelBidsLessThan(openOrders, price) {
    return __awaiter(this, void 0, void 0, function* () {
        let promises = [];
        openOrders.forEach((order) => {
            if (order.side === "buy" && Number(order.price) < price) {
                promises.push(axios_1.default.delete(`${baseUrl}/api/v1/order`, {
                    data: {
                        orderId: order.orderId,
                        market,
                    },
                }));
            }
        });
        yield Promise.all(promises);
        return promises.length;
    });
}
function cancelAsksMoreThan(openOrders, price) {
    return __awaiter(this, void 0, void 0, function* () {
        let promises = [];
        openOrders.forEach((order) => {
            if (order.side === "sell" && Number(order.price) > price) {
                promises.push(axios_1.default.delete(`${baseUrl}/api/v1/order`, {
                    data: {
                        orderId: order.orderId,
                        market,
                    },
                }));
            }
        });
        yield Promise.all(promises);
        return promises.length;
    });
}
main();
