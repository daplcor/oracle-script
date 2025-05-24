import axios from 'axios';
import { config } from './config.js';

// CoinGecko price fetcher
const getKdaUsdPriceCoinGecko = async () => {
  const url = "https://api.coingecko.com/api/v3/simple/price?ids=kadena&vs_currencies=usd";
  try {
    const response = await axios.get(url, { timeout: config.priceApis.timeout });
    return response.data.kadena.usd;
  } catch (error) {
    console.error('Error fetching from CoinGecko:', error.message);
    return null;
  }
};

// CoinMarketCap price fetcher
const getKdaUsdPriceCoinMarketCap = async () => {
  if (!process.env.COINMARKETCAP_API_KEY) {
    console.log('CoinMarketCap API key not provided, skipping...');
    return null;
  }

  const url = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest';
  const headers = {
    'Accepts': 'application/json',
    'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY
  };

  try {
    const response = await axios.get(url, {
      headers: headers,
      params: { symbol: 'KDA' },
      timeout: config.priceApis.timeout
    });

    const data = response.data;
    if (data && data.data && data.data.KDA && data.data.KDA.quote && data.data.KDA.quote.USD) {
      return data.data.KDA.quote.USD.price;
    } else {
      console.error('Error: Data structure from CoinMarketCap is not as expected:', JSON.stringify(data, null, 2));
      return null;
    }
  } catch (error) {
    console.error('Error fetching from CoinMarketCap:', error.message);
    return null;
  }
};

// CoinCap price fetcher
const getKdaUsdPriceCoinCap = async () => {
  const url = 'https://rest.coincap.io/v3/assets/kadena';
  const headers = {
    'Accepts': 'application/json',
    'Authorization': `Bearer ${process.env.COINCAP_API_KEY}`
  };
  try {
    const response = await axios.get(url, { headers: headers, timeout: config.priceApis.timeout });
    if (response.data.data) {
      return parseFloat(response.data.data.priceUsd);
    } else {
      console.log('Unexpected response structure:', response.data);
      return null;
    }
  } catch (error) {
    console.error('Error fetching from CoinCap:', error.message);
    return null;
  }
};

// Main price fetching function - using basic average
export const fetchPrices = async (symbol) => {
  // console.log(`Fetching prices for ${symbol}...`);

  const prices = await Promise.all([
    getKdaUsdPriceCoinGecko(),
    getKdaUsdPriceCoinMarketCap(),
    getKdaUsdPriceCoinCap(),
  ]);

  const validPrices = prices.filter(price => price != null);

  if (validPrices.length === 0) {
    throw new Error('Failed to fetch any valid prices');
  }

  // console.log(`💰 Valid prices fetched: ${validPrices.length}`, validPrices);

  const sum = validPrices.reduce((acc, price) => acc + price, 0);
  const averagePrice = sum / validPrices.length;
  const finalPrice = parseFloat(averagePrice.toFixed(12));

  // console.log(`📊 Average price calculated: ${finalPrice}`);

  return finalPrice;
};