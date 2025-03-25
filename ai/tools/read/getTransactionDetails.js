import { getPublicClient } from "../../../shared/viem/helpers/viemUtils.js";
export const getTransactionDetailsTool = {
    definition: {
        type: "function",
        function: {
            name: "get_transaction_details",
            description: "Get the details of a transaction including `from`, `to`, and `hash`",
            parameters: {
                type: "object",
                properties: {
                    hash: {
                        type: "string",
                        pattern: "^0x[a-fA-F0-9]{64}$",
                        description: "The transaction hash to get the details for",
                    },
                    chain: {
                        type: "string",
                        description: "The chain to use for fetching the transaction details (required)",
                    },
                },
                required: ["hash", "chain"],
            },
        },
    },
    handler: async ({ hash, chain }) => {
        try {
            // Call the function to get the transaction details
            const transactionDetails = await getTransactionDetails(hash, chain);
            return transactionDetails;
        }
        catch (error) {
            if (error instanceof Error) {
                // Handle any error from fetching transaction details
                console.error("Error in handler:", error);
                throw new Error(`Failed to get transaction details: ${error.message}`);
            }
        }
    },
};
async function getTransactionDetails(hash, chain) {
    try {
        // Get the first client from the public clients array
        const publicClient = getPublicClient(chain);
        console.log(`Fetching transaction details for hash: ${hash} on chain: ${chain}`);
        // Fetch transaction details
        const transaction = await publicClient.getTransaction({ hash });
        // Check if the transaction was not found
        if (!transaction) {
            throw new Error(`No transaction found for hash: ${hash}`);
        }
        // Return the details of the transaction
        return {
            from: transaction.from,
            to: transaction.to,
            hash: transaction.hash,
            value: transaction.value,
        };
    }
    catch (error) {
        console.error("Error fetching transaction details:", error);
        throw error; // Re-throw to propagate the error
    }
}
