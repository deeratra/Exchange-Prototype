import { useState } from "react";
import { TabButton } from "./core/TabButton";
import { OrderTypeButton } from "./core/OrderTypeButton";
import { createMarketOrder } from "@/app/utils/createOrder";

export const SwapUI = ({ market }: { market: string }) => {
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
  const [type, setType] = useState<"limit" | "market">("limit");
  const [amount, setAmount] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");

  async function createOrder(
    quantity: string,
    price: string,
    side: "buy" | "sell",
    userId: string
  ) {
    console.log("Market", market);
    console.log("Quantity", quantity);
    await createMarketOrder({
      market,
      quantity,
      price,
      side,
      userId,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Tab Section */}
      <div className="flex rounded-lg bg-gray-900">
        <TabButton
          label="Buy"
          isActive={activeTab === "buy"}
          activeStyles="bg-green-100/20 border-green-500"
          onClick={() => setActiveTab("buy")}
        />
        <TabButton
          label="Sell"
          isActive={activeTab === "sell"}
          activeStyles="bg-red-100/20 border-red-500"
          onClick={() => setActiveTab("sell")}
        />
      </div>

      {/* Order Type Section */}
      <div className="flex gap-6">
        <OrderTypeButton
          label="Limit"
          isActive={type === "limit"}
          onClick={() => setType("limit")}
        />
        <OrderTypeButton
          label="Market"
          isActive={type === "market"}
          onClick={() => setType("market")}
        />
      </div>

      {/* Balance and Input Section */}
      <div className="flex flex-col gap-4">
        <BalanceDisplay balance="36.94 USDC" />
        <InputField
          label="Price"
          value={amount}
          placeholder="0"
          iconSrc="/eur.webp"
          onChange={(e) => setAmount(e.target.value)}
        />
        <InputField
          label="Quantity"
          value={quantity}
          placeholder="0"
          iconSrc="/sol.webp"
          onChange={(e) => setQuantity(e.target.value)}
        />
      </div>

      {/* Approximate Amount */}
      <ApproximateDisplay value="≈ 0.00 USDC" />

      {/* Percentage Selection */}
      <PercentageSelector />

      {/* Submit Button */}
      <button
        onClick={() => createOrder(quantity, amount, activeTab, "1")}
        type="button"
        className="h-12 rounded-xl bg-green-600 text-white font-semibold text-base transition active:scale-95 hover:bg-green-500"
      >
        {activeTab === "buy" ? "Buy" : "Sell"}
      </button>

      {/* Checkbox Options */}
      <div className="flex justify-between gap-4">
        <CheckboxOption label="Post Only" id="postOnly" />
        <CheckboxOption label="IOC" id="ioc" />
      </div>
    </div>
  );
};

// Reusable Components

const BalanceDisplay = ({ balance }: { balance: string }) => (
  <div className="flex justify-between text-sm text-gray-400">
    <span>Available Balance</span>
    <span className="text-gray-200">{balance}</span>
  </div>
);

const InputField = ({
  label,
  value,
  placeholder,
  iconSrc,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  iconSrc: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm text-gray-400">{label}</label>
    <div className="relative">
      <input
        className="w-full rounded-lg border border-gray-700 bg-gray-900 p-3 pr-12 text-right text-lg text-gray-200 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={onChange}
      />
      <div className="absolute right-3 top-3">
        <img src={iconSrc} alt="icon" className="h-6 w-6" />
      </div>
    </div>
  </div>
);

const ApproximateDisplay = ({ value }: { value: string }) => (
  <div className="flex justify-end">
    <p className="text-sm text-gray-400">{value}</p>
  </div>
);

const PercentageSelector = () => {
  const percentages = ["25%", "50%", "75%", "Max"];
  return (
    <div className="flex justify-center gap-3">
      {percentages.map((percent) => (
        <div
          key={percent}
          className="cursor-pointer rounded-full bg-gray-700 px-4 py-2 text-xs text-gray-300 transition hover:bg-gray-600"
        >
          {percent}
        </div>
      ))}
    </div>
  );
};

const CheckboxOption = ({ label, id }: { label: string; id: string }) => (
  <div className="flex items-center gap-2">
    <input
      id={id}
      type="checkbox"
      className="form-checkbox h-5 w-5 rounded border-gray-700 bg-gray-900 text-gray-700 focus:ring-0"
    />
    <label htmlFor={id} className="text-sm text-gray-400">
      {label}
    </label>
  </div>
);
