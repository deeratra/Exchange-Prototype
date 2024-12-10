export type DbMessage = {
  type: string;
  data: {
    price: string;
    quantity: string;
    timestamp: string;
  };
};
