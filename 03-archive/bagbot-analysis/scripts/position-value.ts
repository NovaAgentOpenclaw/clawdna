#!/usr/bin/env npx ts-node
/**
 * BAGS Position Value Tracker
 * Uses bags.fm API to get REAL sell values via bonding curve quotes
 * 
 * LESSON LEARNED (2026-01-28):
 * - DexScreener shows null liquidity for bags.fm tokens
 * - This is because they use BONDING CURVES, not AMM pools
 * - Bonding curves always provide liquidity
 * - Use /trade/quote API to check actual sellable values
 */

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'https://public-api-v2.bags.fm/api/v1';
const SOL_MINT = 'So11111111111111111111111111111111111111112';
const LAMPORTS = 1_000_000_000;
const SOL_PRICE_USD = 200; // Approximate, could fetch dynamically

const WATCHLIST_PATH = path.join(__dirname, '..', 'data', 'watchlist.json');
const CREDENTIALS_PATH = path.join(process.env.HOME || '', '.credentials', 'bags.env');

function getApiKey(): string {
  try {
    const content = fs.readFileSync(CREDENTIALS_PATH, 'utf-8');
    const match = content.match(/BAGS_API_KEY=(.+)/);
    if (match) return match[1].trim();
  } catch {}
  throw new Error('BAGS_API_KEY not found');
}

interface Position {
  symbol: string;
  name: string;
  address: string;
  entryPrice: number;
  tokens: number;
  costBasis: number;
  notes?: string;
}

interface PositionValue {
  symbol: string;
  address: string;
  tokens: number;
  costBasis: number;
  sellValueSol: number;
  sellValueUsd: number;
  pnlSol: number;
  pnlPercent: number;
  priceImpact: number;
  status: 'PROFIT' | 'LOSS' | 'DIAMOND' | 'ERROR';
  notes?: string;
}

async function getSellQuote(
  apiKey: string,
  tokenMint: string,
  tokenAmount: number
): Promise<{ outSol: number; priceImpact: number } | null> {
  try {
    const api = axios.create({
      baseURL: BASE_URL,
      headers: { 'x-api-key': apiKey },
      timeout: 15000,
    });

    // Token → SOL quote (selling)
    // BAGS tokens have 9 decimals (same as SOL)
    const amountRaw = Math.floor(tokenAmount * 1_000_000_000).toString();

    const { data } = await api.get('/trade/quote', {
      params: {
        inputMint: tokenMint,
        outputMint: SOL_MINT,
        amount: amountRaw,
        slippageBps: 100,
        slippageMode: 'manual',
      },
    });

    if (data.success && data.response) {
      const outSol = Number(data.response.outAmount) / LAMPORTS;
      const priceImpact = parseFloat(data.response.priceImpactPct || '0');
      return { outSol, priceImpact };
    }
    return null;
  } catch (e: any) {
    // Rate limit or API error
    if (e.response?.status === 429) {
      console.log(`   ⏳ Rate limited, waiting...`);
      await sleep(2000);
      return getSellQuote(apiKey, tokenMint, tokenAmount); // Retry
    }
    return null;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function formatSol(sol: number): string {
  return sol.toFixed(4);
}

function formatUsd(usd: number): string {
  if (usd >= 1000) return `$${(usd / 1000).toFixed(1)}K`;
  return `$${usd.toFixed(2)}`;
}

function getStatusEmoji(status: string): string {
  switch (status) {
    case 'PROFIT': return '🟢';
    case 'LOSS': return '🔴';
    case 'DIAMOND': return '💎';
    case 'ERROR': return '❓';
    default: return '⚪';
  }
}

async function checkPositionValues() {
  const apiKey = getApiKey();

  // Load watchlist
  let watchlist: { positions: Position[] };
  try {
    watchlist = JSON.parse(fs.readFileSync(WATCHLIST_PATH, 'utf-8'));
  } catch {
    console.error('❌ Could not load watchlist.json');
    process.exit(1);
  }

  console.log('');
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║            💰 BAGS POSITION VALUE TRACKER 💰                       ║');
  console.log('╠════════════════════════════════════════════════════════════════════╣');
  console.log('║  Using bags.fm bonding curve quotes for REAL sell values           ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝');
  console.log('');

  const results: PositionValue[] = [];
  let totalCostBasis = 0;
  let totalSellValue = 0;

  for (const pos of watchlist.positions) {
    process.stdout.write(`  Checking ${pos.symbol.padEnd(12)}... `);
    
    const quote = await getSellQuote(apiKey, pos.address, pos.tokens);
    
    if (quote) {
      const sellValueSol = quote.outSol;
      const sellValueUsd = sellValueSol * SOL_PRICE_USD;
      const pnlSol = sellValueSol - pos.costBasis;
      const pnlPercent = ((sellValueSol / pos.costBasis) - 1) * 100;
      
      // Determine status
      let status: PositionValue['status'] = 'LOSS';
      if (pos.notes?.includes('DIAMOND') || pos.notes?.includes('NEVER')) {
        status = 'DIAMOND';
      } else if (pnlPercent >= 0) {
        status = 'PROFIT';
      }

      results.push({
        symbol: pos.symbol,
        address: pos.address,
        tokens: pos.tokens,
        costBasis: pos.costBasis,
        sellValueSol,
        sellValueUsd,
        pnlSol,
        pnlPercent,
        priceImpact: quote.priceImpact,
        status,
        notes: pos.notes,
      });

      totalCostBasis += pos.costBasis;
      totalSellValue += sellValueSol;

      console.log(`${formatSol(sellValueSol)} SOL (${pnlPercent >= 0 ? '+' : ''}${pnlPercent.toFixed(1)}%)`);
    } else {
      results.push({
        symbol: pos.symbol,
        address: pos.address,
        tokens: pos.tokens,
        costBasis: pos.costBasis,
        sellValueSol: 0,
        sellValueUsd: 0,
        pnlSol: -pos.costBasis,
        pnlPercent: -100,
        priceImpact: 0,
        status: 'ERROR',
        notes: pos.notes,
      });
      console.log(`ERROR (quote failed)`);
    }

    // Rate limit protection
    await sleep(200);
  }

  // Sort by P&L percent (best first)
  results.sort((a, b) => b.pnlPercent - a.pnlPercent);

  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════════');
  console.log('                         POSITION SUMMARY                              ');
  console.log('═══════════════════════════════════════════════════════════════════════');
  console.log('');

  // Top performers
  const profitable = results.filter(r => r.status === 'PROFIT' || r.status === 'DIAMOND');
  const losing = results.filter(r => r.status === 'LOSS');
  const errors = results.filter(r => r.status === 'ERROR');

  if (profitable.length > 0) {
    console.log('  🟢 PROFITABLE POSITIONS:');
    for (const r of profitable) {
      const emoji = getStatusEmoji(r.status);
      const pnl = r.pnlPercent >= 0 ? `+${r.pnlPercent.toFixed(1)}%` : `${r.pnlPercent.toFixed(1)}%`;
      console.log(`    ${emoji} ${r.symbol.padEnd(12)} ${formatSol(r.sellValueSol).padStart(8)} SOL  ${pnl.padStart(8)}  (cost: ${r.costBasis} SOL)`);
    }
    console.log('');
  }

  if (losing.length > 0) {
    console.log('  🔴 LOSING POSITIONS:');
    for (const r of losing) {
      const pnl = `${r.pnlPercent.toFixed(1)}%`;
      console.log(`    🔴 ${r.symbol.padEnd(12)} ${formatSol(r.sellValueSol).padStart(8)} SOL  ${pnl.padStart(8)}  (cost: ${r.costBasis} SOL)`);
    }
    console.log('');
  }

  if (errors.length > 0) {
    console.log('  ❓ QUOTE ERRORS:');
    for (const r of errors) {
      console.log(`    ❓ ${r.symbol.padEnd(12)} (could not get quote)`);
    }
    console.log('');
  }

  // Portfolio summary
  const totalPnlSol = totalSellValue - totalCostBasis;
  const totalPnlPercent = ((totalSellValue / totalCostBasis) - 1) * 100;
  
  console.log('═══════════════════════════════════════════════════════════════════════');
  console.log('                         PORTFOLIO TOTALS                              ');
  console.log('═══════════════════════════════════════════════════════════════════════');
  console.log(`  📊 Positions:      ${results.length}`);
  console.log(`  💰 Total Cost:     ${formatSol(totalCostBasis)} SOL (${formatUsd(totalCostBasis * SOL_PRICE_USD)})`);
  console.log(`  💎 Sellable Value: ${formatSol(totalSellValue)} SOL (${formatUsd(totalSellValue * SOL_PRICE_USD)})`);
  console.log(`  ${totalPnlSol >= 0 ? '📈' : '📉'} Total P&L:       ${totalPnlSol >= 0 ? '+' : ''}${formatSol(totalPnlSol)} SOL (${totalPnlPercent >= 0 ? '+' : ''}${totalPnlPercent.toFixed(1)}%)`);
  console.log('═══════════════════════════════════════════════════════════════════════');
  console.log('');
  console.log('  💡 All positions tradeable via bags.fm bonding curve');
  console.log('  💡 "Stranded" is a myth - bonding curves always provide liquidity');
  console.log('');

  // Export results
  const outputPath = path.join(__dirname, '..', 'data', 'position-values.json');
  fs.writeFileSync(outputPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    solPriceUsd: SOL_PRICE_USD,
    totalCostBasis,
    totalSellValue,
    totalPnlSol,
    totalPnlPercent,
    positions: results,
  }, null, 2));
  console.log(`  📁 Results saved to data/position-values.json`);
}

// Export for other scripts
export async function getPortfolioValue(): Promise<{
  totalCostBasis: number;
  totalSellValue: number;
  totalPnlPercent: number;
  positions: PositionValue[];
}> {
  const apiKey = getApiKey();
  const watchlist = JSON.parse(fs.readFileSync(WATCHLIST_PATH, 'utf-8'));
  
  const results: PositionValue[] = [];
  let totalCostBasis = 0;
  let totalSellValue = 0;

  for (const pos of watchlist.positions) {
    const quote = await getSellQuote(apiKey, pos.address, pos.tokens);
    if (quote) {
      const sellValueSol = quote.outSol;
      results.push({
        symbol: pos.symbol,
        address: pos.address,
        tokens: pos.tokens,
        costBasis: pos.costBasis,
        sellValueSol,
        sellValueUsd: sellValueSol * SOL_PRICE_USD,
        pnlSol: sellValueSol - pos.costBasis,
        pnlPercent: ((sellValueSol / pos.costBasis) - 1) * 100,
        priceImpact: quote.priceImpact,
        status: pos.notes?.includes('DIAMOND') ? 'DIAMOND' : (sellValueSol >= pos.costBasis ? 'PROFIT' : 'LOSS'),
      });
      totalCostBasis += pos.costBasis;
      totalSellValue += sellValueSol;
    }
    await sleep(200);
  }

  return {
    totalCostBasis,
    totalSellValue,
    totalPnlPercent: ((totalSellValue / totalCostBasis) - 1) * 100,
    positions: results,
  };
}

// CLI
checkPositionValues().catch(console.error);
