import { createPublicClient, http } from "viem";
import { viemChains } from "./viemChains.js";
// Modify the function to handle a single chain or an array of chains
export function createViemPublicClient(chainKeys) {
    // Ensure that chainKeys is an array even if it's a single chainKey
    const chainKeysArray = Array.isArray(chainKeys) ? chainKeys : [chainKeys];
    return chainKeysArray.map((chainKey) => {
        const chainConfig = viemChains[chainKey];
        if (!chainConfig) {
            throw new Error(`Unsupported chain: ${chainKey}`);
        }
        return createPublicClient({
            chain: chainConfig, // Use the chain config from viemChains
            transport: http(),
        });
    });
}
