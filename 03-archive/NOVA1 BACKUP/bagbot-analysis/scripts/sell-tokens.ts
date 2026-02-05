#!/usr/bin/env npx ts-node
/**
 * Sell tokens for SOL via bags.fm
 */
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { Connection, Keypair, VersionedTransaction } from '@solana/web3.js';

const BASE_URL = 'https://public-api-v2.bags.fm/api/v1';
const RPC_URL = 'https://api.mainnet-beta.solana.com';
const SOL_MINT = 'So11111111111111111111111111111111111111112';

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

async function sellTokens(tokenMint: string, tokenAmount: number) {
  const API_KEY = getApiKey();
  const api = axios.create({
    baseURL: BASE_URL,
    headers: { 'x-api-key': API_KEY },
    timeout: 30000,
  });

  const connection = new Connection(RPC_URL, 'confirmed');
  const keypair = getKeypair();
  const wallet = keypair.publicKey.toBase58();
  
  // BAGS tokens use 9 decimals
  const rawAmount = Math.floor(tokenAmount * 1_000_000_000);
  
  console.log(`\n🔄 SELLING TOKENS`);
  console.log(`   Wallet: ${wallet}`);
  console.log(`   Selling: ${tokenAmount.toLocaleString()} tokens`);
  console.log(`   Token: ${tokenMint.slice(0,8)}...BAGS`);
  console.log(`   Raw amount: ${rawAmount}\n`);

  // Step 1: Quote
  console.log('📊 Getting quote...');
  const quoteRes = await api.get('/trade/quote', {
    params: {
      inputMint: tokenMint,
      outputMint: SOL_MINT,
      amount: rawAmount.toString(),
      slippageBps: 100,
      slippageMode: 'manual',
    },
  });

  if (!quoteRes.data.success) {
    throw new Error(`Quote failed: ${JSON.stringify(quoteRes.data)}`);
  }

  const quote = quoteRes.data.response;
  const solOut = Number(quote.outAmount) / 1_000_000_000;
  console.log(`   Expected: ~${solOut.toFixed(4)} SOL\n`);

  // Step 2: Build transaction
  console.log('🔨 Building transaction...');
  const txRes = await api.post('/trade/transaction', {
    inputMint: tokenMint,
    outputMint: SOL_MINT,
    amount: rawAmount.toString(),
    slippageBps: 100,
    slippageMode: 'manual',
    walletAddress: wallet,
    includeTx: true,
    computeUnitPriceMicroLamports: 100000,
    priorityFeeLamports: 50000,
  });

  if (!txRes.data.success) {
    throw new Error(`Transaction build failed: ${JSON.stringify(txRes.data)}`);
  }

  const txBase64 = txRes.data.response.transaction;
  console.log('   ✅ Transaction built\n');

  // Step 3: Sign and send
  console.log('✍️ Signing and broadcasting...');
  const txBuffer = Buffer.from(txBase64, 'base64');
  const tx = VersionedTransaction.deserialize(txBuffer);
  tx.sign([keypair]);

  const signature = await connection.sendTransaction(tx, {
    skipPreflight: true,
    maxRetries: 3,
  });
  console.log(`   📤 Sent: ${signature}\n`);

  // Step 4: Confirm
  console.log('⏳ Confirming...');
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  const result = await connection.confirmTransaction({
    signature,
    blockhash,
    lastValidBlockHeight,
  }, 'confirmed');

  if (result.value.err) {
    console.log(`   ❌ Failed: ${JSON.stringify(result.value.err)}`);
  } else {
    console.log(`   ✅ CONFIRMED!`);
    console.log(`\n🎉 SOLD ${tokenAmount.toLocaleString()} tokens for ~${solOut.toFixed(4)} SOL`);
    console.log(`   https://solscan.io/tx/${signature}`);
  }

  return { signature, solOut };
}

// Run
const [,, mint, amount] = process.argv;
if (!mint || !amount) {
  console.log('Usage: npx ts-node sell-tokens.ts <mint> <amount>');
  process.exit(1);
}

sellTokens(mint, parseFloat(amount)).catch(console.error);
