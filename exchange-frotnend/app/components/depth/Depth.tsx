import { getDepth, getTicker, getTrades } from "@/app/utils/httpClient";
import { useEffect, useState } from "react";
import { AskTable } from "./AskTable";
import { BidTable } from "./BidTable";
import { SignalingManager } from "@/app/utils/SignalingManager";
import { TradeTable } from "../TradeTable";
import { Trade } from "@/app/utils/types";
import { OrderTypeButton } from "../core/OrderTypeButton";

export const Depth = ({ market }: { market: string }) => {
  const [bids, setBids] = useState<[string, string][]>();
  const [asks, setAsks] = useState<[string, string][]>();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [type, setType] = useState<"depth" | "trade">("depth");

  const [price, setPrice] = useState<string>();

  useEffect(() => {
    const fetchDepth = async () => {
      const data = await getDepth(market);
      setBids(data.bids.sort((a, b) => Number(b[0]) - Number(a[0])));
      setAsks(data.asks.sort((a, b) => Number(a[0]) - Number(b[0])));
    };
    getTicker(market).then((t) => setPrice(t.lastPrice));
    fetchDepth();

    const fetchTrade = async () => {
      const data = await getTrades(market);
      setTrades(data);
    };

    fetchTrade();

    SignalingManager.getInstance().registerCallback(
      "depth",
      (data: any) => {
        setBids((originalBids) => {
          const updatedBids = [...(originalBids || [])];
          data.bids?.forEach(([price, size]: [string, string]) => {
            const index = updatedBids.findIndex(([p]) => price === p);
            if (Number(size) === 0) {
              if (index !== -1) updatedBids.splice(index, 1);
            } else {
              if (index !== -1) {
                updatedBids[index] = [price, size];
              } else updatedBids.push([price, size]);
            }
          });
          return updatedBids.sort((a, b) => Number(b[0]) - Number(a[0]));
        });
        setAsks((originalAsks) => {
          const updatedAsks = [...(originalAsks || [])];
          data.asks?.forEach(([price, size]: [string, string]) => {
            const index = updatedAsks.findIndex(([p]) => price === p);
            if (Number(size) === 0) {
              if (index !== -1) updatedAsks.splice(index, 1);
            } else {
              if (index !== -1) {
                updatedAsks[index] = [price, size];
              } else updatedAsks.push([price, size]);
            }
          });
          return updatedAsks.sort((a, b) => Number(a[0]) - Number(b[0]));
        });
        setPrice(data.lastPrice);
      },
      `DEPTH-${market}`
    );
    SignalingManager.getInstance().sendMessage({
      method: "SUBSCRIBE",
      params: [`depth.${market}`],
    });
    SignalingManager.getInstance().registerCallback(
      "trade",
      (data: Trade) => {
        setTrades((originalTrade) => {
          console.log("AData", data);
          const updatedTrades = [data, ...originalTrade];
          if (updatedTrades.length > 50) {
            // Remove the oldest trade if exceeding limit
            updatedTrades.pop();
          }
          return updatedTrades;
        });
      },
      `TRADE-${market}`
    );

    SignalingManager.getInstance().sendMessage({
      method: "SUBSCRIBE",
      params: [`trade.${market}`],
    });
    return () => {
      SignalingManager.getInstance().sendMessage({
        method: "UNSUBSCRIBE",
        params: [`depth.200ms.${market}`],
      });
      SignalingManager.getInstance().deRegisterCallback(
        "depth",
        `DEPTH-${market}`
      );
      SignalingManager.getInstance().deRegisterCallback(
        "trade",
        `TRADE-${market}`
      );
      SignalingManager.getInstance().sendMessage({
        method: "UNSUBSCRIBE",
        params: [`trade.${market}`],
      });
    };
  }, [market]);
  return (
    <>
      <div className="flex flex-col w-[225px] rounded-lg bg-gray-800 px-2 py-4">
        <div className="px-2 flex rounded-lg bg-gray-900">
          <div className="flex gap-6">
            <OrderTypeButton
              label="Market"
              isActive={type === "depth"}
              onClick={() => setType("depth")}
            />
            <OrderTypeButton
              label="Trade"
              isActive={type === "trade"}
              onClick={() => setType("trade")}
            />
          </div>
        </div>
        {type === "depth" ? (
          <div>
            <TableHeader />
            <div className="overflow-y-auto h-[420px] hide-scrollbar">
              {asks && <AskTable asks={asks} />}
              {price && <div>{price}</div>}
              {bids && <BidTable bids={bids} />}
            </div>
          </div>
        ) : (
          <TradeTable market={market as string} trades={trades} />
        )}
      </div>
    </>
  );
};

function TableHeader() {
  return (
    <div className="sticky top-0 flex justify-between text-xs px-4 py-2 bg-gray-800 border-b border-gray-700">
      <div className="text-gray-400">Price</div>
      <div className="text-gray-400">Size</div>
      <div className="text-gray-400">Total</div>
    </div>
  );
}
