#!/usr/bin/env ts-node
import { Connection, Keypair, VersionedTransaction } from '@solana/web3.js';
import * as fs from 'fs';
import bs58 from 'bs58';

const RPC = 'https://api.mainnet-beta.solana.com';

async function main() {
  const txBase58 = process.argv[2];
  if (!txBase58) { console.error('Need tx base58'); process.exit(1); }
  
  const keypairData = JSON.parse(fs.readFileSync('./wallet/bagbot-keypair.json', 'utf-8'));
  const keypair = Keypair.fromSecretKey(Uint8Array.from(keypairData));
  
  const txBytes = bs58.decode(txBase58);
  const tx = VersionedTransaction.deserialize(txBytes);
  
  tx.sign([keypair]);
  
  const connection = new Connection(RPC, 'confirmed');
  const sig = await connection.sendRawTransaction(tx.serialize(), {
    skipPreflight: false,
    maxRetries: 3,
  });
  
  console.log(`Signature: ${sig}`);
  
  // Wait for confirmation
  const confirm = await connection.confirmTransaction(sig, 'confirmed');
  if (confirm.value.err) {
    console.error('Transaction failed:', confirm.value.err);
    process.exit(1);
  }
  console.log('✅ Transaction confirmed');
}

main().catch(e => { console.error(e.message); process.exit(1); });
