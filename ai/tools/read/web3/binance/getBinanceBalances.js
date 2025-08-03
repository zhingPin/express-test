import Binance from "binance-api-node";

export const getBinanceBalancesTool = {
    definition: {
        type: "function",
        function: {
            name: "get_binance_balances",
            description: "Fetch asset balances from a Binance account and return their value in USD.",
            parameters: {
                type: "object",
                properties: {
                    apiKey: {
                        type: "string",
                        description: "Binance API Key",
                    },
                    apiSecret: {
                        type: "string",
                        description: "Binance API Secret",
                    },
                },
                required: ["apiKey", "apiSecret"],
            },
        },
    },

    handler: async ({ apiKey, apiSecret }) => {
        return await getBinanceBalances(apiKey, apiSecret);
    },
};

async function getBinanceBalances(apiKey, apiSecret) {
    try {
        const client = Binance({ apiKey, apiSecret });
        const account = await client.accountInfo();

        const nonZero = account.balances.filter(b => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0);
        const symbols = nonZero.map(b => b.asset);

        const priceResponse = await getCryptoPriceTool.handler({ symbols });

        const assets = nonZero.map(b => {
            const total = parseFloat(b.free) + parseFloat(b.locked);
            const price = priceResponse[b.asset] ?? 0;
            return {
                asset: b.asset,
                total,
                priceUsd: price,
                valueUsd: +(total * price).toFixed(2),
            };
        });

        const totalValue = assets.reduce((acc, a) => acc + a.valueUsd, 0);

        return {
            success: true,
            totalValueUsd: +totalValue.toFixed(2),
            assets,
        };
    } catch (error) {
        return {
            success: false,
            message: `Failed to fetch Binance balances: ${error.message}`,
        };
    }
}
