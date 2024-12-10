import axios from "axios";

import { Order } from "./types";

const BASE_URL = "http://localhost:3000/api/v1";

export async function createMarketOrder(order: Order) {
  const response = await axios.post(`${BASE_URL}/order`, order);
  console.log("response", response.data);
}
