import { polygon, base, bsc, 
// mainnet,
polygonAmoy, mainnet,
//   baseSepolia,
//   avalanche,
//   avalancheFuji,
//   pulsechain,
 } from "viem/chains";
export const chainData = [
    { key: "polygon", chain: polygon },
    { key: "base", chain: base },
    { key: "bsc", chain: bsc },
    { key: "mainnet", chain: mainnet },
    { key: "polygonAmoy", chain: polygonAmoy },
];
export const viemChains = Object.fromEntries(chainData.map(({ key, chain }) => [key, chain]));
