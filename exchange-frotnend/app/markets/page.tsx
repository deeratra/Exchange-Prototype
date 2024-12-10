"use server";

import { Ticker } from "../utils/types";
import { getTickers } from "../utils/httpClient";
import {
  getMarketDataFromCoinGecko,
  getTickersForCoinGecko,
  getChartData,
} from "../utils/symbolIds";
import TickerChart from "../components/TickerChart";

export default async function Page() {
  // Using hard-code data because doing SSG(static-site-generation which gives CORS error)
  const tickers: Ticker[] = await getTickersForCoinGecko();

  const tickersWithMarketCap = await Promise.all(
    tickers.map(async (ticker) => {
      const marketData = await getMarketDataFromCoinGecko(ticker.symbol);
      const chartData = await getChartData(ticker.symbol);
      // console.log("symbol", ticker.symbol, "marketCap", marketCap);
      // console.log("Chart data", chartData);
      const formattedChartData = chartData?.map(([timestamp, price]) => ({
        timestamp: timestamp, // Format timestamp as time
        price: price.toFixed(2) * 1000, // Format price to 2 decimal places
      }));
      const reducedChartData = formattedChartData?.filter(
        (_, index) => index % 7 === 0
      );

      return {
        ...ticker, // Spread the existing ticker properties
        marketCap: marketData?.market_cap,
        symbolImage: marketData?.image,
        name: ticker.symbol.split("_")[0],
        chartData: reducedChartData,
      };
    })
  );

  return (
    <div className="flex w-full justify-center flex-row flex-1">
      <div className="flex flex-col justify-center max-w-[1380px] items-center flex-1 pt-[100px] px-4">
        <div className="flex flex-col flex-1 gap-6 w-full rounded-xl p-3">
          <div className="flex flex-col rounded-lg overflow-hidden">
            <table className="min-w-full w-full table-auto">
              <thead>
                <tr className="">
                  <th className="px-4 py-3 text-sm font-semibold first:pr-0 last:pl-0 text-left">
                    Name
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold first:pr-0 last:pl-0 text-right">
                    Price
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold first:pr-0 last:pl-0 text-right">
                    Market Cap
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold first:pr-0 last:pl-0 text-right">
                    24H Volume
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold first:pr-0 last:pl-0 text-right">
                    24H Change
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold first:pr-0 last:pl-0 text-right">
                    Last 7 Days
                  </th>
                </tr>
              </thead>
              <tbody>
                {tickersWithMarketCap.map((item) => (
                  <tr
                    key={item.symbol}
                    className="cursor-pointer border-t border-baseBorderLight  hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-300 first:pr-0 last:pl-0 text-left">
                      <div className="flex items-center">
                        <div
                          className="relative flex-none overflow-hidden rounded-full border border-baseBorderMed"
                          style={{ width: "40px", height: "40px" }}
                        >
                          <div className="relative">
                            <img src={item.symbolImage} alt="" />
                          </div>
                        </div>
                        <div className="ml-2 flex flex-col">{item.name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300 first:pr-0 last:pl-0 text-right">
                      <p className="text-base font-medium tabular-nums">
                        ${Number(item.lastPrice).toLocaleString()}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-gray-300 first:pr-0 last:pl-0 text-right">
                      <p className="text-base font-medium tabular-nums">
                        ${Number(item.marketCap).toLocaleString()}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-gray-300 first:pr-0 last:pl-0 text-right">
                      <p className="text-base font-medium tabular-nums">
                        {Number(item.quoteVolume).toLocaleString()}$
                      </p>
                    </td>
                    <td
                      className={`px-4 py-3 first:pr-0 last:pl-0 text-right ${
                        Number(item.priceChangePercent) > 0
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      <p className="text-base font-medium tabular-nums">
                        {(Number(item.priceChangePercent) * 100).toFixed(2)}%
                      </p>
                    </td>
                    <td className="px-4 py-3 text-gray-300 first:pr-0 last:pl-0 text-right">
                      <div className="flex justify-end">
                        {item.chartData && (
                          <TickerChart chartData={item.chartData} />
                        )}
                      </div>
                      {/* <div className="h-6 w-full bg-gray-600 rounded-md"></div> */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
