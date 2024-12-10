import { Router } from "express";
import { RedisManager } from "../RedisManager";
import {
  CREATE_ORDER,
  CANCEL_ORDER,
  ON_RAMP,
  GET_OPEN_ORDERS,
} from "../types/to";

export const orderRouter = Router();

orderRouter.post("/", async (req, res) => {
  const { market, price, quantity, side, userId } = req.body;

  const response = await RedisManager.getInstance().sendAndAwait({
    type: CREATE_ORDER,
    data: {
      market,
      price,
      quantity,
      side,
      userId,
    },
  });
  res.json(response.payload);
});

orderRouter.get("/", async (req, res) => {
  const response = await RedisManager.getInstance().sendAndAwait({
    type: GET_OPEN_ORDERS,
    data: {
      userId: req.query.userId as string,
      market: req.query.market as string,
    },
  });
  res.json(response.payload);
});

orderRouter.delete("/", async (req, res) => {
  // console.log("Request to cancel order", req.body);
  const { orderId, market } = req.body;
  const response = await RedisManager.getInstance().sendAndAwait({
    type: CANCEL_ORDER,
    data: {
      orderId,
      market,
    },
  });
  res.json(response.payload);
});
