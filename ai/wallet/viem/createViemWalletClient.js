import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { eip712WalletActions } from "viem/zksync";
import { viemChains } from "./viemChains.js";
// /**
//  * Create a wallet client for one or more chains using `viem`.
//  * @param {ChainKeys} chainKeys - A single chain key or an array of chain keys.
//  * @returns {Object} An object containing the wallet client and account.
//  * @throws Will throw an error if a chain key is not supported or if the private key is missing.
//  */
export function createViemWalletClient(chainKey) {
    const chainConfig = viemChains[chainKey];
    if (!chainConfig) {
        throw new Error(`Unsupported chain: ${chainKey}`);
    }
    const privateKey = process.env.NEO_PRIVATE_KEY;
    if (!privateKey) {
        throw new Error("NEO_PRIVATE_KEY environment variable is missing.");
    }
    const account = privateKeyToAccount(privateKey); // Correctly use privateKey here
    return createWalletClient({
        account,
        chain: chainConfig,
        transport: http(),
    }).extend(eip712WalletActions());
    // return { client, account };
}
