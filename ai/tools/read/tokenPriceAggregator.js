export const dexPriceAggregatorTool = {
    definition: {
        type: "function",
        function: {
            name: "get_token_prices_from_dexs",
            description: "Get data from currently only uniswap",
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
                        description: "Number of pools to fetch (default: 10).",
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
                required: ["symbols"], // `symbols` is required, others are optional
            },
        },
    },
    handler: async ({ symbols, first, skip, orderBy, orderDirection }) => {
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
const getDexPoolsData = async ({ first = 3, skip = 0, orderBy = "volumeUSD", orderDirection = "desc", symbols = [], } = {}) => {
    const apiUrl = `https://gateway.thegraph.com/api/${graphAPI}/subgraphs/id/5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV`;
    const query = `
    query {
    bundles(first: 1) {
    id
    ethPriceUSD
  }
      pools(first: ${first}, skip: ${skip}, orderBy: ${orderBy}, orderDirection: ${orderDirection}) {
        token0 {
          symbol
          name
          id
          totalSupply
        }
        token1 {
          symbol
          name
          id
          totalSupply
        }
        totalValueLockedETH
        totalValueLockedUSD
        volumeUSD
        createdAtTimestamp
        totalValueLockedToken0
        totalValueLockedToken1
      }
    }
  `;
    console.log("API Request:", query); // Log the query being sent to The Graph
    // try {
    const result = await fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${graphAPI}`, // Include the API key in headers
        },
        body: JSON.stringify({ query }),
    });
    if (!result.ok) {
        throw new Error(`HTTP error! Status: ${result.status}`);
    }
    const data = await result.json();
    console.log("API Response:", JSON.stringify(data, null, 2)); // Log the entire API response
    // Validate the response structure
    if (!data?.data?.pools) {
        throw new Error("No pools data found in the response");
    }
    // Filter the pools by the given symbols
    const filteredPools = data.data.pools.filter((pool) => {
        return (symbols.includes(pool.token0.symbol) ||
            symbols.includes(pool.token1.symbol));
    });
    console.log("filteredPools", filteredPools);
    console.log("filteredPools", JSON.stringify(filteredPools));
    // correct format
    console.log("JSON.stringify(data)", JSON.stringify(data));
    // incorrect format
    // console.log("data", data);
    return JSON.stringify(data); // Return filtered pools directly
};
// "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3";
