#!/usr/bin/env npx ts-node
/**
 * Trade Checklist V2 - Enhanced Pre-Trade Verification
 * Now includes automatic dev verification via bags.fm SDK!
 * 
 * Run this BEFORE every trade to avoid repeating mistakes.
 * 
 * Updated: 2026-01-29 - Integrated dev verification
 */

import axios from 'axios';

const DEXSCREENER_API = 'https://api.dexscreener.com';
const BAGS_PUBLIC_API = 'https://public-api-v2.bags.fm/api/v1';

interface TokenData {
  symbol: string;
  name: string;
  priceUsd: string;
  priceChange: { h1: number; h6: number; h24: number; m5: number };
  volume: { h24: number; h6: number; h1: number; m5: number };
  liquidity?: { usd: number };
  mcap: number;
  pairCreatedAt: number;
  dexId: string;
  txns: {
    h1: { buys: number; sells: number };
    h6: { buys: number; sells: number };
    h24: { buys: number; sells: number };
    m5: { buys: number; sells: number };
  };
}

interface Creator {
  twitterUsername: string | null;
  twitterPfpUrl: string | null;
  twitterDisplayName: string | null;
  githubUsername: string | null;
  royaltyBps: number;
  walletAddress: string;
}

interface DevVerification {
  verified: boolean;
  creators: Creator[];
  lifetimeFees: number;
  message: string;
}

// Get token data from DexScreener
async function getTokenData(mint: string): Promise<TokenData | null> {
  try {
    const { data } = await axios.get(`${DEXSCREENER_API}/tokens/v1/solana/${mint}`);
    if (data && data.length > 0) {
      const pair = data[0];
      return {
        symbol: pair.baseToken?.symbol || 'UNKNOWN',
        name: pair.baseToken?.name || 'Unknown',
        priceUsd: pair.priceUsd || '0',
        priceChange: {
          h1: pair.priceChange?.h1 || 0,
          h6: pair.priceChange?.h6 || 0,
          h24: pair.priceChange?.h24 || 0,
          m5: pair.priceChange?.m5 || 0,
        },
        volume: {
          h24: pair.volume?.h24 || 0,
          h6: pair.volume?.h6 || 0,
          h1: pair.volume?.h1 || 0,
          m5: pair.volume?.m5 || 0,
        },
        liquidity: pair.liquidity,
        mcap: pair.marketCap || pair.fdv || 0,
        pairCreatedAt: pair.pairCreatedAt || 0,
        dexId: pair.dexId || '',
        txns: {
          h1: { buys: pair.txns?.h1?.buys || 0, sells: pair.txns?.h1?.sells || 0 },
          h6: { buys: pair.txns?.h6?.buys || 0, sells: pair.txns?.h6?.sells || 0 },
          h24: { buys: pair.txns?.h24?.buys || 0, sells: pair.txns?.h24?.sells || 0 },
          m5: { buys: pair.txns?.m5?.buys || 0, sells: pair.txns?.m5?.sells || 0 },
        },
      };
    }
    return null;
  } catch (e: any) {
    console.error(`Error fetching token data: ${e.message}`);
    return null;
  }
}

// Verify dev via bags.fm SDK/API
async function verifyDev(mint: string): Promise<DevVerification> {
  try {
    // Try SDK method via bags-api
    const { BagsSDK } = await import('@bagsfm/bags-sdk');
    const { Connection } = await import('@solana/web3.js');
    const fs = await import('fs');
    const path = await import('path');
    
    // Load API key
    const envPath = path.join(process.env.HOME || '', '.credentials', 'bags.env');
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(/BAGS_API_KEY=(.+)/);
    const apiKey = match ? match[1].trim() : '';
    
    const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
    const sdk = new BagsSDK(apiKey, connection, 'confirmed');
    const { PublicKey } = await import('@solana/web3.js');
    const mintPubkey = new PublicKey(mint);
    
    const [creatorsResult, feesResult] = await Promise.allSettled([
      sdk.state.getTokenCreators(mintPubkey),
      sdk.state.getTokenLifetimeFees(mintPubkey)
    ]);
    
    // Convert SDK response to our interface
    const rawCreators: any[] = creatorsResult.status === 'fulfilled' 
      ? creatorsResult.value || []
      : [];
    
    const creators: Creator[] = rawCreators.map((c: any) => ({
      twitterUsername: c.twitterUsername || null,
      twitterPfpUrl: c.twitterPfpUrl || null,
      twitterDisplayName: c.twitterDisplayName || null,
      githubUsername: c.githubUsername || null,
      royaltyBps: c.feeBps || c.royaltyBps || 0,
      walletAddress: c.walletAddress || ''
    }));
    
    const lifetimeFeesRaw = feesResult.status === 'fulfilled'
      ? feesResult.value || 0
      : 0;
    const lifetimeFees = typeof lifetimeFeesRaw === 'number' 
      ? lifetimeFeesRaw / 1e9 
      : 0;
    
    // Check for verified socials
    const verifiedCreators = creators.filter(
      c => c.twitterUsername || c.githubUsername
    );
    
    const verified = verifiedCreators.length > 0;
    
    // Build message
    let message = '';
    if (verified) {
      const handles = verifiedCreators
        .map(c => c.twitterUsername ? `@${c.twitterUsername}` : `GH:${c.githubUsername}`)
        .join(', ');
      message = `✅ DEV VERIFIED: ${handles} | Lifetime fees: ${lifetimeFees.toFixed(2)} SOL`;
    } else {
      message = `❌ LESSON #15: NO VERIFIED DEV — ${creators.length} creator(s) but no socials!`;
    }
    
    return { verified, creators, lifetimeFees, message };
  } catch (e: any) {
    // Fallback: try direct API
    try {
      const res = await axios.get(`${BAGS_PUBLIC_API}/token/${mint}/creators`);
      const creators: Creator[] = res.data?.results || [];
      const verifiedCreators = creators.filter(c => c.twitterUsername || c.githubUsername);
      const verified = verifiedCreators.length > 0;
      
      let message = '';
      if (verified) {
        const handles = verifiedCreators
          .map(c => c.twitterUsername ? `@${c.twitterUsername}` : `GH:${c.githubUsername}`)
          .join(', ');
        message = `✅ DEV VERIFIED: ${handles}`;
      } else {
        message = `❌ LESSON #15: NO VERIFIED DEV`;
      }
      
      return { verified, creators, lifetimeFees: 0, message };
    } catch {
      return { 
        verified: false, 
        creators: [], 
        lifetimeFees: 0, 
        message: '⚠️  Could not verify dev (API error)' 
      };
    }
  }
}

// Calculate pool age in hours
function getPoolAgeHours(createdAt: number): number {
  if (!createdAt) return 0;
  return (Date.now() - createdAt) / (1000 * 60 * 60);
}

// Format number for display
function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(2)}K`;
  return n.toFixed(2);
}

// Check if actively dumping (m5 sells >> buys)
function isActiveDump(txns: TokenData['txns'], priceChange: TokenData['priceChange']): { dumping: boolean; message: string } {
  const m5Buys = txns.m5.buys;
  const m5Sells = txns.m5.sells;
  const m5Ratio = m5Sells > 0 ? m5Buys / m5Sells : m5Buys;
  const m5Change = priceChange.m5;
  
  // Active dump: m5 sells > buys AND price dropping
  if (m5Ratio < 0.5 && m5Change < -5) {
    return { 
      dumping: true, 
      message: `❌ ACTIVE DUMP: m5 ratio ${m5Ratio.toFixed(2)}:1, price ${m5Change.toFixed(1)}%` 
    };
  }
  if (m5Ratio < 0.8 && m5Change < -10) {
    return { 
      dumping: true, 
      message: `⚠️  Sell pressure: m5 ratio ${m5Ratio.toFixed(2)}:1, price ${m5Change.toFixed(1)}%` 
    };
  }
  
  return { 
    dumping: false, 
    message: `✅ m5 ratio: ${m5Ratio.toFixed(2)}:1, price ${m5Change >= 0 ? '+' : ''}${m5Change.toFixed(1)}%` 
  };
}

// Run all checks
async function runChecklist(mint: string, entryAmount: number = 0.25): Promise<void> {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║         🔍 PRE-TRADE CHECKLIST V2 — BagBot                    ║
╠═══════════════════════════════════════════════════════════════╣
║  Now with automatic dev verification!                         ║
╚═══════════════════════════════════════════════════════════════╝`);

  const checks: { name: string; status: boolean; message: string; critical: boolean }[] = [];
  
  // Fetch token data
  console.log(`\n   📊 Fetching data for: ${mint.slice(0, 8)}...${mint.slice(-8)}\n`);
  
  const [token, devInfo] = await Promise.all([
    getTokenData(mint),
    verifyDev(mint)
  ]);
  
  if (!token) {
    console.log('   ❌ ERROR: Could not fetch token data. Aborting.\n');
    return;
  }
  
  console.log(`   Token: ${token.symbol} (${token.name})`);
  console.log(`   Price: $${parseFloat(token.priceUsd).toFixed(8)}`);
  console.log(`   MCap:  $${formatNum(token.mcap)}`);
  console.log(`   24h Volume: $${formatNum(token.volume.h24)}`);
  console.log(`   Age: ${getPoolAgeHours(token.pairCreatedAt).toFixed(1)} hours\n`);
  
  // Check 1: BAGS ecosystem (dexId) - CRITICAL
  const isBags = token.dexId === 'bags' || mint.toLowerCase().endsWith('bags');
  checks.push({
    name: 'BAGS Ecosystem',
    status: isBags,
    message: isBags 
      ? `✅ BAGS token (dexId: ${token.dexId})`
      : `❌ NOT a BAGS token — BagBot ONLY trades BAGS ecosystem!`,
    critical: true
  });
  
  // Check 2: Dev verification - CRITICAL (Lesson #15)
  checks.push({
    name: 'Dev Verification',
    status: devInfo.verified,
    message: devInfo.message,
    critical: true
  });
  
  // Check 3: Not chasing h1 pump (Lesson #14) - CRITICAL
  const h1Pump = token.priceChange.h1 > 100;
  checks.push({
    name: 'H1 Pump Check',
    status: !h1Pump,
    message: h1Pump
      ? `❌ LESSON #14: +${token.priceChange.h1.toFixed(0)}% h1 — DON'T CHASE PUMPS!`
      : token.priceChange.h1 > 50
        ? `⚠️  +${token.priceChange.h1.toFixed(0)}% h1 — significant move, timing risky`
        : `✅ h1 change: ${token.priceChange.h1 >= 0 ? '+' : ''}${token.priceChange.h1.toFixed(0)}% (reasonable entry)`,
    critical: h1Pump
  });
  
  // Check 4: Buy/Sell ratio (Lesson #15) - Check for traps
  const h24Ratio = token.txns.h24.sells > 0 
    ? token.txns.h24.buys / token.txns.h24.sells 
    : token.txns.h24.buys;
  const h1Ratio = token.txns.h1.sells > 0
    ? token.txns.h1.buys / token.txns.h1.sells
    : token.txns.h1.buys;
    
  const ratioTrap = h24Ratio > 10 && !devInfo.verified;
  const ratioBearish = h1Ratio < 0.5;
  
  checks.push({
    name: 'Buy/Sell Ratio',
    status: !ratioTrap && !ratioBearish,
    message: ratioTrap
      ? `❌ LESSON #15: ${h24Ratio.toFixed(0)}:1 ratio WITHOUT verified dev = PUMP TRAP!`
      : ratioBearish
        ? `⚠️  h1 ratio ${h1Ratio.toFixed(2)}:1 — more sellers than buyers`
        : `✅ h24: ${h24Ratio.toFixed(2)}:1 | h1: ${h1Ratio.toFixed(2)}:1`,
    critical: ratioTrap
  });
  
  // Check 5: Active dump detection
  const dumpCheck = isActiveDump(token.txns, token.priceChange);
  checks.push({
    name: 'M5 Momentum',
    status: !dumpCheck.dumping,
    message: dumpCheck.message,
    critical: dumpCheck.dumping && dumpCheck.message.includes('❌')
  });
  
  // Check 6: Volume check (activity)
  const volumeOk = token.volume.h24 >= 5000;
  checks.push({
    name: 'Volume',
    status: volumeOk,
    message: volumeOk
      ? `✅ 24h Volume: $${formatNum(token.volume.h24)}`
      : `⚠️  24h Volume: $${formatNum(token.volume.h24)} (low activity)`,
    critical: false
  });
  
  // Check 7: Vol/MCap ratio (activity health)
  const volMcapRatio = token.mcap > 0 ? token.volume.h24 / token.mcap : 0;
  checks.push({
    name: 'Vol/MCap',
    status: volMcapRatio > 0.5,
    message: volMcapRatio > 2
      ? `✅ Vol/MCap: ${volMcapRatio.toFixed(1)}x (highly active)`
      : volMcapRatio > 0.5
        ? `✅ Vol/MCap: ${volMcapRatio.toFixed(1)}x (healthy)`
        : `⚠️  Vol/MCap: ${volMcapRatio.toFixed(1)}x (low activity)`,
    critical: false
  });
  
  // Check 8: Position size
  const sizeOk = entryAmount >= 0.2 && entryAmount <= 1.0;
  checks.push({
    name: 'Position Size',
    status: sizeOk,
    message: entryAmount < 0.2
      ? `❌ LESSON #23: ${entryAmount} SOL too small. Use 0.2-0.3 SOL standard.`
      : entryAmount > 1.0
        ? `❌ Position ${entryAmount} SOL exceeds max (1 SOL)`
        : `✅ Position size: ${entryAmount} SOL`,
    critical: !sizeOk
  });
  
  // Check 9: Already pumped h24?
  const h24Pump = token.priceChange.h24 > 300;
  checks.push({
    name: 'H24 Pump Check',
    status: !h24Pump,
    message: h24Pump
      ? `⚠️  +${token.priceChange.h24.toFixed(0)}% h24 — already moved significantly`
      : `✅ h24 change: ${token.priceChange.h24 >= 0 ? '+' : ''}${token.priceChange.h24.toFixed(0)}%`,
    critical: false
  });
  
  // Summary
  console.log('\n   ═══════════════════════════════════════════════════════════');
  console.log('   CHECKLIST RESULTS:\n');
  
  let criticalFails = 0;
  let warnings = 0;
  
  for (const check of checks) {
    const icon = check.status ? '✓' : (check.critical ? '✗' : '!');
    console.log(`   [${icon}] ${check.name}`);
    console.log(`       ${check.message}\n`);
    if (!check.status && check.critical) criticalFails++;
    if (!check.status && !check.critical) warnings++;
  }
  
  console.log('   ═══════════════════════════════════════════════════════════');
  
  if (criticalFails > 0) {
    console.log(`\n   🛑 TRADE BLOCKED: ${criticalFails} critical check(s) failed`);
    console.log('   DO NOT PROCEED — lessons learned exist for a reason.\n');
  } else if (warnings > 0) {
    console.log(`\n   ⚠️  PROCEED WITH CAUTION: ${warnings} warning(s)`);
    console.log('   Trade allowed but consider the risks.\n');
  } else {
    console.log(`\n   ✅ ALL CHECKS PASSED — Trade authorized\n`);
  }
  
  // Exit strategy reminder
  console.log('   📋 EXIT STRATEGY (set before entry):');
  console.log('   • Stop loss: -18% to -20%');
  console.log('   • Partial profit: +50% (sell 33%)');
  console.log('   • Full profit: +100% (sell another 33%)');
  console.log('   • Moon bag: remaining 33% rides free\n');
}

async function main() {
  const args = process.argv.slice(2);
  const mint = args[0];
  const amount = args[1] ? parseFloat(args[1]) : 0.25;
  
  if (!mint) {
    console.log(`
   Trade Checklist V2 — Enhanced with Dev Verification
   
   Usage: npx ts-node scripts/trade-checklist-v2.ts <mint> [amount]
   
   Example:
   npx ts-node scripts/trade-checklist-v2.ts 4gfNpwo8LQtcgGrNmgWhuwfFhttgZ8Qb6QXN4Yz8BAGS 0.25
   
   Checks enforced:
   ✓ BAGS ecosystem only
   ✓ Dev verification (automatic!) — Lesson #15
   ✓ Pump detection (h1 + h24) — Lesson #14
   ✓ Buy/sell ratio trap detection — Lesson #15
   ✓ Active dump detection (m5)
   ✓ Volume and activity checks
   ✓ Position sizing — Lesson #23
`);
    return;
  }
  
  await runChecklist(mint, amount);
}

main().catch(console.error);
