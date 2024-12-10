interface Order {
  price: number;
  quantity: number;
  orderId: string;
}

interface Bid extends Order {
  side: "bid";
}

interface Ask extends Order {
  side: "ask";
}

interface OrderBook {
  bids: Bid[];
  asks: Ask[];
}

export const orderBook: OrderBook = {
  bids: [],
  asks: [],
};

export const booksWithQuantity: {
  bids: { [price: number]: number };
  asks: { [price: number]: number };
} = {
  bids: {},
  asks: {},
};

export interface Fill {
  price: number;
  quantity: number;
  tradeId: number;
}