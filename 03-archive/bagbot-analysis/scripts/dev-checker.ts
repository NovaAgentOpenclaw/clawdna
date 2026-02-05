#!/usr/bin/env npx ts-node
/**
 * bags.fm Dev Checker
 * Verify token creators/devs via SDK before trading
 * 
 * Usage: npx ts-node scripts/dev-checker.ts <mint_address>
 */

import { BagsSDK } from '@bagsfm/bags-sdk';
import { Connection, PublicKey } from '@solana/web3.js';
import * as fs from 'fs';
import * as path from 'path';

const RPC_URL = 'https://api.mainnet-beta.solana.com';

function getApiKey(): string {
  const envPath = path.join(process.env.HOME || '', '.credentials', 'bags.env');
  try {
    const content = fs.readFileSync(envPath, 'utf-8');
    const match = content.match(/BAGS_API_KEY=(.+)/);
    if (match) return match[1].trim();
  } catch (e) {}
  throw new Error('BAGS_API_KEY not found');
}

async function checkDev(mintAddress: string): Promise<void> {
  console.log(`\n🔍 Dev Verification: ${mintAddress.slice(0,8)}...${mintAddress.slice(-4)}\n`);
  
  const apiKey = getApiKey();
  const connection = new Connection(RPC_URL, 'confirmed');
  const sdk = new BagsSDK(apiKey, connection, 'confirmed');
  
  try {
    const mint = new PublicKey(mintAddress);
    
    // Get token creators
    const creators = await sdk.state.getTokenCreators(mint);
    
    if (creators.length === 0) {
      console.log('   ❌ NO CREATORS FOUND\n');
      console.log('   Verdict: AVOID - Cannot verify dev\n');
      return;
    }
    
    console.log(`   Found ${creators.length} creator(s):\n`);
    
    let hasVerifiedDev = false;
    
    for (let i = 0; i < creators.length; i++) {
      const creator = creators[i];
      console.log(`   ┌─ Creator ${i + 1} ─────────────────────────`);
      
      // Check for Twitter/X
      if ('twitterUsername' in creator && creator.twitterUsername) {
        console.log(`   │ 🐦 Twitter: @${creator.twitterUsername}`);
        hasVerifiedDev = true;
      }
      
      // Check provider (twitter, github, etc)
      if ('provider' in creator) {
        const provider = String(creator.provider).toLowerCase();
        if (provider === 'github' || provider === 'twitter') {
          hasVerifiedDev = true;
        }
      }
      
      // Check for wallet
      if ('walletAddress' in creator && creator.walletAddress) {
        const wallet = String(creator.walletAddress);
        console.log(`   │ 👛 Wallet: ${wallet.slice(0,8)}...`);
      }
      
      // Check fee share
      if ('feeBps' in creator) {
        console.log(`   │ 💰 Fee Share: ${(creator.feeBps as number) / 100}%`);
      }
      
      // Dump other useful fields
      const keys = Object.keys(creator);
      for (const key of keys) {
        if (!['twitterUsername', 'walletAddress', 'feeBps'].includes(key)) {
          const val = (creator as any)[key];
          if (val && typeof val !== 'object') {
            console.log(`   │ 📋 ${key}: ${val}`);
          }
        }
      }
      
      console.log(`   └──────────────────────────────────────\n`);
    }
    
    // Get lifetime fees
    try {
      const lifetimeFees = await sdk.state.getTokenLifetimeFees(mint);
      const feesInSol = lifetimeFees / 1_000_000_000;
      console.log(`   💵 Lifetime Fees: ${feesInSol.toFixed(4)} SOL\n`);
      
      if (feesInSol > 1) {
        console.log(`   ✅ Active token (>${feesInSol.toFixed(1)} SOL in fees)\n`);
      }
    } catch (e) {
      // Fees endpoint may not work for all tokens
    }
    
    // Verdict
    console.log('   ═══════════════════════════════════════');
    if (hasVerifiedDev) {
      console.log('   ✅ VERDICT: DEV VERIFIED');
      console.log('   Token has creator with linked Twitter.');
    } else {
      console.log('   ⚠️  VERDICT: UNVERIFIED');
      console.log('   No creator with Twitter found. Trade with caution.');
    }
    console.log('   ═══════════════════════════════════════\n');
    
  } catch (err: any) {
    console.error(`   ❌ Error: ${err.message}\n`);
  }
}

async function main() {
  const mintAddress = process.argv[2];
  
  if (!mintAddress) {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║          bags.fm Dev Checker — BagBot                    ║
╠══════════════════════════════════════════════════════════╣
║  Verify token devs before trading                        ║
╚══════════════════════════════════════════════════════════╝

   Usage: npx ts-node scripts/dev-checker.ts <mint_address>
   
   Example:
   npx ts-node scripts/dev-checker.ts k9BKDF8x9Y6nBbGVL938yPT33h4zo8p8GTsi4wJBAGS
`);
    return;
  }
  
  await checkDev(mintAddress);
}

main().catch(console.error);
