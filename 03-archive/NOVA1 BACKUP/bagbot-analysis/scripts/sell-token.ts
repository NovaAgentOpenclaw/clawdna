#!/usr/bin/env npx ts-node
/**
 * Sell token → SOL via Jupiter
 * Usage: sell-token <tokenMint> <tokenAmount>
 */

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { Connection, Keypair, VersionedTransaction } from '@solana/web3.js';

const SOL_MINT = 'So11111111111111111111111111111111111111112';
const RPC_URL = 'https://api.mainnet-beta.solana.com';

function getKeypair(): Keypair {
  const keypairPath = path.join(process.env.HOME || '', 'clawd-bagbot', 'wallet', 'bagbot-keypair.json');
  const secretKey = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));
  return Keypair.fromSecretKey(new Uint8Array(secretKey));
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log('Usage: sell-token <tokenMint> <tokenAmount> [decimals=9]');
    process.exit(1);
  }
  
  const [tokenMint, amountStr, decimalsStr] = args;
  const tokenAmount = parseInt(amountStr);
  const decimals = decimalsStr ? parseInt(decimalsStr) : 9;
  
  const connection = new Connection(RPC_URL, 'confirmed');
  const keypair = getKeypair();
  const wallet = keypair.publicKey.toBase58();
  
  // Raw amount with decimals
  const rawAmount = BigInt(tokenAmount) * BigInt(10 ** decimals);
  console.log(`\n🔄 SELLING ${tokenAmount.toLocaleString()} tokens → SOL`);
  console.log(`   Mint: ${tokenMint.slice(0,8)}...${tokenMint.slice(-4)}`);
  console.log(`   Wallet: ${wallet}`);
  console.log(`   Raw amount: ${rawAmount}`);
  
  // Get Jupiter quote
  const quoteUrl = `https://quote-api.jup.ag/v6/quote?inputMint=${tokenMint}&outputMint=${SOL_MINT}&amount=${rawAmount}&slippageBps=100`;
  console.log(`\n📊 Getting quote...`);
  
  const quoteRes = await axios.get(quoteUrl);
  const quote = quoteRes.data;
  
  if (quote.error) {
    throw new Error(`Quote error: ${quote.error}`);
  }
  
  const outLamports = BigInt(quote.outAmount);
  const outSol = Number(outLamports) / 1e9;
  console.log(`   Quote: ${tokenAmount.toLocaleString()} tokens → ${outSol.toFixed(6)} SOL`);
  console.log(`   Price impact: ${quote.priceImpactPct}%`);
  
  if (parseFloat(quote.priceImpactPct) > 5) {
    console.error(`❌ Price impact too high (>5%). Aborting.`);
    process.exit(1);
  }
  
  // Get swap transaction
  console.log(`\n🔧 Building transaction...`);
  const swapRes = await axios.post('https://quote-api.jup.ag/v6/swap', {
    quoteResponse: quote,
    userPublicKey: wallet,
    wrapAndUnwrapSol: true,
  });
  
  const { swapTransaction } = swapRes.data;
  
  // Deserialize and sign
  const txBuf = Buffer.from(swapTransaction, 'base64');
  const tx = VersionedTransaction.deserialize(txBuf);
  tx.sign([keypair]);
  
  // Send
  console.log(`📤 Sending transaction...`);
  const signature = await connection.sendRawTransaction(tx.serialize(), {
    skipPreflight: true,
    maxRetries: 3,
  });
  console.log(`   Tx: ${signature}`);
  
  // Confirm
  console.log(`⏳ Confirming...`);
  const latestBlockhash = await connection.getLatestBlockhash();
  await connection.confirmTransaction({
    signature,
    blockhash: latestBlockhash.blockhash,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
  }, 'confirmed');
  
  console.log(`\n✅ SOLD!`);
  console.log(`   Received: ${outSol.toFixed(6)} SOL`);
  console.log(`   Solscan: https://solscan.io/tx/${signature}`);
  
  // Output JSON for scripting
  console.log('\n--- RESULT ---');
  console.log(JSON.stringify({ 
    success: true,
    signature, 
    tokenMint,
    tokensSold: tokenAmount,
    solReceived: outSol, 
    priceImpact: quote.priceImpactPct 
  }));
}

main().catch(e => {
  console.error(`\n❌ FAILED: ${e.message}`);
  process.exit(1);
});
