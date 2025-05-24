# Kadena Oracle Daemon

A lightweight Oracle Daemon for submitting price data to the Kadena blockchain.

## Features

- 🚀 Modern Node.js with ES modules
- ⚡ Lightweight and efficient
- 📊 Multiple price source aggregation
- 🔒 Secure key management
- 📱 Telegram alerts and monitoring
- 🛡️ Robust error handling and retries
- 🔄 Automatic price validation and outlier detection

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment configuration:
   ```bash
   cp .env.example .env
   ```

3. Configure your environment variables in `.env`

4. Start the daemon:
   ```bash
   npm start
   ```

## Development

Run in development mode with auto-restart:
```bash
npm run dev
```

## Deployment

### Systemd Service

1. Create service file:
   ```bash
   sudo cp oracle-daemon.service /etc/systemd/system/
   sudo systemctl enable oracle-daemon
   sudo systemctl start oracle-daemon
   ```

2. Check status:
   ```bash
   sudo systemctl status oracle-daemon
   ```

## Configuration

All configuration is done through environment variables. See `.env.example` for all available options.

### Required Variables

- `REPORTER_ID`: Your reporter identifier
- `SYMBOL`: Trading pair symbol (e.g., KDA/USD)
- `PACT_PUBLIC_KEY`: Your Pact public key
- `PACT_PRIVATE_KEY`: Your Pact private key (keep secure!)
- `TELEGRAM_BOT_TOKEN`: Telegram bot token for alerts
- `TELEGRAM_CHAT_ID`: Telegram chat ID for alerts

## Security

- Keep your private keys secure and never commit them to version control
- Use environment variables for all sensitive configuration
- Regularly rotate API keys and credentials
- Monitor logs for suspicious activity

## Monitoring

The daemon sends alerts to Telegram for:
- Successful price submissions
- Error conditions
- Startup/shutdown events

## License

MIT
