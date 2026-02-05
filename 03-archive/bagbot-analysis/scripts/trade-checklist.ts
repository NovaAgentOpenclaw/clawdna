#!/usr/bin/env npx ts-node
/**
 * Trade Checklist - Pre-Trade Verification
 * Enforces all lessons learned before executing any trade
 * 
 * Run this BEFORE every trade to avoid repeating mistakes!
 */

import axios from 'axios';

const DEXSCREENER_API = 'https://api.dexscreener.com';

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
    h24: { buys: number; sells: number };
  };
}

// Time validation
function isTradinghours(): { ok: boolean; message: string } {
  const now = new Date();
  const pstHour = now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles', hour: 'numeric', hour12: false });
  const hour = parseInt(pstHour);
  
  if (hour < 9 || hour >= 22) {
    return { 
      ok: false, 
      message: `❌ LESSON #26: Trading hours are 9 AM - 10 PM PST. Current: ${hour}:00 PST` 
    };
  }
  return { ok: true, message: `✅ Trading hours OK (${hour}:00 PST)` };
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
          h24: { buys: pair.txns?.h24?.buys || 0, sells: pair.txns?.h24?.sells || 0 },
        },
      };
    }
    return null;
  } catch (e: any) {
    console.error(`Error fetching token data: ${e.message}`);
    return null;
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

// Run all checks
async function runChecklist(mint: string, entryAmount: number = 0.25): Promise<void> {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║           🔍 PRE-TRADE CHECKLIST — BagBot                     ║
╠═══════════════════════════════════════════════════════════════╣
║  Enforcing lessons learned before trade execution             ║
╚═══════════════════════════════════════════════════════════════╝`);

  const checks: { name: string; status: boolean; message: string }[] = [];
  
  // Check 1: Trading hours
  const timeCheck = isTradinghours();
  checks.push({ name: 'Trading Hours', status: timeCheck.ok, message: timeCheck.message });
  
  // Fetch token data
  console.log(`\n   Fetching data for: ${mint.slice(0, 8)}...${mint.slice(-8)}\n`);
  const token = await getTokenData(mint);
  
  if (!token) {
    console.log('   ❌ ERROR: Could not fetch token data. Aborting.\n');
    return;
  }
  
  console.log(`   Token: ${token.symbol} (${token.name})`);
  console.log(`   Price: $${parseFloat(token.priceUsd).toFixed(8)}`);
  console.log(`   MCap:  $${formatNum(token.mcap)}`);
  console.log(`   24h Volume: $${formatNum(token.volume.h24)}\n`);
  
  // Check 2: BAGS ecosystem (dexId)
  const isBags = token.dexId === 'bags' || mint.toLowerCase().endsWith('bags');
  checks.push({
    name: 'BAGS Ecosystem',
    status: isBags,
    message: isBags 
      ? `✅ BAGS token (dexId: ${token.dexId})`
      : `❌ NOT a BAGS token (dexId: ${token.dexId}) — BagBot only trades BAGS ecosystem!`
  });
  
  // Check 3: Pool age > 24h (avoid rugs) - relaxed for BAGS since bonding curve is always liquid
  const ageHours = getPoolAgeHours(token.pairCreatedAt);
  const ageOk = isBags || ageHours >= 24; // BAGS tokens are always liquid, age less critical
  checks.push({
    name: 'Pool Age',
    status: ageOk || ageHours >= 6, // Warning at 6h, fail at < 6h for non-BAGS
    message: ageHours >= 24 
      ? `✅ Pool age: ${ageHours.toFixed(1)}h (>24h)`
      : ageHours >= 6
        ? `⚠️  Pool age: ${ageHours.toFixed(1)}h (6-24h, moderate risk)`
        : `❌ Pool age: ${ageHours.toFixed(1)}h (<6h HIGH RISK)`
  });
  
  // Check 4: Volume > $10K (activity check)
  const volumeOk = token.volume.h24 >= 10000;
  checks.push({
    name: 'Volume',
    status: volumeOk,
    message: volumeOk
      ? `✅ 24h Volume: $${formatNum(token.volume.h24)} (>$10K)`
      : `⚠️  24h Volume: $${formatNum(token.volume.h24)} (<$10K - low activity)`
  });
  
  // Check 5: Buy/Sell ratio (sentiment) - Lesson #15
  const buyRatio = token.txns.h24.sells > 0 
    ? token.txns.h24.buys / token.txns.h24.sells 
    : token.txns.h24.buys;
  const ratioOk = buyRatio >= 1.0 && buyRatio <= 10;
  checks.push({
    name: 'Buy/Sell Ratio',
    status: ratioOk,
    message: buyRatio > 10
      ? `❌ LESSON #15: Buy ratio ${buyRatio.toFixed(1)}:1 TOO HIGH — coordinated pump trap!`
      : buyRatio >= 1.0
        ? `✅ Buy ratio: ${buyRatio.toFixed(2)}:1 (healthy bullish pressure)`
        : `⚠️  Buy ratio: ${buyRatio.toFixed(2)}:1 (more sellers than buyers)`
  });
  
  // Check 6: Price impact (estimated from volume/mcap)
  const volMcapRatio = token.mcap > 0 ? token.volume.h24 / token.mcap : 0;
  const impactOk = volMcapRatio > 0.1; // decent liquidity relative to activity
  checks.push({
    name: 'Liquidity Estimate',
    status: impactOk,
    message: impactOk
      ? `✅ Vol/MCap: ${volMcapRatio.toFixed(2)}x (adequate liquidity)`
      : `⚠️  Vol/MCap: ${volMcapRatio.toFixed(2)}x (may have high slippage)`
  });
  
  // Check 7: Not chasing pump (Lesson #14)
  const isChasing = token.priceChange.h24 > 500;
  checks.push({
    name: 'Pump Check',
    status: !isChasing,
    message: isChasing
      ? `❌ LESSON #14: +${token.priceChange.h24.toFixed(0)}% 24h — DON'T CHASE PUMPS!`
      : token.priceChange.h24 > 200
        ? `⚠️  +${token.priceChange.h24.toFixed(0)}% 24h — already moved significantly`
        : `✅ Price change: ${token.priceChange.h24.toFixed(0)}% 24h (reasonable entry)`
  });
  
  // Check 8: Position size (Lesson #23)
  const sizeOk = entryAmount >= 0.2 && entryAmount <= 1.0;
  checks.push({
    name: 'Position Size',
    status: sizeOk,
    message: entryAmount < 0.2
      ? `❌ LESSON #23: ${entryAmount} SOL too small. Use 0.2-0.3 SOL standard.`
      : entryAmount > 1.0
        ? `❌ Position ${entryAmount} SOL exceeds max (1 SOL)`
        : `✅ Position size: ${entryAmount} SOL (within limits)`
  });
  
  // Summary
  console.log('\n   ═══════════════════════════════════════════════════════════');
  console.log('   CHECKLIST RESULTS:\n');
  
  let failCount = 0;
  let warnCount = 0;
  
  for (const check of checks) {
    const icon = check.status ? '✓' : (check.message.includes('⚠️') ? '!' : '✗');
    console.log(`   [${icon}] ${check.name}`);
    console.log(`       ${check.message}\n`);
    if (!check.status && !check.message.includes('⚠️')) failCount++;
    if (check.message.includes('⚠️')) warnCount++;
  }
  
  console.log('   ═══════════════════════════════════════════════════════════');
  
  if (failCount > 0) {
    console.log(`\n   🛑 TRADE BLOCKED: ${failCount} critical check(s) failed`);
    console.log('   Review lessons learned before proceeding.\n');
  } else if (warnCount > 0) {
    console.log(`\n   ⚠️  PROCEED WITH CAUTION: ${warnCount} warning(s)`);
    console.log('   Consider additional due diligence.\n');
  } else {
    console.log(`\n   ✅ ALL CHECKS PASSED — Trade authorized\n`);
  }
  
  // Final reminders
  console.log('   📋 MANUAL CHECKS REQUIRED:');
  console.log('   • Dev verification — check Twitter for verified developer');
  console.log('   • Stop loss set — use -18 to -20% for BAGS tokens');
  console.log('   • Exit plan — define take-profit levels before entry\n');
}

async function main() {
  const args = process.argv.slice(2);
  const mint = args[0];
  const amount = args[1] ? parseFloat(args[1]) : 0.25;
  
  if (!mint) {
    console.log(`
   Usage: npx ts-node scripts/trade-checklist.ts <mint> [amount]
   
   Example:
   npx ts-node scripts/trade-checklist.ts 4gfNpwo8LQtcgGrNmgWhuwfFhttgZ8Qb6QXN4Yz8BAGS 0.25
   
   This tool enforces BagBot's trading rules before execution:
   - Trading hours (9 AM - 10 PM PST)
   - BAGS ecosystem only
   - Position sizing (0.2-1.0 SOL)
   - Pump detection
   - Buy/sell ratio analysis
   - And more lessons learned...
`);
    return;
  }
  
  await runChecklist(mint, amount);
}

main().catch(console.error);
