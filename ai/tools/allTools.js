import { getWalletAddressTool } from "./read/web3/getWalletAddress.js";
import { getContractAbiTool } from "../tools/read/getContractAbi.js";
// import { getTokenBalanceTool } from "./getTokenBalance.js";
import { readContractTool } from "../tools/read/readContract.js";
//write
import { sendTransactionTool } from "../tools/write/sendTransaction.js";
import { writeContractTool } from "../tools/write/writeContract.js";
// import { deployErc20Tool } from "./deployErc20.js";
import { uniswapV3CreatePoolTool } from "../tools/write/uniswapV3createPool.js";
import { getCryptoPriceTool } from "./read/web3/getCryptoPrices.js";
import { dexPriceAggregatorTool } from "../tools/read/tokenPriceAggregator.js";
import { gitRepoReaderTool } from "../tools/read/getGitRepos.js";
import { getTokenBalanceTool } from "./read/web3/getTokenBalance.js";
import { getAvailableChainsTool } from "./getChains.js";
//PORTFOLIO TRACKING TOOLS
import { getPortfolioHoldingsTool } from "../tools/read/web3/portfolioTracking/getPortfolioHoldingsTool.js";
import { getPortfolioValuationTool } from "../tools/read/web3/portfolioTracking/getPortfolioValuationTool.js";
import { recordPortfolioSnapshotTool } from "../tools/read/web3/portfolioTracking/recordPortfolioSnapshotTool.js";

import { getBinanceBalancesTool } from "../tools/read/web3/binance/getBinanceBalances.js";
// // later:
// import { getPortfolioPerformanceTool } from "../tools/portfolio/getPortfolioPerformance.js";
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
    get_portfolio_holdings: getPortfolioHoldingsTool,
    get_portfolio__valuation: getPortfolioValuationTool,
    record_portfolio_snapshot_tool: recordPortfolioSnapshotTool,

    get_binance_balances: getBinanceBalancesTool,
    //   // == WRITE == \\
    send_transaction: sendTransactionTool,
    write_contract: writeContractTool,
    create_uniswap_v3_pool: uniswapV3CreatePoolTool,
    //   // Add more tools here...
};
