// helpers/viemUtils.ts

import { ChainKey } from "../../viem/viemChains.js";
import { createViemPublicClient } from "../createViemPublicClient.js";

export function getPublicClient(chain: ChainKey) {
  const publicClients = createViemPublicClient(chain);
  console.log("Public clients created successfully.");
  return Array.isArray(publicClients) ? publicClients[0] : publicClients;
}
