import { createViemWalletClient } from "../../../shared/viem/createViemWalletClient.js";
import { ERC20_ABI, ERC20_BYTECODE } from "../../const/contractDetails.js";
import { getPublicClient } from "../../../shared/viem/helpers/viemUtils.js";
/**
 * Tool for deploying a new ERC20 token contract to a specified blockchain.
 *
 * @function
 * @param {object} args - The arguments for deploying the ERC20 token contract.
 * @param {string} args.name - The name of the token (e.g., "MyToken").
 * @param {string} args.symbol - The symbol for the token (e.g., "MTK").
 * @param {string} [args.initialSupply] - The initial supply of the token, expressed in a natural language format (e.g., "1 million", "10k").
 *                                    If not specified, defaults to 1 billion tokens.
 * @param {ChainKey} args.chain - The blockchain network to deploy the token contract to.
 *
 * @returns {Promise<string>} - A promise that resolves to a string indicating the successful deployment of the ERC20 token contract
 *                              and the contract address where it was deployed.
 */
export const deployErc20Tool = {
    definition: {
        type: "function",
        function: {
            name: "deploy_erc20",
            description: "Deploy a new ERC20 token contract",
            parameters: {
                type: "object",
                properties: {
                    name: {
                        type: "string",
                        description: "The name of the token",
                    },
                    symbol: {
                        type: "string",
                        description: "The symbol of the token",
                    },
                    initialSupply: {
                        type: "string",
                        description: 'Initial supply in natural language (e.g., "one million", "half a billion", "10k", "1.5M tokens"). Interpret the amount and format it into a number amount and then convert it into wei. Defaults to 1 billion tokens if not specified.',
                    },
                    chain: {
                        type: "string",
                        description: "The chain to deploy the ERC20 token contract to",
                    },
                },
                required: ["name", "symbol", "chain"],
            },
        },
    },
    handler: async (args) => {
        // Default to 1 billion tokens if no initial supply is specified
        const baseNumber = parseFloat(args.initialSupply || "1000000000");
        // Create a wallet client for the specified chain
        const walletClient = createViemWalletClient(args.chain);
        // Deploy the contract using the wallet client
        const hash = await walletClient.deployContract({
            account: walletClient.account, // Assuming walletClient has the account info
            abi: ERC20_ABI,
            bytecode: ERC20_BYTECODE,
            args: [args.name, args.symbol, baseNumber],
        });
        // Create the public client (to handle multiple chains or a single chain)
        const publicClient = getPublicClient(args.chain);
        // Wait for the transaction receipt
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        console.log(`Contract deployed at address: ${receipt.contractAddress}`);
        // Return the success message with the contract address
        return `${args.name} (${args.symbol}) token deployed successfully at: ${receipt.contractAddress}`;
    },
};
