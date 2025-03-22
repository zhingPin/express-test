import { createViemWalletClient } from "../../../shared/viem/createViemWalletClient.js";
export const writeContractTool = {
    definition: {
        type: "function",
        function: {
            name: "write_contract",
            description: "Execute a write operation on a smart contract",
            parameters: {
                type: "object",
                properties: {
                    chain: {
                        type: "string",
                        description: "The blockchain network to interact with",
                    },
                    address: {
                        type: "string",
                        pattern: "^0x[a-fA-F0-9]{40}$",
                        description: "The contract address to interact with",
                    },
                    abi: {
                        type: "array",
                        description: "Contract ABI (Application Binary Interface)",
                        items: {
                            type: "object",
                            properties: {
                                type: { type: "string" },
                                name: { type: "string" },
                                inputs: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            name: { type: "string" },
                                            type: { type: "string" },
                                        },
                                    },
                                },
                                outputs: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            name: { type: "string" },
                                            type: { type: "string" },
                                        },
                                    },
                                },
                                stateMutability: { type: "string" },
                            },
                        },
                    },
                    functionName: {
                        type: "string",
                        description: "The name of the function to call",
                    },
                    args: {
                        type: "array",
                        description: "The arguments to pass to the function (optional)",
                        items: {
                            type: "string",
                            description: "Function argument value (can be any type, but must be passed as a string)",
                        },
                        optional: true,
                    },
                },
                required: ["chain", "address", "abi", "functionName"],
            },
        },
    },
    handler: async ({ chain, address, abi, functionName, args = [] }) => {
        return await writeContract({ chain, address, abi, functionName, args });
    },
};
export async function writeContract({ chain, address, abi, functionName, args, }) {
    try {
        // Initialize the wallet client for the specified chain
        const client = createViemWalletClient(chain);
        // Execute the write operation on the contract
        const hash = await client.writeContract({
            address,
            abi,
            functionName,
            args: args ?? [], // Use default empty array if args are not provided
        });
        return hash; // Return the transaction hash
    }
    catch (error) {
        console.error(`Error while writing to the contract on chain ${chain}:`, error);
        throw new Error("Failed to execute contract write operation.");
    }
}
