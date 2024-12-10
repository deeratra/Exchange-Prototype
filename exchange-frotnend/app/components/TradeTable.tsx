import { useEffect, useState } from "react";
import { Trade } from "../utils/types";
import { getTrades } from "@/app/utils/httpClient";
import { SignalingManager } from "../utils/SignalingManager";

export const TradeTable = ({ market, trades }: { market: string, trades: Trade[] }) => {
  // const [trades, setTrades] = useState<Trade[]>([]);


  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden">
      <TableHeader />
      <div className="overflow-y-auto h-[420px] hide-scrollbar">
        <div className="divide-y divide-gray-800">
          {trades.map((trade, index) => (
            <div
              key={index}
              className="flex justify-between px-4 py-2 hover:bg-gray-800 transition duration-150"
            >
              <span
                className={`${
                  trade.isBuyerMaker ? "text-red-500" : "text-green-500"
                } tabular-nums text-xs`}
              >
                {trade.price}
              </span>
              <span className="text-gray-300 text-xs">{trade.quantity}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

function TableHeader() {
  return (
    <div className="sticky top-0 flex justify-between px-4 py-2 bg-gray-800 border-b border-gray-700 z-10">
      <div className="text-gray-400 text-xs">Price</div>
      <div className="text-gray-400 text-xs">Quantity</div>
    </div>
  );
}
