import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'https://public-api-v2.bags.fm/api/v1';
const SOL_MINT = 'So11111111111111111111111111111111111111112';
const COYOTE = 'Cmt1QS7ithsa3Qe1v8UrQfJ4JTpcj3vMsMFJ8H3uBAGS';
const LAMPORTS = 1_000_000_000;

function getApiKey(): string {
  const envPath = path.join(process.env.HOME || '', '.credentials', 'bags.env');
  const content = fs.readFileSync(envPath, 'utf-8');
  const match = content.match(/BAGS_API_KEY=(.+)/);
  if (match) return match[1].trim();
  throw new Error('BAGS_API_KEY not found');
}

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'x-api-key': getApiKey() },
  timeout: 30000,
});

async function main() {
  // Sell 510,000 tokens
  const rawAmount = 510000 * LAMPORTS;
  
  console.log('Getting quote...');
  const quoteRes = await api.get('/trade/quote', {
    params: {
      inputMint: COYOTE,
      outputMint: SOL_MINT,
      amount: rawAmount.toString(),
      slippageBps: 100,
      slippageMode: 'manual',
    },
  });
  
  console.log('Quote success:', quoteRes.data.success);
  const quote = quoteRes.data.response;
  console.log('Out amount:', Number(quote.outAmount) / LAMPORTS, 'SOL');
  
  console.log('\nGetting swap tx...');
  const swapRes = await api.post('/trade/swap', {
    quoteResponse: quote,
    userPublicKey: 'bL7yksLLAUZDhSXvxhMEVpruqhUNn8T8C4jWzdnVChm',
  });
  
  console.log('Swap success:', swapRes.data.success);
  console.log('Response keys:', Object.keys(swapRes.data.response || {}));
  
  const { swapTransaction } = swapRes.data.response;
  console.log('TX length:', swapTransaction?.length);
  console.log('TX first 100 chars:', swapTransaction?.substring(0, 100));
  
  // Decode and check
  const buf = Buffer.from(swapTransaction, 'base64');
  console.log('Decoded bytes:', buf.length);
  console.log('First 10 bytes:', [...buf.slice(0, 10)]);
}

main().catch(console.error);

// Try as base58
import bs58 from 'bs58';

async function tryBase58() {
  const quoteRes = await api.get('/trade/quote', {
    params: {
      inputMint: COYOTE,
      outputMint: SOL_MINT,
      amount: (510000 * LAMPORTS).toString(),
      slippageBps: 100,
      slippageMode: 'manual',
    },
  });
  
  const quote = quoteRes.data.response;
  
  const swapRes = await api.post('/trade/swap', {
    quoteResponse: quote,
    userPublicKey: 'bL7yksLLAUZDhSXvxhMEVpruqhUNn8T8C4jWzdnVChm',
  });
  
  const { swapTransaction } = swapRes.data.response;
  
  console.log('\n--- Trying base58 decode ---');
  try {
    const decoded = bs58.decode(swapTransaction);
    console.log('Base58 decoded length:', decoded.length);
    console.log('First bytes:', [...decoded.slice(0, 10)]);
  } catch (e: any) {
    console.log('Base58 failed:', e.message);
  }
}

tryBase58().catch(console.error);
