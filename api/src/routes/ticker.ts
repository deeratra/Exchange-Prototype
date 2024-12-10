import { Router } from "express";
import { GET_TICKERS } from "../types/to";
import { RedisManager } from "../RedisManager";

export const tickerRouter = Router();

tickerRouter.get("/", async (req, res) => {
  const response = await RedisManager.getInstance().sendAndAwait({
    type: GET_TICKERS,
  });
  res.json(response.payload);
});
