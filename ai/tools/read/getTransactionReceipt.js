import { getPublicClient } from "../../../shared/viem/helpers/viemUtils.js";
export const getTransactionReceiptTool = {
    definition: {
        type: "function",
        function: {
            name: "get_transaction_receipt",
            description: "Get the receipt of a transaction to check its status and details",
            parameters: {
                type: "object",
                properties: {
                    hash: {
                        type: "string",
                        pattern: "^0x[a-fA-F0-9]{64}$",
                        description: "The transaction hash to get the receipt for",
                    },
                    chain: {
                        type: "string",
                        description: "The chain to use for fetching the transaction receipt (required)",
                    },
                },
                required: ["hash", "chain"],
            },
        },
    },
    handler: async ({ hash, chain }) => {
        return await getTransactionReceipt(hash, chain);
    },
};
function extractReceiptInfo(receipt) {
    return {
        status: receipt.status,
        hash: receipt.transactionHash,
        ...(receipt.status === "reverted" && { error: "Transaction reverted" }),
    };
}
async function getTransactionReceipt(hash, chain) {
    console.log(hash);
    try {
        const publicClient = getPublicClient(chain);
        // Log to help with debugging
        console.log(`Fetching transaction receipt for hash: ${hash} on chain: ${chain}`);
        const receipt = await publicClient.getTransactionReceipt({ hash });
        // Check if receipt is null or undefined
        if (!receipt) {
            throw new Error(`No receipt found for transaction hash: ${hash}`);
        }
        return extractReceiptInfo(receipt);
    }
    catch (error) {
        console.error("Error fetching transaction receipt:", error);
        // Enhance error message based on possible issues
        if (error instanceof Error && error.message.includes("No receipt found")) {
            throw new Error(`Transaction receipt not found. It might not exist, be pending, or failed.`);
        }
        // Catch other network-related errors
        throw new Error("Failed to fetch transaction receipt due to a network or server error.");
    }
}
