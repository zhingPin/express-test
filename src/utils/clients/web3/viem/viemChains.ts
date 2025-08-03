import {
  polygon,
  base,
  bsc,
  // mainnet,
  polygonAmoy,
  mainnet,
  //   baseSepolia,
  //   avalanche,
  //   avalancheFuji,
  //   pulsechain,
} from "viem/chains";

export type ChainKey = "polygon" | "base" | "bsc" | "mainnet" | "polygonAmoy";
//   | "baseSepolia"
//   | "avalanche"
//   | "avalancheFuji"; // Define valid chain keys

// Use an array of chainKeys to support multiple chains
export type ChainKeys = ChainKey | ChainKey[];

export const chainData = [
  { key: "polygon", chain: polygon },
  { key: "base", chain: base },
  { key: "bsc", chain: bsc },
  { key: "mainnet", chain: mainnet },
  { key: "polygonAmoy", chain: polygonAmoy },
];

export const viemChains = Object.fromEntries(
  chainData.map(({ key, chain }) => [key, chain])
) as Record<
  ChainKey,
  | typeof polygon
  | typeof base
  | typeof bsc
  | typeof mainnet
  | typeof polygonAmoy
>;
