import express from "express";
import cors from "cors";
import { orderRouter } from "./routes/order";
import { depthRouter } from "./routes/depth";
import { tickerRouter } from "./routes/ticker";
import { tradeRouter } from "./routes/trade";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use("/api/v1/order", orderRouter);
app.use("/api/v1/depth", depthRouter);
app.use("/api/v1/tickers", tickerRouter);
app.use("/api/v1/trades", tradeRouter);
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
