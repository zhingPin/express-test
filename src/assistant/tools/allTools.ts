import { ToolConfig } from "../../types/toolConfig.js";
import { gitRepoReaderTool } from "./read/getGit/getGitRepos.js";
import { dexPriceAggregatorTool } from "./read/getWeb3/dexPriceAggregator.js";
import { getAvailableChainsTool } from "./read/getWeb3/getAvailableChains.js";
import { getContractAbiTool } from "./read/getWeb3/getContractAbi.js";
import { getCryptoPriceTool } from "./read/getWeb3/getCryptoPrices.js";
import { getTokenBalanceTool } from "./read/getWeb3/getTokenBalance.js";
import { getTransactionDetailsTool } from "./read/getWeb3/getTransactionDetails.js";
import { getWalletAddressTool } from "./read/getWeb3/getWalletAddress.js";
import { readContractTool } from "./read/getWeb3/readContract.js";
import { deployErc20Tool } from "./write/deployErc20.js";
import { sendTransactionTool } from "./write/sendTransaction.js";
import { uniswapV3CreatePoolTool } from "./write/uniswapV3createPool.js";
import { writeContractTool } from "./write/writeContract.js";

export const tools: Record<string, ToolConfig> = {
    // == READ == \\
    // GIT
    read_git_repo: gitRepoReaderTool,
    //BLOCKCHAIN
    get_token_prices_from_dexs: dexPriceAggregatorTool,
    get_available_chains: getAvailableChainsTool,
    get_contract_abi: getContractAbiTool,
    get_crypto_prices: getCryptoPriceTool,
    get_balance: getTokenBalanceTool,
    get_transaction_details: getTransactionDetailsTool,
    get_wallet_address: getWalletAddressTool,
    read_contract: readContractTool,

    // //   // == WRITE == \\
    deploy_erc20: deployErc20Tool,
    send_transaction: sendTransactionTool,
    create_uniswap_v3_pool: uniswapV3CreatePoolTool,
    write_contract: writeContractTool,
};
