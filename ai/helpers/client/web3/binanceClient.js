import Binance from 'binance-api-node';

export const client = Binance({
    apiKey: process.env.BINANCE_API_KEY,
    apiSecret: process.env.BINANCE_API_SECRET,
});

// Get balances
const balances = await client.accountInfo();
console.log(balances.balances);

// Get BTC/USDT price
const price = await client.prices({ symbol: 'BTCUSDT' });
console.log(price);
