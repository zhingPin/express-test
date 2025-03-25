import { parseEther } from "viem";
import { createViemWalletClient } from "../../wallet/viem/createViemWalletClient.js";
/**
 * Tool for sending transactions on-chain.
 */
export const sendTransactionTool = {
  definition: {
    type: "function",
    function: {
      name: "send_transaction",
      description: "Send a transaction with optional parameters",
      parameters: {
        type: "object",
        properties: {
          chain: {
            type: "string",
            description: "The blockchain network to interact with",
          },
          to: {
            type: "string",
            pattern: "^0x[a-fA-F0-9]{40}$",
            description: "The recipient address",
          },
          value: {
            type: "string",
            description: "The amount of ETH to send (in ETH, not Wei)",
            optional: true,
          },
          data: {
            type: "string",
            pattern: "^0x[a-fA-F0-9]*$",
            description: "Contract interaction data",
            optional: true,
          },
          nonce: {
            type: "number",
            description: "Transaction nonce",
            optional: true,
          },
          gasPrice: {
            type: "string",
            description: "Gas price in Gwei",
            optional: true,
          },
          accessList: {
            type: "array",
            description: "EIP-2930 access list",
            items: {
              type: "object",
              properties: {
                address: {
                  type: "string",
                  description: "Account or contract address",
                },
                storageKeys: {
                  type: "array",
                  items: {
                    type: "string",
                    description: "Storage keys to access",
                  },
                },
              },
              required: ["address", "storageKeys"],
            },
            optional: true,
          },
          factoryDeps: {
            type: "array",
            description: "Factory dependencies (contract bytecodes)",
            items: {
              type: "string",
              pattern: "^0x[a-fA-F0-9]*$",
              description: "Hex string of contract bytecode",
            },
            optional: true,
          },
          paymaster: {
            type: "string",
            pattern: "^0x[a-fA-F0-9]{40}$",
            description: "Paymaster address",
            optional: true,
          },
          paymasterInput: {
            type: "string",
            pattern: "^0x[a-fA-F0-9]*$",
            description: "Paymaster input",
            optional: true,
          },
        },
        required: ["chain", "to"],
      },
    },
  },
  handler: async (args) => {
    const result = await sendTransaction(args);
    return result;
  },
};
/**
 * Helper function for sending a transaction.
 */
async function sendTransaction({
  chain,
  to,
  value,
  data,
  nonce,
  gasPrice,
  accessList,
  factoryDeps,
  paymaster,
  paymasterInput,
}) {
  try {
    // Initialize wallet client
    const client = createViemWalletClient(chain);
    // Send the transaction
    const hash = await client.sendTransaction({
      to,
      value: value ? parseEther(value) : undefined,
      data,
      nonce,
      gasPrice: gasPrice ? parseEther(gasPrice) : undefined,
      accessList,
      customData: {
        factoryDeps,
        paymaster,
        paymasterInput,
      },
    });
    console.log(`Transaction sent successfully. Hash: ${hash}`);
    return {
      success: true,
      hash,
      message: `Transaction sent successfully. Hash: ${hash}`,
    };
  } catch (error) {
    return {
      success: false,
      hash: null,
      message: `Failed to send transaction: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}
