export const dexPriceAggregatorTool = {
    definition: {
        type: "function",
        function: {
            name: "get_token_prices_from_dexs",
            description: "Get data from Uniswap and other DEXs.",
            parameters: {
                type: "object",
                properties: {
                    symbols: {
                        type: "array",
                        items: { type: "string" },
                        description: "List of token symbols to query prices for.",
                    },
                    first: {
                        type: "number",
                        description: "Number of pools to fetch (default: 1000).",
                    },
                    skip: {
                        type: "number",
                        description: "Offset for pagination (default: 0).",
                    },
                    orderBy: {
                        type: "string",
                        description: "Field to order by (default: 'volumeUSD').",
                    },
                    orderDirection: {
                        type: "string",
                        enum: ["asc", "desc"],
                        description: "Order direction (default: 'desc').",
                    },
                },
                required: ["symbols"],
            },
        },
    },
    handler: async ({ symbols, first = 1000, skip = 0, orderBy = "volumeUSD", orderDirection = "desc", }) => {
        return await getDexPoolsData({
            symbols,
            first,
            skip,
            orderBy,
            orderDirection,
        });
    },
};
const graphAPI = process.env.THEGRAPH_API_KEY;
if (!graphAPI) {
    throw new Error("The Graph API key must be set in environment variables.");
}
const getDexPoolsData = async ({ first = 1000, skip = 0, orderBy = "volumeUSD", orderDirection = "desc", symbols, }) => {
    const apiUrl = `https://gateway.thegraph.com/api/${graphAPI}/subgraphs/id/5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV`;
    const query = ` query { pools(first: ${first}, skip: ${skip}, orderBy: ${orderBy}, orderDirection: ${orderDirection}) { token0 { symbol name id totalSupply } token1 { symbol name id totalSupply } totalValueLockedETH totalValueLockedUSD volumeUSD } } `;
    console.log("API Request:", query);
    try {
        const result = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${graphAPI}`,
            },
            body: JSON.stringify({ query }),
        });
        if (!result.ok) {
            throw new Error(`HTTP error! Status: ${result.status}`);
        }
        const data = await result.json();
        if (!data?.data?.pools) {
            throw new Error("No pools data found in the response");
        }
        const pools = data.data.pools;
        const filteredPools = pools.filter((pool) => {
            return (symbols.includes(pool.token0.symbol) ||
                symbols.includes(pool.token1.symbol));
        });
        console.log("Filtered pools:", filteredPools);
        return JSON.stringify({ success: true, data: filteredPools });
    }
    catch (error) {
        console.error("Error fetching DEX data:", error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "Unknown error",
        };
    }
};
