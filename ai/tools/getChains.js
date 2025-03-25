import { viemChains } from "../wallet/viem/viemChains.js";
// Tool to fetch available chains
export const getAvailableChainsTool = {
  definition: {
    type: "function",
    function: {
      name: "get_available_chains",
      description: "A list of the only available chains",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  handler: async () => {
    // Get the keys of available chains from the viemChains configuration
    const availableNetworks = Object.keys(viemChains);
    return availableNetworks; // Return the list of available chains
  },
};
