export const AskTable = ({ asks }: { asks: [string, string][] }) => {
  let currentTotal = 0;
  const relevantAsks = asks.slice(0, 15);
  //   relevantAsks.reverse();

  let asksWithTotal: [string, string, number][] = relevantAsks.map(
    ([price, quantity]) => {
      return [price, quantity, (currentTotal += Number(quantity))];
    }
  );

  const maxTotal = relevantAsks.reduce(
    (acc, [_, quantity]) => (acc += Number(quantity)),
    0
  );

  asksWithTotal.reverse();
  return (
    <div className="flex flex-col gap-y-2 p-2">
      {asksWithTotal.map(([price, quantity, total]) => (
        <Ask
          maxTotal={maxTotal}
          key={price}
          price={price}
          quantity={quantity}
          total={total}
        />
      ))}
    </div>
  );
};

function Ask({
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
        <div className="text-red-500 w-1/3 text-left">{price}</div>
        <div className="w-1/3 text-center">{quantity}</div>
        <div className="w-1/3 text-right">{total?.toFixed(2)}</div>
      </div>
    </div>
  );
}
