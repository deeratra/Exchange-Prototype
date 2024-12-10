import axios from "axios";

const TOTAL_BIDS = 25;
const TOTAL_ASKS = 25;

const market = "BTC_EUR";
const userId = "1";
const baseUrl = "http://localhost:3000";

async function main() {
  try {
    const price = 1000 + Math.random() * 10;
    const openOrders = await axios.get(
      `${baseUrl}/api/v1/order?userId=${userId}&market=${market}`
    );

    const openBids = openOrders.data.filter(
      (order: any) => order.side === "buy"
    ).length;
    console.log("openBids", openBids);
    const openAsks = openOrders.data.filter(
      (order: any) => order.side === "sell"
    ).length;
    console.log("openAsks", openAsks);
    const cancelledBids = await cancelBidsLessThan(openOrders.data, price);
    const cancelledAsks = await cancelAsksMoreThan(openOrders.data, price);

    let bidsToAdd = TOTAL_BIDS - openBids - cancelledBids;
    let asksToAdd = TOTAL_ASKS - openAsks - cancelledAsks;

    while (bidsToAdd > 0 || asksToAdd > 0) {
      if (bidsToAdd > 0) {
        const quantity = Math.floor(Math.random() * 7) + 1;
        // Make the new price upto 2 decimal places
        const newPrice = (price - Math.random() * 10).toFixed(2).toString();

        await axios.post(`${baseUrl}/api/v1/order`, {
          userId,
          market,
          side: "buy",
          price: newPrice,
          quantity,
        });
        bidsToAdd--;
      }
      if (asksToAdd > 0) {
        // need quantuty between 0 and 7 randomly
        const quantity = Math.floor(Math.random() * 7) + 1;
        const newPrice = (price + Math.random() * 10).toFixed(2).toString();

        await axios.post(`${baseUrl}/api/v1/order`, {
          userId,
          market,
          side: "sell",
          price: newPrice,
          quantity,
        });
        asksToAdd--;
      }
    }
    console.log("Bids and asks added");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    main();
  } catch (err) {
    console.log(err);
  }
}

async function cancelBidsLessThan(openOrders: any[], price: number) {
  let promises: any[] = [];
  openOrders.forEach((order: any) => {
    if (order.side === "buy" && Number(order.price) < price) {
      promises.push(
        axios.delete(`${baseUrl}/api/v1/order`, {
          data: {
            orderId: order.orderId,
            market,
          },
        })
      );
    }
  });
  await Promise.all(promises);
  return promises.length;
}

async function cancelAsksMoreThan(openOrders: any[], price: number) {
  let promises: any[] = [];
  openOrders.forEach((order: any) => {
    if (order.side === "sell" && Number(order.price) > price) {
      promises.push(
        axios.delete(`${baseUrl}/api/v1/order`, {
          data: {
            orderId: order.orderId,
            market,
          },
        })
      );
    }
  });
  await Promise.all(promises);
  return promises.length;
}

main();
