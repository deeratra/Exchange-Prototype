"use client";
import { useState } from "react";
import { MarketBar } from "@/app/components/MarketBar";
import { SwapUI } from "@/app/components/SwapUI";
import { TradeView } from "@/app/components/TradeView";
import { Depth } from "@/app/components/depth/Depth";
import { useParams } from "next/navigation";

export default function Page() {
  const [market, setMarket] = useState(useParams().market);

  const handleMarketChange = (newMarket: string) => {
    setMarket(newMarket); // Update base asset state
  };

  return (
    <div className="flex flex-row flex-1">
      <div className="flex flex-col flex-1">
        <MarketBar market={market as string} onChange={handleMarketChange} />
        <div className="flex flex-row border-slate-800 rounded-lg mr-1 ml-2 px-4 py-4">
          <div className="flex flex-col flex-1">
            <TradeView market={market as string} />
          </div>
          <Depth market={market as string} />
        </div>
      </div>
      <div>
        <div className="flex flex-col w-[350px] rounded-lg bg-gray-800 ml-2 mr-2 px-6 py-4">
          <SwapUI market={market as string} />
        </div>
      </div>
    </div>
  );
}
