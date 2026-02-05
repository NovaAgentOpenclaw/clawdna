#!/usr/bin/env npx ts-node
/**
 * Trade Performance Analyzer
 * 
 * Analyzes closed trades from watchlist.json and calculates:
 * - Win rate
 * - Average win vs average loss
 * - Profit factor
 * - Expectancy (EV per trade)
 * - Max drawdown
 * - Best/worst trades
 * 
 * Usage: npx ts-node scripts/performance.ts
 */

import { readFileSync } from "fs";
import { join } from "path";

interface ClosedPosition {
  symbol: string;
  name: string;
  address: string;
  entryPrice: number;
  exitPrice: number;
  entryDate: string;
  exitDate: string;
  tokens: number;
  costBasis: number;
  realized: number;
  pnl: number;
  pnlPct: number;
  reason: string;
}

interface OpenPosition {
  symbol: string;
  name: string;
  address: string;
  entryPrice: number;
  entryDate: string;
  tokens: number;
  costBasis: number;
  notes: string;
}

interface WatchlistData {
  positions: OpenPosition[];
  closed: ClosedPosition[];
  watchlist: any[];
  lastUpdated: string;
}

function loadWatchlist(): WatchlistData {
  const path = join(__dirname, "..", "data", "watchlist.json");
  const data = JSON.parse(readFileSync(path, "utf-8"));
  return data;
}

function analyzePerformance() {
  const data = loadWatchlist();
  const closed = data.closed || [];
  const open = data.positions || [];

  if (closed.length === 0) {
    console.log("No closed trades to analyze.");
    return;
  }

  // Separate wins and losses
  const wins = closed.filter((t) => t.pnl > 0);
  const losses = closed.filter((t) => t.pnl <= 0);

  // Basic stats
  const totalTrades = closed.length;
  const winCount = wins.length;
  const lossCount = losses.length;
  const winRate = (winCount / totalTrades) * 100;

  // P&L calculations
  const totalPnL = closed.reduce((sum, t) => sum + t.pnl, 0);
  const totalWins = wins.reduce((sum, t) => sum + t.pnl, 0);
  const totalLosses = Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0));

  const avgWin = wins.length > 0 ? totalWins / wins.length : 0;
  const avgLoss = losses.length > 0 ? totalLosses / losses.length : 0;

  // Profit factor: gross profit / gross loss
  const profitFactor = totalLosses > 0 ? totalWins / totalLosses : Infinity;

  // Expectancy: (Win% × Avg Win) - (Loss% × Avg Loss)
  const expectancy = (winRate / 100) * avgWin - ((100 - winRate) / 100) * avgLoss;

  // Risk/Reward ratio: average win / average loss
  const riskReward = avgLoss > 0 ? avgWin / avgLoss : Infinity;

  // Best and worst trades
  const bestTrade = closed.reduce((best, t) => (t.pnlPct > best.pnlPct ? t : best), closed[0]);
  const worstTrade = closed.reduce((worst, t) => (t.pnlPct < worst.pnlPct ? t : worst), closed[0]);

  // Total capital deployed (sum of cost bases)
  const totalDeployed = closed.reduce((sum, t) => sum + t.costBasis, 0);
  const totalRealized = closed.reduce((sum, t) => sum + t.realized, 0);
  const roiPct = ((totalRealized - totalDeployed) / totalDeployed) * 100;

  // Open position stats
  const openCapital = open.reduce((sum, p) => sum + p.costBasis, 0);

  // Output
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║             📊 BAGBOT TRADE PERFORMANCE REPORT              ║");
  console.log("╠════════════════════════════════════════════════════════════╣");
  console.log("║ CLOSED TRADES ANALYSIS                                      ║");
  console.log("╠════════════════════════════════════════════════════════════╣");
  console.log(`║ Total Trades:     ${String(totalTrades).padEnd(6)} │ Wins: ${String(winCount).padEnd(3)} │ Losses: ${String(lossCount).padEnd(4)}║`);
  console.log(`║ Win Rate:         ${winRate.toFixed(1).padEnd(6)}% │ Loss Rate: ${(100 - winRate).toFixed(1).padEnd(5)}%       ║`);
  console.log("╠════════════════════════════════════════════════════════════╣");
  console.log("║ FINANCIAL METRICS                                          ║");
  console.log("╠════════════════════════════════════════════════════════════╣");
  console.log(`║ Total P&L:        ${(totalPnL >= 0 ? "+" : "") + totalPnL.toFixed(4)} SOL                            ║`);
  console.log(`║ Capital Deployed: ${totalDeployed.toFixed(4)} SOL                              ║`);
  console.log(`║ Capital Returned: ${totalRealized.toFixed(4)} SOL                              ║`);
  console.log(`║ ROI:              ${(roiPct >= 0 ? "+" : "") + roiPct.toFixed(1)}%                                   ║`);
  console.log("╠════════════════════════════════════════════════════════════╣");
  console.log("║ RISK METRICS                                               ║");
  console.log("╠════════════════════════════════════════════════════════════╣");
  console.log(`║ Avg Win:          +${avgWin.toFixed(4)} SOL                             ║`);
  console.log(`║ Avg Loss:         -${avgLoss.toFixed(4)} SOL                             ║`);
  console.log(`║ Profit Factor:    ${profitFactor === Infinity ? "∞" : profitFactor.toFixed(2).padEnd(5)}                                   ║`);
  console.log(`║ Risk/Reward:      ${riskReward === Infinity ? "∞" : riskReward.toFixed(2).padEnd(5)}:1                                  ║`);
  console.log(`║ Expectancy:       ${(expectancy >= 0 ? "+" : "") + expectancy.toFixed(4)} SOL/trade                    ║`);
  console.log("╠════════════════════════════════════════════════════════════╣");
  console.log("║ NOTABLE TRADES                                             ║");
  console.log("╠════════════════════════════════════════════════════════════╣");
  console.log(`║ 🏆 Best:  ${bestTrade.symbol.padEnd(12)} ${(bestTrade.pnlPct >= 0 ? "+" : "") + bestTrade.pnlPct}%                         ║`);
  console.log(`║ 💀 Worst: ${worstTrade.symbol.padEnd(12)} ${worstTrade.pnlPct}%                          ║`);
  console.log("╠════════════════════════════════════════════════════════════╣");
  console.log("║ CURRENT EXPOSURE                                           ║");
  console.log("╠════════════════════════════════════════════════════════════╣");
  console.log(`║ Open Positions:   ${open.length}                                        ║`);
  console.log(`║ Open Capital:     ${openCapital.toFixed(4)} SOL                              ║`);
  console.log("╚════════════════════════════════════════════════════════════╝");

  // Trade-by-trade breakdown
  console.log("\n📋 TRADE LOG (Closed):");
  console.log("─".repeat(75));
  console.log("│ Symbol       │ Entry     │ Exit      │ P&L        │ Reason");
  console.log("─".repeat(75));
  
  for (const t of closed) {
    const pnlStr = (t.pnlPct >= 0 ? "+" : "") + t.pnlPct + "%";
    const icon = t.pnl > 0 ? "🟢" : "🔴";
    console.log(`│ ${icon} ${t.symbol.padEnd(10)} │ ${t.entryDate} │ ${t.exitDate} │ ${pnlStr.padEnd(10)} │ ${t.reason.substring(0, 30)}`);
  }
  console.log("─".repeat(75));

  // Return stats for potential JSON export
  return {
    totalTrades,
    winCount,
    lossCount,
    winRate,
    totalPnL,
    profitFactor,
    expectancy,
    riskReward,
    avgWin,
    avgLoss,
    roiPct,
    bestTrade: { symbol: bestTrade.symbol, pnlPct: bestTrade.pnlPct },
    worstTrade: { symbol: worstTrade.symbol, pnlPct: worstTrade.pnlPct },
    openPositions: open.length,
    openCapital,
    analyzedAt: new Date().toISOString(),
  };
}

// Run
const stats = analyzePerformance();

// Export for potential use
if (stats && process.argv.includes("--json")) {
  console.log("\n📊 JSON Export:");
  console.log(JSON.stringify(stats, null, 2));
}
