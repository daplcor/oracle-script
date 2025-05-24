import { Pact, createClient, createSignWithKeypair, isSignedTransaction } from '@kadena/client';
import { config } from './config.js';

const createJsClient = (chainId = config.kadena.chainId) => {
  const { networkId, apiHost } = config.kadena;
  return createClient(`https://${apiHost}/chainweb/0.0/${networkId}/chain/${chainId}/pact`);
};

const signWithKeypair = createSignWithKeypair(config.keypair);

// Helper to convert Pact decimal values
export const fromPactDecimal = value => value?.decimal ? Number(value.decimal) : value;

// Execute local (read-only) Pact calls
const executeLocal = async (pactCode, chainId = config.kadena.chainId) => {
  const client = createJsClient(chainId);

  const transaction = Pact.builder
    .execution(pactCode)
    .setMeta({ chainId: String(chainId) })
    .setNetworkId(config.kadena.networkId)
    .createTransaction();

  try {
    const response = await client.dirtyRead(transaction);
    return response;
  } catch (error) {
    console.error("Local Pact execution error:", error);
    throw new Error(`Local call failed: ${error.message}`);
  }
};

// Execute transaction (write) Pact calls
const executeTransaction = async (pactCode, chainId = config.kadena.chainId) => {
  const client = createJsClient(chainId);
  const senderAccount = `k:${config.keypair.publicKey}`;

  const transaction = Pact.builder
    .execution(pactCode)
    .addSigner(config.keypair.publicKey)
    .setMeta({
      chainId: String(chainId),
      gasLimit: config.kadena.gasLimit,
      gasPrice: config.kadena.gasPrice,
      sender: senderAccount,
      ttl: config.kadena.ttl
    })
    .setNetworkId(config.kadena.networkId)
    .createTransaction();

  try {
    console.log('Transaction object:', JSON.stringify(transaction, null, 2));

    // Sign the transaction
    const signedTx = await signWithKeypair(transaction);
    console.log('Signed transaction:', JSON.stringify(signedTx));

    // check before we submit, saves gas and embarassment
    const preflightResult = await client.preflight(signedTx);

    if (preflightResult.result.status === "failure") {
      throw new Error(`Preflight failed: ${preflightResult.result.error.message}`);
    }

    // Submits transaction if signed properly
    if (isSignedTransaction(signedTx)) {
      const transactionDescriptor = await client.submit(signedTx);
      const result = await client.listen(transactionDescriptor);

      return {
        txId: transactionDescriptor.requestKey,
        result: result.result
      };
    } else {
      throw new Error('Transaction signing failed');
    }

  } catch (error) {
    console.error("Transaction execution error:", error);
    throw new Error(`Transaction failed: ${error.message}`);
  }
};

// Check when the reporter can next submit a report
export const checkReportTime = async (reporter, symbol, chainId = config.kadena.chainId) => {
  const pactCode = `(${config.kadena.contractName}.check-reporter-time "${reporter}" "${symbol}")`;
  const response = await executeLocal(pactCode, chainId);

  if (response.result.status === 'success') {
    const data = response.result.data;

    // Handle different possible return formats, maybe unnecessary?
    if (typeof data === 'string') {
      return data;
    } else if (data && data.timep) {
      return data.timep;
    } else if (data && data.time) {
      return data.time;
    } else if (data && typeof data === 'object') {
      return data.timep || data.time || data.timestamp || data;
    } else {
      return data;
    }
  } else {
    throw new Error(`Failed to check report time: ${response.result.error.message}`);
  }
};

// Submit a price report to the oracle
export const submitReport = async (symbol, reporter, value, chainId = config.kadena.chainId) => {
  const pactCode = `(${config.kadena.contractName}.submit-report "${symbol}" "${reporter}" ${value})`;
  const result = await executeTransaction(pactCode, chainId);
  if (result.result.status === 'success') {
    return result;
  } else {
    throw new Error(`Failed to submit report: ${result.result.error?.message || 'Unknown error'}`);
  }
};

// Get current oracle price (for validation)
export const getCurrentPrice = async (symbol, chainId = config.kadena.chainId) => {
  const pactCode = `(${config.kadena.contractName}.get-price "${symbol}")`;
  const response = await executeLocal(pactCode, chainId);

  if (response.result.status === 'success') {
    return {
      value: fromPactDecimal(response.result.data.value),
      timestamp: response.result.data.timestamp
    };
  } else {
    throw new Error(`Failed to get current price: ${response.result.error.message}`);
  }
};