/* eslint-disable @typescript-eslint/no-unused-vars */
import { redirect } from "next/navigation";
import React, { useState } from "react";

export const MarketSelect = ({
  base,
  onChange,
}: {
  base: string;
  onChange: (base: string) => void;
}) => {
  // const router = useRouter();
  const [baseAsset, setBaseAsset] = useState(base); // Default base asset
  const [isDropdownOpen, setDropdownOpen] = useState(false); // Manage dropdown visibility

  const assets = [
    { value: "BTC", label: "BTC", image: "/btc.webp" },
    { value: "SOL", label: "SOL", image: "/sol.webp" },
    { value: "ETH", label: "ETH", image: "/eth.webp" },
  ];

  // Handle asset selection
  const handleAssetChange = (asset: string) => {
    setBaseAsset(asset);
    const market = `${asset}_EUR`;
    setDropdownOpen(false); // Close dropdown on selection
    redirect(`/trade/${market}`);
  };

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="p-3">
      {/* Selected Base Asset (Header) */}
      <div
        className="flex items-center border p-3 rounded-lg cursor-pointer bg-gray-800"
        onClick={toggleDropdown}
      >
        <img
          src={assets.find((asset) => asset.value === baseAsset)?.image}
          alt={`${baseAsset} Logo`}
          className="h-6 w-6 mr-2"
        />
        <span className="font-medium text-sm">{baseAsset}</span>
      </div>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute mt-2 left-0 bg-gray-800 p-3 shadow-lg z-50">
          {assets.map((asset) => (
            <div
              key={asset.value}
              onClick={() => handleAssetChange(asset.value)}
              className="flex items-center p-2 cursor-pointer bg-gray-800"
            >
              <img
                src={asset.image}
                alt={`${asset.label} Logo`}
                className="h-6 w-6 mr-2"
              />
              <span className="font-medium text-sm">{asset.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
