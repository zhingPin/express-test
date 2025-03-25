import { createViemPublicClient } from "../../wallet/viem/createViemPublicClient.js";

export const readContractTool = {
  definition: {
    type: "function",
    function: {
      name: "read_contract",
      description: "Read data from a smart contract",
      parameters: {
        type: "object",
        properties: {
          contract: {
            type: "string",
            pattern: "^0x[a-fA-F0-9]{40}$",
            description: "The contract address to read from",
          },
          functionName: {
            type: "string",
            description: "The name of the function to call",
          },
          args: {
            type: "array",
            description: "Optional arguments for the function call",
            items: {
              type: "string",
            },
          },
          abi: {
            type: "array",
            description: "The ABI of the contract",
            items: {
              type: "object",
            },
          },
          chain: {
            type: "string",
            description: "The chain to use for reading the contract",
          },
        },
        required: ["contract", "functionName", "abi", "chain"], // Ensure chain is required
      },
    },
  },
  handler: async ({ contract, functionName, args = [], abi, chain }) => {
    // Validate if chain is a valid ChainKey
    return await readContract(contract, functionName, args, abi, chain);
  },
};
export async function readContract(contract, functionName, args, abi, chain) {
  // Check if chain is an array, and ensure that createViemPublicClient handles multiple chains
  const chainKeysArray = Array.isArray(chain) ? chain : [chain];
  // Create public clients for each specified chain
  const publicClients = createViemPublicClient(chainKeysArray);
  // Ensure we're handling multiple clients and waiting for their results
  const results = await Promise.all(
    publicClients.map(async (publicClient) => {
      const result = await publicClient.readContract({
        address: contract,
        abi,
        functionName,
        args,
      });
      if (typeof result === "bigint") {
        return result.toString();
      }
      return result;
    })
  );
  return results;
}
