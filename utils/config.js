import dotenv from 'dotenv';
dotenv.config();

const requiredEnvVars = [
  'REPORTER_ID',
  'SYMBOL',
  'PACT_PRIVATE_KEY',
  'PACT_PUBLIC_KEY',
  'TELEGRAM_BOT_TOKEN',
  'TELEGRAM_CHAT_ID'
];

// Validate required environment variables, extra caution to ensure we are on the right network
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
});

export const config = {
  // Reporter configuration
  reporter: process.env.REPORTER_ID,
  symbol: process.env.SYMBOL || 'KDA/USD',

  // Kadena configuration
  kadena: {
    networkId: process.env.KADENA_NETWORK_ID || 'mainnet01',
    apiHost: process.env.KADENA_API_HOST || 'api.chainweb.com',
    chainId: process.env.KADENA_CHAIN_ID || '2',
    contractName: process.env.CONTRACT_NAME || 'n_f9b22d2046c2a52575cc94f961c8b9a095e349e7.oracle',
    gasLimit: parseInt(process.env.GAS_LIMIT || '5000'),
    gasPrice: parseFloat(process.env.GAS_PRICE || '0.0000001'),
    ttl: parseInt(process.env.TTL || '7200'),
  },

  // Keypair for signing transactions
  keypair: {
    publicKey: process.env.PACT_PUBLIC_KEY,
    secretKey: process.env.PACT_PRIVATE_KEY
  },

  // Price API configuration
  priceApis: {
    timeout: parseInt(process.env.API_TIMEOUT || '30000'),
    maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
    deviationThreshold: parseFloat(process.env.PRICE_DEVIATION_THRESHOLD || '0.05') // 5%
  },

  // Telegram configuration
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    chatId: process.env.TELEGRAM_CHAT_ID
  },
  chains: process.env.CHAIN_IDS ? process.env.CHAIN_IDS.split(',') : ['1']
};
