#!/usr/bin/env npx ts-node
/**
 * BAGS Liquidity Monitor
 * Identifies stranded positions with low/no liquidity
 * Lesson learned: Two stranded positions (COYOTE, SLACKINT) taught me this
 */

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

const WATCHLIST_PATH = path.join(__dirname, '..', 'data', 'watchlist.json');

// Thresholds (in USD)
const LIQUIDITY_CRITICAL = 100;    // Below this = stranded, can't exit
const LIQUIDITY_WARNING = 500;     // Below this = risky, partial exit maybe
const LIQUIDITY_HEALTHY = 1000;    // Above this = safe to trade

interface Position {
  symbol: string;
  name: string;
  address: string;
  entryPrice: number;
  tokens: number;
  costBasis: number;
}

interface LiquidityStatus {
  symbol: string;
  address: string;
  liquidity: number;
  liquiditySol: number;
  currentValue: number;
  priceUsd: number;
  status: 'STRANDED' | 'WARNING' | 'HEALTHY' | 'ERROR';
  canExit: boolean;
  pnlPercent: number;
}

async function fetchLiquidity(address: string): Promise<{
  liquidity: number;
  priceUsd: number;
  volume24h: number;
} | null> {
  try {
    const response = await axios.get(
      `https://api.dexscreener.com/tokens/v1/solana/${address}`,
      { timeout: 10000 }
    );
    
    if (response.data && response.data.length > 0) {
      const pair = response.data[0];
      return {
        liquidity: pair.liquidity?.usd || 0,
        priceUsd: parseFloat(pair.priceUsd || '0'),
        volume24h: pair.volume?.h24 || 0,
      };
    }
    return null;
  } catch {
    return null;
  }
}

function formatUsd(num: number): string {
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`;
  return `$${num.toFixed(0)}`;
}

function getStatus(liquidity: number): 'STRANDED' | 'WARNING' | 'HEALTHY' {
  if (liquidity < LIQUIDITY_CRITICAL) return 'STRANDED';
  if (liquidity < LIQUIDITY_WARNING) return 'WARNING';
  return 'HEALTHY';
}

function getStatusEmoji(status: string): string {
  switch (status) {
    case 'STRANDED': return '🔴';
    case 'WARNING': return '🟡';
    case 'HEALTHY': return '🟢';
    default: return '❓';
  }
}

async function checkLiquidity() {
  // Load watchlist
  let watchlist: { positions: Position[] };
  try {
    watchlist = JSON.parse(fs.readFileSync(WATCHLIST_PATH, 'utf-8'));
  } catch {
    console.error('❌ Could not load watchlist.json');
    process.exit(1);
  }

  console.log('');
  console.log('╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║                   💧 LIQUIDITY MONITOR 💧                         ║');
  console.log('╠═══════════════════════════════════════════════════════════════════╣');
  console.log('║  Thresholds: 🔴 <$100 STRANDED | 🟡 <$500 WARNING | 🟢 HEALTHY   ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝');
  console.log('');

  const results: LiquidityStatus[] = [];
  const solPrice = 200; // Approximate SOL price for conversion

  for (const pos of watchlist.positions) {
    const data = await fetchLiquidity(pos.address);
    
    if (data) {
      const currentValue = data.priceUsd * pos.tokens;
      const pnlPercent = ((data.priceUsd / pos.entryPrice) - 1) * 100;
      const status = getStatus(data.liquidity);
      
      results.push({
        symbol: pos.symbol,
        address: pos.address,
        liquidity: data.liquidity,
        liquiditySol: data.liquidity / solPrice,
        currentValue,
        priceUsd: data.priceUsd,
        status,
        canExit: data.liquidity > currentValue * 2, // Need 2x liquidity to exit clean
        pnlPercent,
      });
    } else {
      results.push({
        symbol: pos.symbol,
        address: pos.address,
        liquidity: 0,
        liquiditySol: 0,
        currentValue: 0,
        priceUsd: 0,
        status: 'ERROR',
        canExit: false,
        pnlPercent: 0,
      });
    }
  }

  // Sort by liquidity ascending (worst first)
  results.sort((a, b) => a.liquidity - b.liquidity);

  // Count by status
  const stranded = results.filter(r => r.status === 'STRANDED').length;
  const warning = results.filter(r => r.status === 'WARNING').length;
  const healthy = results.filter(r => r.status === 'HEALTHY').length;
  const errors = results.filter(r => r.status === 'ERROR').length;

  console.log(`📊 Summary: ${stranded} Stranded | ${warning} Warning | ${healthy} Healthy | ${errors} Errors`);
  console.log('');

  // Display stranded first
  if (stranded > 0) {
    console.log('═══════════════ 🔴 STRANDED POSITIONS ═══════════════');
    console.log('Cannot exit these - paper gains only');
    console.log('');
    
    for (const r of results.filter(x => x.status === 'STRANDED')) {
      const pnlEmoji = r.pnlPercent >= 0 ? '📈' : '📉';
      console.log(`  ${r.symbol}`);
      console.log(`    Liquidity: ${formatUsd(r.liquidity)} (${r.liquiditySol.toFixed(2)} SOL)`);
      console.log(`    Position:  ${formatUsd(r.currentValue)}`);
      console.log(`    P&L:       ${pnlEmoji} ${r.pnlPercent >= 0 ? '+' : ''}${r.pnlPercent.toFixed(1)}%`);
      console.log(`    Action:    💎 HODL - no liquidity to exit`);
      console.log('');
    }
  }

  // Display warnings
  if (warning > 0) {
    console.log('═══════════════ 🟡 WARNING POSITIONS ═══════════════');
    console.log('Low liquidity - partial exit possible with slippage');
    console.log('');
    
    for (const r of results.filter(x => x.status === 'WARNING')) {
      const pnlEmoji = r.pnlPercent >= 0 ? '📈' : '📉';
      console.log(`  ${r.symbol}`);
      console.log(`    Liquidity: ${formatUsd(r.liquidity)} (${r.liquiditySol.toFixed(2)} SOL)`);
      console.log(`    Position:  ${formatUsd(r.currentValue)}`);
      console.log(`    P&L:       ${pnlEmoji} ${r.pnlPercent >= 0 ? '+' : ''}${r.pnlPercent.toFixed(1)}%`);
      console.log(`    Action:    ⚠️ Monitor - consider partial exit if profitable`);
      console.log('');
    }
  }

  // Display healthy (abbreviated)
  if (healthy > 0) {
    console.log('═══════════════ 🟢 HEALTHY POSITIONS ═══════════════');
    console.log('');
    
    for (const r of results.filter(x => x.status === 'HEALTHY')) {
      const canExitStr = r.canExit ? '✅' : '⚠️';
      console.log(`  ${r.symbol.padEnd(12)} ${formatUsd(r.liquidity).padStart(8)} liq | ${formatUsd(r.currentValue).padStart(8)} pos | Exit: ${canExitStr}`);
    }
    console.log('');
  }

  // Total locked value
  const strandedValue = results
    .filter(r => r.status === 'STRANDED')
    .reduce((sum, r) => sum + r.currentValue, 0);
  
  const warningValue = results
    .filter(r => r.status === 'WARNING')
    .reduce((sum, r) => sum + r.currentValue, 0);

  console.log('═══════════════════════════════════════════════════════');
  console.log('                   LIQUIDITY SUMMARY                    ');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  🔴 Stranded Value:  ${formatUsd(strandedValue)} (paper only)`);
  console.log(`  🟡 At-Risk Value:   ${formatUsd(warningValue)}`);
  console.log(`  📊 Total Positions: ${results.length}`);
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
  console.log('  💡 Lesson: Require $1K+ liquidity for new entries');
  console.log('');
}

// Export for use in other scripts
export async function getStrandedPositions(): Promise<string[]> {
  let watchlist: { positions: Position[] };
  try {
    watchlist = JSON.parse(fs.readFileSync(WATCHLIST_PATH, 'utf-8'));
  } catch {
    return [];
  }

  const stranded: string[] = [];
  for (const pos of watchlist.positions) {
    const data = await fetchLiquidity(pos.address);
    if (data && data.liquidity < LIQUIDITY_CRITICAL) {
      stranded.push(pos.symbol);
    }
  }
  return stranded;
}

// Main
checkLiquidity();
