import { formatEther } from "viem";
import { getPublicClient } from "../../../shared/viem/helpers/viemUtils.js";
// /**
//  * Tool for fetching the balance of a wallet address on a specified blockchain network.
//  *
//  * @function
//  * @param {object} args - The arguments for fetching the wallet balance.
//  * @param {string} args.wallet - The wallet address to query the balance for (should be a valid Ethereum address).
//  * @param {ChainKeys} args.chain - The blockchain network to query balance from (e.g., Ethereum, Polygon).
//  *
//  * @returns {Promise<string>} - A promise that resolves to a formatted string of the wallet balance in Ether (or token units).
//  */
export const getBalanceTool = {
    definition: {
        type: "function",
        function: {
            name: "get_balance",
            description: "Get the balance of a wallet",
            parameters: {
                type: "object",
                properties: {
                    chain: {
                        type: "string",
                        description: "The blockchain network to query balance from",
                    },
                    wallet: {
                        type: "string",
                        pattern: "^0x[a-fA-F0-9]{40}$",
                        description: "The wallet address to get the balance of",
                    },
                },
                required: ["wallet", "chain"],
            },
        },
    },
    handler: async ({ wallet, chain }) => {
        return await getBalance(wallet, chain); // Cast `chain` to ChainKey
    },
};
// /**
//  * Fetches the balance of a wallet on a specific blockchain network and formats it into Ether or token units.
//  *
//  * @param {Address} wallet - The wallet address to get the balance for.
//  * @param {ChainKey} chainKey - The blockchain network to query the balance from.
//  *
//  * @returns {Promise<string>} - The formatted balance in Ether (or token units).
//  * @throws {Error} - Throws an error if fetching the balance fails.
//  */
async function getBalance(wallet, chainKey) {
    try {
        // Create public client for the chain
        const publicClient = getPublicClient(chainKey);
        // Fetch the balance for the given wallet address
        const balance = await publicClient.getBalance({
            address: wallet, // Wallet address
        });
        // Format the balance from Wei to Ether (or token units)
        const formattedBalance = formatEther(balance);
        // console.log(
        //   `Formatted balance (in Ether) for wallet ${wallet} on chain ${chainKey}:`,
        //   formattedBalance
        // );
        return formattedBalance;
    }
    catch (error) {
        if (error instanceof Error) {
            console.log(`Error fetching balance for wallet ${wallet} on chain ${chainKey}:`, error);
            throw new Error(`Failed to fetch balance: ${error.message}`);
        }
        else {
            console.log("Unknown error:", error);
            throw new Error("An unknown error occurred while fetching the balance.");
        }
    }
}
