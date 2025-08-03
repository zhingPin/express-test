// tools/portfolio/getPortfolioHoldings.js
import { PortfolioModel } from "../../../../../api/(models)/portfolioSchema.js";
import { getTokenBalanceTool } from "../getTokenBalance.js";
// TODO: exchange adapters: binanceClient, coinbaseClient, etc.

export const getPortfolioHoldingsTool = {
    definition: {
        type: "function",
        function: {
            name: "get_portfolio_holdings",
            description: "Aggregate current token balances across all enabled portfolio accounts.",
            parameters: {
                type: "object",
                properties: {
                    user_id: { type: "string", description: "User ID" },
                    accounts: {
                        type: "array",
                        description: "Optional subset of account IDs to include; omit for all.",
                        items: { type: "string" }
                    },
                    include_zero: {
                        type: "boolean",
                        description: "Include zero-balance assets",
                        optional: true
                    }
                },
                required: ["user_id"]
            }
        }
    },
    handler: async ({ user_id, accounts, include_zero }) => {
        const query = { userId: user_id, isEnabled: true };
        if (accounts?.length) query._id = { $in: accounts };
        const acctDocs = await PortfolioModel.find(query).lean();

        const positions = [];
        for (const acct of acctDocs) {
            if (acct.type === "wallet") {
                // Reuse existing balance tool per chain
                const res = await getTokenBalanceTool.handler({
                    chain: acct.chain,
                    address: acct.address
                });
                // Expect res to be [{asset, quantity}, ...]
                for (const p of res.balances ?? []) {
                    if (!include_zero && p.quantity === "0") continue;
                    positions.push({
                        asset: p.asset,
                        chain: acct.chain,
                        accountId: String(acct._id),
                        quantity: p.quantity
                    });
                }
            } else if (acct.type === "exchange") {
                // Use adapter
                const exBalances = await fetchExchangeBalances(acct); // build separately
                positions.push(...exBalances.map(b => ({
                    asset: b.asset,
                    accountId: String(acct._id),
                    quantity: b.quantity,
                    source: "exchange",
                    exchange: acct.exchange
                })));
            } else if (acct.type === "manual") {
                positions.push({
                    asset: acct.asset,
                    accountId: String(acct._id),
                    quantity: acct.quantity,
                    source: "manual"
                });
            }
        }

        return { success: true, positions };
    }
};
