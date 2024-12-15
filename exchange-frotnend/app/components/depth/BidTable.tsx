/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
export const BidTable = ({ bids }: { bids: [string, string][] }) => {
  let currentTotal = 0;
  const relevantBids = bids.slice(0, 15);

  let bidsWithTotal: [string, string, number][] = relevantBids.map(
    ([price, quantity]) => {
      return [price, quantity, (currentTotal += Number(quantity))];
    }
  );

  const maxTotal = relevantBids.reduce(
    (acc, [_, quantity]) => (acc += Number(quantity)),
    0
  );

  return (
    <div className="flex flex-col gap-y-2 p-2">
      {bidsWithTotal.map(([price, quantity, total]) => (
        <Bid
          maxTotal={maxTotal}
          total={total}
          quantity={quantity}
          price={price}
          key={price}
        />
      ))}
    </div>
  );
};

function Bid({
  maxTotal,
  quantity,
  price,
  total,
}: {
  maxTotal: number;
  quantity: string;
  price: string;
  total: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        position: "relative",
        width: "100%",
        backgroundColor: "transparent",
        overflow: "hidden",
      }}
    >
      <div className="flex justify-between text-xs w-full">
        <div className="text-green-500 w-1/3 text-left">{price}</div>
        <div className="w-1/3 text-center">{quantity}</div>
        <div className="w-1/3 text-right">{total?.toFixed(2)}</div>
      </div>
    </div>
  );
}
