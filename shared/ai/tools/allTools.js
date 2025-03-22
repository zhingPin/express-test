import { getWalletAddressTool } from "../tools/read/getWalletAddress.js";
import { getContractAbiTool } from "../tools/read/getContractAbi.js";
// import { getTokenBalanceTool } from "./getTokenBalance.js";
import { readContractTool } from "../tools/read/readContract.js";
//write
import { sendTransactionTool } from "../tools/write/sendTransaction.js";
import { writeContractTool } from "../tools/write/writeContract.js";
// import { deployErc20Tool } from "./deployErc20.js";
import { uniswapV3CreatePoolTool } from "../tools/write/uniswapV3createPool.js";
import { getCryptoPriceTool } from "../tools/read/getCryptoPrices.js";
import { dexPriceAggregatorTool } from "../tools/read/tokenPriceAggregator.js";
import { gitRepoReaderTool } from "../tools/read/getGitRepos.js";
import { getTokenBalanceTool } from "./read/getTokenBalance.js";
import { getAvailableChainsTool } from "./getChains.js";
export const tools = {
    // == READ == \\
    get_available_chains: getAvailableChainsTool, // New tool to get available chains
    get_balance: getTokenBalanceTool,
    get_wallet_address: getWalletAddressTool,
    get_contract_abi: getContractAbiTool,
    read_contract: readContractTool,
    // get_transaction_details: getTransactionDetailsTool,
    get_crypto_prices: getCryptoPriceTool,
    get_token_prices_from_dexs: dexPriceAggregatorTool,
    read_git_repo: gitRepoReaderTool,
    // get_transaction_receipt: getTransactionReceiptTool,
    //   get_token_balance: getTokenBalanceTool,
    //   // get_contract_bytecode: getContractBytecodeTool,
    //   // == WRITE == \\
    send_transaction: sendTransactionTool,
    write_contract: writeContractTool,
    //   deploy_erc20: deployErc20Tool,
    create_uniswap_v3_pool: uniswapV3CreatePoolTool,
    //   approve_token_allowance: approveTokenAllowanceTool,
    //   // Add more tools here...
};
