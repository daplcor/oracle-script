import axios from 'axios';
import { config } from './config.js';

const TELEGRAM_API_URL = `https://api.telegram.org/bot${config.telegram.botToken}`;

export const sendAlert = async (message) => {
  if (!config.telegram.botToken || !config.telegram.chatId) {
    console.log('📢 Alert (Telegram not configured):', message);
    return;
  }

  try {
    console.log('🔍 Telegram debug:', {
      botToken: config.telegram.botToken.substring(0, 10) + '...',
      chatId: config.telegram.chatId,
      messageLength: message.length
    });

    const response = await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
      chat_id: config.telegram.chatId,
      text: `🤖 Oracle Bot\n\n${message}`,
      parse_mode: 'HTML'
    }, {
      timeout: 10000
    });

    if (response.data.ok) {
      console.log('📤 Alert sent to Telegram');
    } else {
      console.error('❌ Telegram response not ok:', response.data);
    }
  } catch (error) {
    console.error('❌ Full Telegram error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
  }
};

export const sendStartupAlert = async () => {
  const message = `
🚀 <b>Oracle Daemon Started</b>

📊 Reporter: <code>${config.reporter}</code>
💱 Symbol: <code>${config.symbol}</code>
🌐 Network: <code>${config.kadena.networkId}</code>
⛓️ Chain: <code>${config.kadena.chainId}</code>

✅ System is online and monitoring...
  `;

  await sendAlert(message);
};

export const sendShutdownAlert = async () => {
  await sendAlert('🛑 Oracle Daemon shutting down...');
};
