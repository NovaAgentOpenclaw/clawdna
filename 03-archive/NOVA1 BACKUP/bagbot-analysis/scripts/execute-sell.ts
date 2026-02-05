#!/usr/bin/env npx ts-node
/**
 * Execute BAGS SELL - token → SOL
 */

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { 
  Connection, 
  Keypair, 
  VersionedTransaction,
  Transaction,
} from '@solana/web3.js';
import bs58 from 'bs58';

const BASE_URL = 'https://public-api-v2.bags.fm/api/v1';
const RPC_URL = 'https://api.mainnet-beta.solana.com';
const SOL_MINT = 'So11111111111111111111111111111111111111112';
const LAMPORTS_PER_SOL = 1_000_000_000;

function getApiKey(): string {
  const envPath = path.join(process.env.HOME || '', '.credentials', 'bags.env');
  const content = fs.readFileSync(envPath, 'utf-8');
  const match = content.match(/BAGS_API_KEY=(.+)/);
  if (match) return match[1].trim();
  throw new Error('BAGS_API_KEY not found');
}

function getKeypair(): Keypair {
  const keypairPath = path.join(process.env.HOME || '', 'clawd-bagbot', 'wallet', 'bagbot-keypair.json');
  const secretKey = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));
  return Keypair.fromSecretKey(new Uint8Array(secretKey));
}

const API_KEY = getApiKey();
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'x-api-key': API_KEY },
  timeout: 30000,
});

async function executeSell(
  inputMint: string,
  tokenAmount: number,
  slippageBps: number = 100
) {
  const connection = new Connection(RPC_URL, 'confirmed');
  const keypair = getKeypair();
  const wallet = keypair.publicKey.toBase58();
  
  // Tokens have 9 decimals
  const rawAmount = Math.floor(tokenAmount * LAMPORTS_PER_SOL);
  
  console.log(`\n💰 EXECUTING SELL`);
  console.log(`   Wallet: ${wallet}`);
  console.log(`   Selling: ${tokenAmount.toLocaleString()} tokens`);
  console.log(`   Token:   ${inputMint.slice(0,8)}...BAGS`);
  console.log(`   Slippage: ${slippageBps} bps\n`);

  // Step 1: Get quote
  console.log('📊 Step 1: Getting quote...');
  
  const quoteRes = await api.get('/trade/quote', {
    params: {
      inputMint,
      outputMint: SOL_MINT,
      amount: rawAmount.toString(),
      slippageBps,
      slippageMode: 'manual',
    },
  });
  
  if (!quoteRes.data.success) {
    throw new Error(`Quote failed: ${quoteRes.data.error}`);
  }
  
  const quote = quoteRes.data.response;
  const outSol = Number(quote.outAmount) / LAMPORTS_PER_SOL;
  const minOutSol = Number(quote.minOutAmount) / LAMPORTS_PER_SOL;
  
  console.log(`   ✅ Output: ${outSol.toFixed(4)} SOL`);
  console.log(`   Min: ${minOutSol.toFixed(4)} SOL`);
  console.log(`   Impact: ${quote.priceImpactPct}%`);
  console.log(`   Venue: ${quote.routePlan.map((r: any) => r.venue).join(' → ')}\n`);

  // Step 2: Build transaction
  console.log('🔨 Step 2: Building transaction...');
  
  const swapRes = await api.post('/trade/swap', {
    quoteResponse: quote,
    userPublicKey: wallet,
  });
  
  if (!swapRes.data.success) {
    throw new Error(`Swap build failed: ${swapRes.data.error}`);
  }
  
  const { swapTransaction, addressLookupTableAddresses } = swapRes.data.response;
  console.log('   ✅ Transaction built');
  console.log(`   LUTs: ${addressLookupTableAddresses?.length || 0}\n`);

  // Step 3: Sign and send
  console.log('✍️  Step 3: Signing and sending...');
  
  // Decode from base58 (bags.fm returns base58, not base64)
  const txBuffer = bs58.decode(swapTransaction);
  console.log(`   TX bytes: ${txBuffer.length}`);
  
  // Try versioned first, fall back to legacy
  let transaction: VersionedTransaction | Transaction;
  let isVersioned = true;
  try {
    transaction = VersionedTransaction.deserialize(new Uint8Array(txBuffer));
    (transaction as VersionedTransaction).sign([keypair]);
    console.log('   Using versioned transaction');
  } catch (versionedErr) {
    console.log('   Trying legacy transaction format...');
    isVersioned = false;
    transaction = Transaction.from(Buffer.from(txBuffer));
    (transaction as Transaction).sign(keypair);
  }
  
  let signature: string;
  if (isVersioned) {
    signature = await connection.sendTransaction(transaction as VersionedTransaction, {
      skipPreflight: true,
      maxRetries: 3,
    });
  } else {
    signature = await connection.sendRawTransaction(
      (transaction as Transaction).serialize(),
      { skipPreflight: true, maxRetries: 3 }
    );
  }
  
  console.log(`   📤 Sent: ${signature}`);
  console.log(`   🔗 https://solscan.io/tx/${signature}\n`);

  // Step 4: Confirm
  console.log('⏳ Step 4: Confirming...');
  
  const latestBlockhash = await connection.getLatestBlockhash();
  const confirmation = await connection.confirmTransaction({
    signature,
    blockhash: latestBlockhash.blockhash,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
  }, 'confirmed');
  
  if (confirmation.value.err) {
    throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
  }
  
  console.log('   ✅ CONFIRMED!\n');
  
  return {
    success: true,
    signature,
    inputMint,
    tokensSold: tokenAmount,
    solReceived: outSol,
    priceImpact: quote.priceImpactPct,
  };
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log(`
Usage: execute-sell <tokenMint> <tokenAmount> [slippageBps]

Example:
  execute-sell Cmt1QS7ithsa3Qe1v8UrQfJ4JTpcj3vMsMFJ8H3uBAGS 510000 100
    `);
    process.exit(1);
  }
  
  const [inputMint, tokenAmountStr, slippageStr] = args;
  const tokenAmount = parseFloat(tokenAmountStr);
  const slippageBps = slippageStr ? parseInt(slippageStr) : 100;
  
  try {
    const result = await executeSell(inputMint, tokenAmount, slippageBps);
    
    console.log('--- RESULT ---');
    console.log(JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.error(`\n❌ SELL FAILED: ${error.message}`);
    process.exit(1);
  }
}

main();
