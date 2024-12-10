import { Router } from "express";
import { RedisManager } from "../RedisManager";

export const tradeRouter = Router();

tradeRouter.get("/", async (req, res) => {
  const market = req.body.market;
  const response = await RedisManager.getInstance().sendAndAwait({
    type: "GET_TRADES",
    data: {
      market,
    },
  });
  res.json(response.payload);
});
