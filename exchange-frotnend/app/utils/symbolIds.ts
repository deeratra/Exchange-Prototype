import tickersData from "./tickersData.json";
import axios from "axios";
const symbolToCoinGeckoId = {
  btc: "bitcoin", // Bitcoin
  eth: "ethereum", // Ethereum
  usdt: "tether", // Tether
  usdc: "usd-coin", // USD Coin
  bnb: "binancecoin", // Binance Coin
  xrp: "ripple", // XRP
  ada: "cardano", // Cardano
  sol: "solana", // Solana
  doge: "dogecoin", // Dogecoin
  matic: "matic-network", // Polygon
  dot: "polkadot", // Polkadot
  ltc: "litecoin", // Litecoin
  shib: "shiba-inu", // Shiba Inu
  trx: "tron", // TRON
  avax: "avalanche-2", // Avalanche
  dai: "dai", // DAI
  link: "chainlink", // Chainlink
  xlm: "stellar", // Stellar
  atom: "cosmos", // Cosmos
  apt: "aptos", // Aptos
  arb: "arbitrum", // Arbitrum
  algo: "algorand", // Algorand
  egld: "elrond", // MultiversX (formerly Elrond)
  fil: "filecoin", // Filecoin
  hbar: "hedera", // Hedera
  icp: "internet-computer", // Internet Computer
  near: "near", // NEAR Protocol
  qnt: "quant-network", // Quant
  stx: "stacks", // Stacks
  vet: "vechain", // VeChain
  xmr: "monero", // Monero
  aave: "aave",
  act: "act",
  blur: "blur",
  bome: "book-of-meme",
  bonk: "bonk",
  cloud: "cloudbase",
  dbr: "debridge",
  drift: "drift-token",
  goat: "goated",
  habibi: "habibi",
  hnt: "hunter",
  honey: "hivemapper",
  io: "io",

  // Add others as needed based on context or data set
};

function getCoinGeckoId(symbol: string): string | undefined {
  const baseAsset = getBaseAsset(symbol);
  return symbolToCoinGeckoId[baseAsset];
}

function getBaseAsset(symbol: string): string {
  return symbol.split("_")[0].toLowerCase(); // Extracts "sol" from "SOL_USDC"
}

export async function getMarketDataFromCoinGecko(symbol: string) {
  const coinGeckoId = getCoinGeckoId(symbol);

  if (!coinGeckoId) {
    // console.error(`No CoinGecko ID found for symbol: ${symbol}`);
    return null;
  }
  try {
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinGeckoId}`;
    const response = await axios.get(url);
    return response.data[0];
  } catch (e) {
    console.log(e);
    return null;
  }
}

export async function getChartData(symbol: string) {
  const coinGeckoId = getCoinGeckoId(symbol);
  if (!coinGeckoId) {
    // console.error(`No CoinGecko ID found for symbol: ${symbol}`);
    return null;
  }
  try {
    const url = `https://api.coingecko.com/api/v3/coins/${coinGeckoId}/market_chart?vs_currency=usd&days=7`;
    console.log("URL", url);
    const response = await axios.get(url);
    console.log("Response", response.data);
    return response.data.prices;
  } catch (e) {
    console.log(e);
    return null;
  }
}

export function getTickersForCoinGecko() {
  return tickersData;
}
