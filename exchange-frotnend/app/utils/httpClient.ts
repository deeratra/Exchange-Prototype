import axios from "axios";

import { Depth, KLine, Ticker, Trade } from "./types";

const BASE_URL = "http://localhost:3000/api/v1";

export async function getTicker(market: string): Promise<Ticker> {
  const tickers = await getTickers();
  console.log("Tickers", tickers);
  console.log("Market", market);
  const ticker = tickers.find((t) => t.symbol === market);
  if (!ticker) {
    throw new Error(`no ticker found for ${market}`);
  }
  console.log("Ticker", ticker);
  return ticker;
}

export async function getTickers(): Promise<Ticker[]> {
  try {
    const response = await axios.get(`${BASE_URL}/tickers`);
    console.log("Response", response.data);
    return response.data;
  } catch (error) {
    console.log("Error", error);
    return [];
  }
}

export async function getDepth(market: string): Promise<Depth> {
  console.log("Market", market);
  const response = await axios.get(`${BASE_URL}/depth?symbol=${market}`);
  return response.data;
}

export async function getTrades(market: string): Promise<Trade[]> {
  const response = await axios.get(
    `${BASE_URL}/trades?symbol=${market}&limit=50`
  );
  return response.data;
}
export async function getKLines(
  market: string,
  interval: string,
  startTime: number,
  endTime: number
): Promise<KLine[]> {
  const response = await axios.get(
    `${BASE_URL}/klines?market=${market}&interval=${interval}&startTime=${startTime}&endTime=${endTime}`
  );
  const data: KLine[] = response.data;
  console.log("KLine Data", data);
  return data.sort((x, y) => (Number(x.end) < Number(y.end) ? -1 : 1));
}
