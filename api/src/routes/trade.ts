import { Router } from "express";
import { Client } from "pg";
import { getTrades } from "../dbServices/getTrades";

export const tradeRouter = Router();

tradeRouter.get("/", async (req, res) => {
  const market = req.query.symbol as string;
  // Get trade from database
  const trades = await getTrades(market);
  const updatedTrades = trades.map((trade) => ({
    ...trade,
    isBuyerMaker: trade.is_buyer_maker,
  }));
  res.json(updatedTrades);
  // console.log(updatedTrades);
});
