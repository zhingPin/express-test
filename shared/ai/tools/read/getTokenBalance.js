import { formatUnits } from "viem";
import { ERC20_ABI } from "../../const/contractDetails.js";
import { getPublicClient } from "../../../shared/viem/helpers/viemUtils.js";
import { readContract } from "./readContract.js"; // Ensure readContract is correctly imported
export const getTokenBalanceTool = {
    definition: {
        type: "function",
        function: {
            name: "get_token_balance",
            description: "Get the ERC20 token balance of a wallet address",
            parameters: {
                type: "object",
                properties: {
                    tokenAddress: {
                        type: "string",
                        pattern: "^0x[a-fA-F0-9]{40}$",
                        description: "The ERC20 token contract address",
                    },
                    walletAddress: {
                        type: "string",
                        pattern: "^0x[a-fA-F0-9]{40}$",
                        description: "The wallet address to check the balance of",
                    },
                    chain: {
                        type: "string",
                        description: "The chain key for which to get the token balance",
                    },
                },
                required: ["tokenAddress", "walletAddress", "chain"],
            },
        },
    },
    handler: async ({ tokenAddress, walletAddress, chain }) => {
        // Fetch the public client using the chain key
        const publicClient = getPublicClient(chain);
        // Get decimals
        const decimals = await readContract(tokenAddress, // Contract address
        "decimals", // Function name
        [], // No arguments for the "decimals" function
        ERC20_ABI, // ABI for the ERC20 contract
        chain // Pass the chain as the last argument
        );
        // Get the token balance
        const balance = await readContract(tokenAddress, // Contract address
        "balanceOf", // Function name
        [walletAddress], // Arguments for the "balanceOf" function
        ERC20_ABI, // ABI for the ERC20 contract
        chain // Pass the chain as the last argument
        );
        // Format the balance using decimals
        const formattedBalance = formatUnits(BigInt(balance.toString()), // Convert balance to BigInt
        Number(decimals) // Convert decimals to a number
        );
        return formattedBalance; // Return the formatted balance
    },
};
