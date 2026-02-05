const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { Connection, Keypair, VersionedTransaction } = require('@solana/web3.js');

const CREACHER = '2a3ezJwXu5HhG2GYrguDGeFYWyF65cGUwFHYmK6sBAGS';
const SOL = 'So11111111111111111111111111111111111111112';
const RPC = 'https://api.mainnet-beta.solana.com';
const RAW_AMOUNT = '3837439644209785';

function getApiKey() {
  const content = fs.readFileSync(path.join(process.env.HOME, '.credentials', 'bags.env'), 'utf-8');
  return content.match(/BAGS_API_KEY=(.+)/)[1].trim();
}

function getKeypair() {
  const data = JSON.parse(fs.readFileSync(path.join(process.env.HOME, 'clawd-bagbot', 'wallet', 'bagbot-keypair.json')));
  return Keypair.fromSecretKey(new Uint8Array(data));
}

async function main() {
  const apiKey = getApiKey();
  const keypair = getKeypair();
  const wallet = keypair.publicKey.toBase58();
  const connection = new Connection(RPC, 'confirmed');
  
  console.log('🔄 Selling CREACHER → SOL');
  console.log('   Wallet:', wallet);
  console.log('   Amount: 3,837,439 tokens');
  
  // Get quote from bags.fm
  console.log('\n📊 Getting quote...');
  const quoteRes = await axios.post('https://public-api-v2.bags.fm/api/v1/trade/quote', {
    inputMint: CREACHER,
    outputMint: SOL,
    inputAmount: RAW_AMOUNT,
    slippageBps: 100
  }, {
    headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' }
  });
  
  const quote = quoteRes.data;
  const outSol = Number(BigInt(quote.outAmount || quote.outputAmount || 0)) / 1e9;
  console.log('   Output:', outSol.toFixed(6), 'SOL');
  console.log('   Price impact:', quote.priceImpactPct || quote.priceImpact || 'N/A');
  
  // Get swap tx
  console.log('\n🔧 Building transaction...');
  const swapRes = await axios.post('https://public-api-v2.bags.fm/api/v1/trade/swap', {
    inputMint: CREACHER,
    outputMint: SOL,
    inputAmount: RAW_AMOUNT,
    slippageBps: 100,
    userPublicKey: wallet
  }, {
    headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' }
  });
  
  const { transaction: txBase64 } = swapRes.data;
  
  // Sign and send
  const tx = VersionedTransaction.deserialize(Buffer.from(txBase64, 'base64'));
  tx.sign([keypair]);
  
  console.log('📤 Sending...');
  const sig = await connection.sendRawTransaction(tx.serialize(), { skipPreflight: true });
  console.log('   Tx:', sig);
  
  console.log('⏳ Confirming...');
  const bh = await connection.getLatestBlockhash();
  await connection.confirmTransaction({ signature: sig, blockhash: bh.blockhash, lastValidBlockHeight: bh.lastValidBlockHeight });
  
  console.log('\n✅ SOLD CREACHER');
  console.log('   Received:', outSol.toFixed(6), 'SOL');
  console.log('   Solscan: https://solscan.io/tx/' + sig);
  
  console.log('\n--- RESULT ---');
  console.log(JSON.stringify({ success: true, signature: sig, solReceived: outSol }));
}

main().catch(e => {
  console.error('\n❌ FAILED:', e.response?.data || e.message);
  process.exit(1);
});
