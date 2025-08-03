import { Address } from "viem";
import { ChainKey } from "../../../../utils/clients/web3/viem/viemChains.js";
import { ToolConfig } from "../../../../types/toolConfig.js";
import { createViemWalletClient } from "../../../../utils/clients/web3/viem/createViemWalletClient.js";


interface GetWalletAddressArgs {
  chain: ChainKey; // Use ChainKey for type safety
}

export const getWalletAddressTool: ToolConfig<GetWalletAddressArgs> = {
  definition: {
    type: "function",
    function: {
      name: "get_wallet_address",
      description: "Get the connected wallet address",
      parameters: {
        type: "object",
        properties: {
          chain: {
            type: "string",
            description: "The blockchain network to query wallet address from",
          },
        },
        required: [],
      },
    },
  },
  handler: async ({ chain }) => {
    return await getWalletAddress(chain as ChainKey);
  },
};

async function getWalletAddress(chainKey: ChainKey): Promise<Address> {
  const { account } = createViemWalletClient(chainKey); // Extract account
  return account.address; // Return the address
}

const walletAddress = await getWalletAddress("polygonAmoy");
console.log(`my current address is: $${walletAddress} donate`);
