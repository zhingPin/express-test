import { getCryptoPriceTool } from "../getCryptoPrices.js";
import { getPortfolioHoldingsTool } from "./getPortfolioHoldingsTool.js";


export const getPortfolioValuationTool = {
    definition: {
        type: "function",
        function: {
            name: "get_portfolio_valuation",
            description: "Value a user's portfolio in a base currency and compute allocations.",
            parameters: {
                type: "object",
                properties: {
                    user_id: { type: "string" },
                    base_currency: { type: "string", description: "Fiat or crypto symbol, e.g., USD, GBP" },
                    holdings: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                asset: { type: "string" },
                                chain: { type: "string", optional: true },
                                accountId: { type: "string", optional: true },
                                quantity: { type: "string" }
                            },
                            required: ["asset", "quantity"]
                        },
                        optional: true
                    }
                },
                required: ["user_id", "base_currency"]
            }
        }
    },
    handler: async ({ user_id, base_currency, holdings }) => {
        const h = holdings?.length
            ? holdings
            : (await getPortfolioHoldingsTool.handler({ user_id })).positions;

        // Collect unique assets
        const symbols = [...new Set(h.map(p => p.asset))];

        // Fetch prices (expect {symbol: priceInBase})
        const priceResp = await getCryptoPriceTool.handler({
            symbols,
            convert: base_currency
        });

        const priceMap = priceResp?.prices || {};

        let total = 0n;
        const valued = [];
        for (const p of h) {
            const price = priceMap[p.asset]?.price ?? 0;
            // assume bignumber or decimal library; placeholder below
            const value = Number(p.quantity) * Number(price);
            valued.push({ ...p, price: String(price), value: String(value) });
            total += BigInt(Math.round(value * 1e8)); // store scaled? up to you
        }

        const totalNum = Number(total) / 1e8;
        const enriched = valued.map(v => ({
            ...v,
            allocation_pct: totalNum > 0 ? (Number(v.value) / totalNum) * 100 : 0
        }));

        return {
            success: true,
            baseCurrency: base_currency,
            totalValue: String(totalNum),
            positions: enriched
        };
    }
};
