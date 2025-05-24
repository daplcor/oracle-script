import { fetchPrices } from '../utils/prices.js';

async function testPriceFetching() {
  console.log('🧪 Testing price fetching...');

  try {
    const price = await fetchPrices('KDA/USD');
    console.log(`✅ Price fetched: ${price}`);

    // Validate reasonable price range
    if (price > 0 && price < 100) {
      console.log('✅ Price is in reasonable range');
    } else {
      console.log('⚠️ Price seems unusual:', price);
    }
  } catch (error) {
    console.error('❌ Price fetching failed:', error.message);
  }
}

testPriceFetching();