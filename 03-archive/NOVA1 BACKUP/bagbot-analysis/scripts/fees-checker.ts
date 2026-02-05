#!/usr/bin/env npx ts-node
/**
 * Bags.fm Fee Checker
 * Check and claim accumulated fees from BAGS ecosystem trading
 * 
 * Uses the official @bagsfm/bags-sdk
 */

import { BagsSDK } from '@bagsfm/bags-sdk';
import { Connection, Keypair, PublicKey, sendAndConfirmTransaction } from '@solana/web3.js';
import * as fs from 'fs';
import * as path from 'path';

// Constants
const RPC_URL = 'https://api.mainnet-beta.solana.com';
const LAMPORTS_PER_SOL = 1_000_000_000;

// Load API key
function getApiKey(): string {
  const envPath = path.join(process.env.HOME || '', '.credentials', 'bags.env');
  try {
    const content = fs.readFileSync(envPath, 'utf-8');
    const match = content.match(/BAGS_API_KEY=(.+)/);
    if (match) return match[1].trim();
  } catch (e) {}
  throw new Error('BAGS_API_KEY not found in ~/.credentials/bags.env');
}

// Load wallet keypair
function loadWallet(): Keypair {
  const walletPath = path.join(process.env.HOME || '', 'clawd-bagbot', 'wallet', 'bagbot-keypair.json');
  try {
    const keyData = JSON.parse(fs.readFileSync(walletPath, 'utf-8'));
    return Keypair.fromSecretKey(Uint8Array.from(keyData));
  } catch (e) {
    throw new Error(`Failed to load wallet from ${walletPath}`);
  }
}

function formatSol(lamports: number): string {
  return (lamports / LAMPORTS_PER_SOL).toFixed(6);
}

async function checkClaimableFees(sdk: BagsSDK, wallet: PublicKey): Promise<void> {
  console.log('\n🔍 Checking claimable fees...\n');
  console.log(`   Wallet: ${wallet.toBase58()}`);
  
  try {
    const positions = await sdk.fee.getAllClaimablePositions(wallet);
    
    if (positions.length === 0) {
      console.log('\n   ℹ️  No claimable fees found.\n');
      console.log('   Note: Fees accumulate when you launch tokens or have fee share agreements.\n');
      return;
    }
    
    console.log(`\n   Found ${positions.length} claimable position(s):\n`);
    
    let totalClaimable = 0;
    
    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i];
      console.log(`   ─────────────────────────────────────────────────`);
      console.log(`   Position ${i + 1}:`);
      
      // Handle different position types
      if ('totalClaimableLamportsUserShare' in pos) {
        totalClaimable += pos.totalClaimableLamportsUserShare;
        console.log(`   • Total Claimable: ${formatSol(pos.totalClaimableLamportsUserShare)} SOL`);
      }
      
      if ('baseMint' in pos) {
        console.log(`   • Token Mint: ${pos.baseMint}`);
      }
      
      if ('virtualPoolClaimableAmount' in pos) {
        console.log(`   • Virtual Pool Fees: ${formatSol(pos.virtualPoolClaimableAmount)} SOL`);
      }
      
      if ('dammPoolClaimableAmount' in pos && pos.dammPoolClaimableAmount) {
        console.log(`   • DAMM Pool Fees: ${formatSol(pos.dammPoolClaimableAmount)} SOL`);
      }
      
      if ('virtualPoolClaimableLamportsUserShare' in pos) {
        console.log(`   • Virtual Pool (User Share): ${formatSol(pos.virtualPoolClaimableLamportsUserShare)} SOL`);
      }
      
      if ('dammPoolClaimableLamportsUserShare' in pos) {
        console.log(`   • DAMM Pool (User Share): ${formatSol(pos.dammPoolClaimableLamportsUserShare)} SOL`);
      }
      
      if ('isMigrated' in pos) {
        console.log(`   • Migrated to DAMM: ${pos.isMigrated ? 'Yes' : 'No'}`);
      }
      
      if ('isCustomFeeVault' in pos) {
        console.log(`   • Custom Fee Vault: ${pos.isCustomFeeVault ? 'Yes' : 'No'}`);
        if (pos.isCustomFeeVault && 'customFeeVaultBps' in pos) {
          console.log(`   • Your Share: ${pos.customFeeVaultBps / 100}%`);
        }
        if (pos.isCustomFeeVault && 'userBps' in pos) {
          console.log(`   • Your Share: ${pos.userBps / 100}%`);
        }
      }
      
      console.log();
    }
    
    console.log(`   ─────────────────────────────────────────────────`);
    console.log(`   💰 TOTAL CLAIMABLE: ${formatSol(totalClaimable)} SOL`);
    console.log(`   ─────────────────────────────────────────────────\n`);
    
    if (totalClaimable > 0) {
      console.log('   To claim, run: npx ts-node scripts/fees-checker.ts claim\n');
    }
    
  } catch (err: any) {
    console.error(`\n   ❌ Error checking fees: ${err.message}\n`);
    if (err.message.includes('API key')) {
      console.log('   Make sure your bags.fm API key is set in ~/.credentials/bags.env\n');
    }
  }
}

async function claimAllFees(sdk: BagsSDK, wallet: Keypair): Promise<void> {
  console.log('\n💸 Claiming all fees...\n');
  
  try {
    const positions = await sdk.fee.getAllClaimablePositions(wallet.publicKey);
    
    if (positions.length === 0) {
      console.log('   ℹ️  No fees to claim.\n');
      return;
    }
    
    const connection = sdk.state.getConnection();
    let totalClaimed = 0;
    let successCount = 0;
    
    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i];
      const amount = 'totalClaimableLamportsUserShare' in pos ? pos.totalClaimableLamportsUserShare : 0;
      
      if (amount <= 0) {
        console.log(`   Position ${i + 1}: No fees to claim, skipping.`);
        continue;
      }
      
      console.log(`   Claiming position ${i + 1}/${positions.length} (${formatSol(amount)} SOL)...`);
      
      try {
        const txs = await sdk.fee.getClaimTransaction(wallet.publicKey, pos);
        
        for (const tx of txs) {
          const sig = await sendAndConfirmTransaction(
            connection,
            tx,
            [wallet],
            { commitment: 'confirmed' }
          );
          console.log(`   ✅ Claimed! Tx: ${sig.slice(0, 20)}...`);
        }
        
        totalClaimed += amount;
        successCount++;
        
      } catch (txErr: any) {
        console.log(`   ❌ Failed to claim position ${i + 1}: ${txErr.message}`);
      }
    }
    
    console.log(`\n   ─────────────────────────────────────────────────`);
    console.log(`   📊 Claimed ${successCount}/${positions.length} positions`);
    console.log(`   💰 Total Claimed: ${formatSol(totalClaimed)} SOL`);
    console.log(`   ─────────────────────────────────────────────────\n`);
    
  } catch (err: any) {
    console.error(`\n   ❌ Error claiming fees: ${err.message}\n`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'check';
  
  console.log(`
╔══════════════════════════════════════════════════════════╗
║          bags.fm Fee Checker — BagBot                    ║
╠══════════════════════════════════════════════════════════╣
║  Check and claim accumulated trading fees                ║
╚══════════════════════════════════════════════════════════╝`);

  const apiKey = getApiKey();
  const connection = new Connection(RPC_URL, 'confirmed');
  const sdk = new BagsSDK(apiKey, connection, 'confirmed');
  const keypair = loadWallet();
  
  if (command === 'check') {
    await checkClaimableFees(sdk, keypair.publicKey);
  } else if (command === 'claim') {
    await claimAllFees(sdk, keypair);
  } else {
    console.log(`
   Commands:
   
   check    Check for claimable fees (default)
   claim    Claim all available fees
   
   Usage:
   npx ts-node scripts/fees-checker.ts [command]
`);
  }
}

main().catch(console.error);
