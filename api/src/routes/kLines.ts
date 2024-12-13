import { Router } from "express";
import { getKLines } from "../dbServices/getTrades";

export const kLineRouter = Router();

kLineRouter.get("/", async (req, res) => {
  const { market, interval, startTime, endTime } = req.query;
  console.log(
    "market",
    market,
    "interval",
    interval,
    "startTime",
    startTime,
    "endTime",
    endTime
  );
  try {
    // Call the getKLines function to fetch the kline data
    const klineData = await getKLines(
      market as string,
      interval as string,
      startTime as string,
      endTime as string
    );
    console.log("klineData", klineData);

    // Return the kline data as JSON
    res.json(klineData);
  } catch (error) {
    // Catch and handle any errors from the getKLines function
    console.error(error);
    res.status(500).json({ error: "Error fetching kline data" });
  }
});
