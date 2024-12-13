export type DbMessage = {
  type: string;
  data: {
    id: string;
    isBuyerMaker: boolean;
    price: string;
    quantity: string;
    quoteQuantity: string;
    timestamp: number;
    market: string;
  };
};
