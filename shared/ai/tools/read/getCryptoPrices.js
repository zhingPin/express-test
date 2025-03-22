export const getCryptoPriceTool = {
    definition: {
        type: "function",
        function: {
            name: "get_crypto_prices",
            description: "Get the current price of a cryptocurrency in a given currency using CoinMarketCap",
            parameters: {
                type: "object",
                properties: {
                    symbol: {
                        type: "string",
                        description: "The symbol of the cryptocurrency (e.g., BTC, ETH)",
                    },
                    currency: {
                        type: "string",
                        description: "The currency to convert the cryptocurrency into (e.g., USD, GBP)",
                    },
                },
                required: ["symbol", "currency"],
            },
        },
    },
    handler: async ({ symbol, currency }) => {
        console.log("handler", await getCryptoPrice({ symbol, currency })); // Pass an object with symbol and currency
        return await getCryptoPrice({ symbol, currency }); // Pass an object with symbol and currency
    },
};
async function getCryptoPrice({ symbol, currency }) {
    const apiKey = process.env.COINMARKET_API;
    if (!apiKey) {
        throw new Error("COINMARKET_API environment variable is not set");
    }
    const url = `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?symbol=${symbol}&convert=${currency}`;
    console.log(`Requesting URL: ${url}`);
    const response = await fetch(url, {
        headers: {
            "X-CMC_PRO_API_KEY": apiKey,
            Accept: "application/json",
        },
    });
    if (!response.ok) {
        const errorDetails = await response.text();
        console.error("Error fetching data:", errorDetails);
        throw new Error(`Error fetching data: ${response.statusText}, Details: ${errorDetails}`);
    }
    const data = await response.json();
    console.log("API response data:", JSON.stringify(data.data[symbol][0]?.quote, null, 2)); // Format for easier inspection
    // Check if the response has data for the symbol
    if (!data.data[symbol]) {
        throw new Error(`Symbol '${symbol}' not found in the response data. Response data: ${JSON.stringify(data.data)}`);
    }
    // Check if the symbol data is an array
    if (!Array.isArray(data.data[symbol])) {
        throw new Error(`Symbol '${symbol}' data is not in array format. Data: ${JSON.stringify(data.data[symbol])}`);
    }
    // Check if the array contains any objects
    if (data.data[symbol].length === 0) {
        throw new Error(`No data found for symbol '${symbol}'. Response: ${JSON.stringify(data.data[symbol])}`);
    }
    // Extract the first item from the array
    const quoteData = data.data[symbol][0][currency];
    if (!quoteData) {
        throw new Error(`Currency '${currency}' not found for symbol '${symbol}' in the response. Response: ${JSON.stringify(data.data[symbol][0])}`);
    }
    const price = quoteData.price;
    if (!price) {
        throw new Error(`Price for symbol '${symbol}' in '${currency}' not available. Response: ${JSON.stringify(quoteData)}`);
    }
    return price;
}
// const Price = await getCryptoPrice({ symbol: "BONK", currency: "USD" });
// console.log(`The current price of BONK in USD is: $${Price}`);
