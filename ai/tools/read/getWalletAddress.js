import { createViemWalletClient } from "../../wallet/viem/createViemWalletClient.js";
export const getWalletAddressTool = {
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
    return await getWalletAddress(chain);
  },
};
async function getWalletAddress(chainKey) {
  const { account } = createViemWalletClient(chainKey); // Extract account
  return account.address; // Return the address
}
const walletAddress = await getWalletAddress("polygonAmoy");
console.log(`my current address is: $${walletAddress}`);
