import 'dotenv/config';
import { config } from './utils/config.js';
import { checkReportTime, submitReport } from './utils/pact.js';
import { fetchPrices } from './utils/prices.js';
import { sendAlert, sendStartupAlert } from './utils/alerts.js';

class OracleDaemon {
  constructor() {
    this.config = config;
    this.running = false;
  }

  async start() {
    console.log('🔌 Starting Oracle Daemon...');
    console.log(`📊 Reporter: ${this.config.reporter}`);
    console.log(`💱 Symbol: ${this.config.symbol}`);
    console.log(`🌐 Network: ${this.config.kadena.networkId}`);
    console.log(`⛓️ Chains: ${this.config.chains.join(', ')}`);

    await sendStartupAlert();

    this.running = true;
    await this.run();
  }

  async run() {
  while (this.running) {
    try {
      // Check if it's time to report on the first chain
      const nextReportTimeResult = await checkReportTime(
        this.config.reporter,
        this.config.symbol,
        this.config.chains[0]
      );

      console.log(`Next report time from contract: ${nextReportTimeResult}`);

     let nextReportTime;
      if (typeof nextReportTimeResult === 'string') {
      nextReportTime = nextReportTimeResult;
      } else if (nextReportTimeResult && nextReportTimeResult.timep) {
      nextReportTime = nextReportTimeResult.timep;
      } else if (nextReportTimeResult && nextReportTimeResult.time) {
      nextReportTime = nextReportTimeResult.time;
      } else {
      console.log('Unexpected time format, using raw result:', nextReportTimeResult);
      nextReportTime = nextReportTimeResult;
      }

  console.log(`Next report time: ${nextReportTime}`);

  // Handle EPOCH time (means reporter can report immediately)
  const isEpochTime = nextReportTime === '1970-01-01T00:00:00Z';
  const currentTime = new Date();

      let canReport = false;

      if (isEpochTime) {
        console.log('⏰ Reporter at EPOCH time - can report immediately');
        canReport = true;
      } else {
        const reportTime = new Date(nextReportTime);
        canReport = currentTime >= reportTime;
        console.log(`Current time: ${currentTime.toISOString()}`);
        console.log(`Report time: ${reportTime.toISOString()}`);
        console.log(`Can report: ${canReport}`);
      }

      if (canReport) {
        console.log('⏰ Time to submit report...');

        // Fetch price data
        const price = await fetchPrices(this.config.symbol);
        console.log(`💰 Fetched price: ${price}`);

        // Submit to all configured chains
        const results = [];
        for (const chainId of this.config.chains) {
          try {
            console.log(`🔗 Submitting to chain ${chainId}...`);
            const result = await submitReport(
              this.config.symbol,
              this.config.reporter,
              price,
              chainId
            );
            results.push({ chainId, success: true, txId: result.txId });
            console.log(`✅ Chain ${chainId} - TX: ${result.txId}`);
          } catch (error) {
            console.error(`❌ Chain ${chainId} failed:`, error.message);
            results.push({ chainId, success: false, error: error.message });
          }
        }

        // Send summary alert and wait longer after submission
        const successCount = results.filter(r => r.success).length;
        const totalChains = this.config.chains.length;

        if (successCount === totalChains) {
          await sendAlert(`✅ Price report submitted successfully to all ${totalChains} chains: ${price} for ${this.config.symbol}`);
        } else {
          await sendAlert(`⚠️ Price report partially successful: ${successCount}/${totalChains} chains updated. Price: ${price}`);
        }

        await this.sleep(300000); // Wait 5 minutes after submission

      } else {
        console.log(`⏳ Next report at: ${nextReportTime}`);
        await this.sleep(60000); // Check every minute
      }

    } catch (error) {
      console.error('❌ Error in oracle loop:', error.message);

      // More specific error handling
      if (error.message.includes('row not found')) {
        console.log('🔧 Reporter may not be configured in the oracle contract');
        await sendAlert(`🔧 Configuration issue: Reporter "${this.config.reporter}" not found for symbol "${this.config.symbol}"`);
      } else {
        await sendAlert(`🚨 Oracle error: ${error.message}`);
      }

      await this.sleep(300000); // Wait 5 minutes on error
    }
  }
}

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  stop() {
    console.log('🛑 Stopping Oracle Daemon...');
    this.running = false;
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  await sendAlert('🛑 Oracle Daemon shutting down (SIGINT)...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  await sendAlert('🛑 Oracle Daemon shutting down (SIGTERM)...');
  process.exit(0);
});

// Start the daemon
const daemon = new OracleDaemon();
daemon.start().catch(async error => {
  console.error('💥 Fatal error:', error);
  await sendAlert(`💥 Oracle daemon crashed: ${error.message}`);
  process.exit(1);
});