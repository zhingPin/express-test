import { createViemPublicClient } from "../../../shared/viem/createViemPublicClient.js"; // Import public client creator
import fetch from "node-fetch";
export const getContractAbiTool = {
    definition: {
        type: "function",
        function: {
            name: "get_contract_abi",
            description: "Get the ABI or specific function signature of a deployed contract on a specific blockchain network",
            parameters: {
                type: "object",
                properties: {
                    chain: {
                        type: "string",
                        description: "The blockchain network to interact with",
                    },
                    contract: {
                        type: "string",
                        pattern: "^0x[a-fA-F0-9]{40}$",
                        description: "The contract address to get the ABI from",
                    },
                    functionName: {
                        type: "string",
                        description: "Optional: Get signature for a specific function name",
                    },
                },
                required: ["chain", "contract"],
            },
        },
    },
    handler: async ({ chain, contract, functionName }) => {
        return await getContractAbi(chain, contract, functionName);
    },
};
async function getContractAbi(chain, contract, functionName) {
    try {
        const publicClients = createViemPublicClient(chain);
        const blockExplorer = Array.isArray(publicClients)
            ? publicClients[0]
            : publicClients;
        if (!blockExplorer) {
            throw new Error(`Block explorer not available for chain: ${chain}`);
        }
        const url = `${blockExplorer}/api?module=contract&action=getabi&address=${contract}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.status === "1") {
            return extractFunctionSignatures(data.result, functionName);
        }
        return `Contract not verified on chain: ${chain}`;
    }
    catch (error) {
        return `Error fetching ABI from chain ${chain}: ${error instanceof Error ? error.message : String(error)}`;
    }
}
function extractFunctionSignatures(abiString, functionName) {
    try {
        const abi = JSON.parse(abiString);
        const functions = abi
            .filter((item) => item.type === "function")
            .map((fn) => `${fn.name}(${(fn.inputs || []).map((i) => i.type).join(",")})`);
        // If looking for specific function
        if (functionName) {
            // Try exact match first
            const exact = functions.find((f) => f.toLowerCase().startsWith(`${functionName.toLowerCase()}(`));
            if (exact)
                return exact;
            // Try partial match
            const partial = functions.find((f) => f.toLowerCase().includes(functionName.toLowerCase()));
            if (partial)
                return partial;
            return "Function not found";
        }
        return functions;
    }
    catch {
        return "Invalid ABI format";
    }
}
