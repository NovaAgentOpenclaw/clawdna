#!/usr/bin/env npx ts-node
/**
 * Sell tokens via Jupiter Ultra API
 */
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { Connection, Keypair, VersionedTransaction } from '@solana/web3.js';

const JUPITER_URL = 'https://api.jup.ag/swap/v1';
const RPC_URL = 'https://api.mainnet-beta.solana.com';
const SOL_MINT = 'So11111111111111111111111111111111111111112';

function getKeypair(): Keypair {
  const keypairPath = path.join(process.env.HOME || '', 'clawd-bagbot', 'wallet', 'bagbot-keypair.json');
  const secretKey = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));
  return Keypair.fromSecretKey(new Uint8Array(secretKey));
}

async function sellTokens(tokenMint: string, tokenAmount: number) {
  const connection = new Connection(RPC_URL, 'confirmed');
  const keypair = getKeypair();
  const wallet = keypair.publicKey.toBase58();
  
  // BAGS tokens use 9 decimals
  const rawAmount = Math.floor(tokenAmount * 1_000_000_000);
  
  console.log(`\n🔄 SELLING TOKENS via Jupiter`);
  console.log(`   Wallet: ${wallet}`);
  console.log(`   Selling: ${tokenAmount.toLocaleString()} tokens`);
  console.log(`   Token: ${tokenMint.slice(0,8)}...BAGS`);
  console.log(`   Raw amount: ${rawAmount}\n`);

  // Step 1: Quote
  console.log('📊 Getting quote...');
  const quoteRes = await axios.get(`${JUPITER_URL}/quote`, {
    params: {
      inputMint: tokenMint,
      outputMint: SOL_MINT,
      amount: rawAmount,
      slippageBps: 100,
    },
  });
  
  const quote = quoteRes.data;
  const solOut = Number(quote.outAmount) / 1_000_000_000;
  console.log(`   Expected: ~${solOut.toFixed(4)} SOL`);
  console.log(`   Price Impact: ${quote.priceImpactPct}%\n`);

  // Step 2: Get swap transaction
  console.log('🔨 Building transaction...');
  const swapRes = await axios.post(`${JUPITER_URL}/swap`, {
    quoteResponse: quote,
    userPublicKey: wallet,
    dynamicComputeUnitLimit: true,
    prioritizationFeeLamports: 50000,
  });

  const { swapTransaction } = swapRes.data;
  console.log('   ✅ Transaction built\n');

  // Step 3: Sign and send
  console.log('✍️ Signing and broadcasting...');
  const txBuffer = Buffer.from(swapTransaction, 'base64');
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
    return { signature, solOut, success: false };
  } else {
    console.log(`   ✅ CONFIRMED!`);
    console.log(`\n🎉 SOLD ${tokenAmount.toLocaleString()} tokens for ~${solOut.toFixed(4)} SOL`);
    console.log(`   https://solscan.io/tx/${signature}`);
    return { signature, solOut, success: true };
  }
}

// Run
const [,, mint, amount] = process.argv;
if (!mint || !amount) {
  console.log('Usage: npx ts-node jupiter-sell.ts <mint> <amount>');
  process.exit(1);
}

sellTokens(mint, parseFloat(amount)).catch(console.error);
