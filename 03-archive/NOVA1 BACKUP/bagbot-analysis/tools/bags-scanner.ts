#!/usr/bin/env npx ts-node
/**
 * BAGS Token Scanner
 * Scans the bags.fm ecosystem for promising tokens
 * 
 * Usage:
 *   npx ts-node bags-scanner.ts analyze <mint>  - Deep analysis of a token
 *   npx ts-node bags-scanner.ts scan [min_score] - Scan ecosystem (default: 50)
 *   npx ts-node bags-scanner.ts trending - Show boosted BAGS tokens
 */

const DEXSCREENER_API = 'https://api.dexscreener.com';

interface TokenAnalysis {
  symbol: string;
  name: string;
  mint: string;
  score: number;
  metrics: {
    mcap: number;
    volume24h: number;
    volMcapRatio: number;
    buyRatio: number;
    priceChange: { h1: number; h6: number; h24: number };
    txCount24h: number;
    avgTxSize: number;
  };
  signals: string[];
  risks: string[];
}

async function fetchToken(mint: string): Promise<any> {
  const res = await fetch(`${DEXSCREENER_API}/tokens/v1/solana/${mint}`);
  const data = await res.json();
  return data[0];
}

async function searchBags(): Promise<any[]> {
  const res = await fetch(`${DEXSCREENER_API}/latest/dex/search?q=BAGS`);
  const data = await res.json();
  return data.pairs?.filter((p: any) => 
    p.chainId === 'solana' && 
    p.baseToken.address.endsWith('BAGS')
  ) || [];
}

function analyzeToken(pair: any): TokenAnalysis {
  const mcap = pair.marketCap || pair.fdv || 0;
  const vol = pair.volume?.h24 || 0;
  const volMcapRatio = mcap > 0 ? vol / mcap : 0;
  
  const buys24 = pair.txns?.h24?.buys || 0;
  const sells24 = pair.txns?.h24?.sells || 0;
  const buyRatio = sells24 > 0 ? buys24 / sells24 : buys24;
  const txCount = buys24 + sells24;
  const avgTxSize = txCount > 0 ? vol / txCount : 0;
  
  const h1 = pair.priceChange?.h1 || 0;
  const h6 = pair.priceChange?.h6 || 0;
  const h24 = pair.priceChange?.h24 || 0;
  
  // Scoring system (0-100)
  let score = 50; // Base score
  const signals: string[] = [];
  const risks: string[] = [];
  
  // Volume/MCap ratio (higher = more active)
  if (volMcapRatio > 10) { score += 15; signals.push('🔥 Very high volume'); }
  else if (volMcapRatio > 5) { score += 10; signals.push('📈 High volume'); }
  else if (volMcapRatio > 2) { score += 5; signals.push('✅ Good volume'); }
  else if (volMcapRatio < 0.5) { score -= 10; risks.push('⚠️ Low volume'); }
  
  // Buy/Sell ratio (higher = buyers winning)
  if (buyRatio > 2) { score += 15; signals.push('🐂 Strong buy pressure'); }
  else if (buyRatio > 1.3) { score += 10; signals.push('📈 Buyers winning'); }
  else if (buyRatio > 1) { score += 5; }
  else if (buyRatio < 0.7) { score -= 15; risks.push('🔴 Heavy selling'); }
  else if (buyRatio < 1) { score -= 5; risks.push('⚠️ Sellers winning'); }
  
  // Market cap category
  if (mcap < 10000) { score += 10; signals.push('💎 Micro cap gem'); }
  else if (mcap < 50000) { score += 5; signals.push('🌱 Early stage'); }
  else if (mcap > 500000) { score -= 5; risks.push('📊 Higher mcap'); }
  
  // Momentum
  if (h1 > 50) { score += 5; signals.push('🚀 Pumping now'); }
  else if (h1 < -30) { score -= 10; risks.push('📉 Dumping'); }
  
  // Fake volume check
  if (avgTxSize > 500 && txCount < 100) {
    score -= 20;
    risks.push('🚨 Possible wash trading');
  }
  
  // Activity check
  if (txCount < 50) { score -= 10; risks.push('😴 Low activity'); }
  
  return {
    symbol: pair.baseToken.symbol,
    name: pair.baseToken.name,
    mint: pair.baseToken.address,
    score: Math.max(0, Math.min(100, score)),
    metrics: {
      mcap,
      volume24h: vol,
      volMcapRatio,
      buyRatio,
      priceChange: { h1, h6, h24 },
      txCount24h: txCount,
      avgTxSize
    },
    signals,
    risks
  };
}

function formatUsd(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`;
  return `$${n.toFixed(0)}`;
}

async function analyze(mint: string) {
  console.log(`\n🔍 Analyzing ${mint.slice(0, 8)}...BAGS\n`);
  
  const pair = await fetchToken(mint);
  if (!pair) {
    console.log('❌ Token not found');
    return;
  }
  
  const analysis = analyzeToken(pair);
  
  console.log('═'.repeat(60));
  console.log(`  ${analysis.symbol} (${analysis.name})`);
  console.log(`  Score: ${analysis.score}/100`);
  console.log('═'.repeat(60));
  console.log(`\n📊 Metrics:`);
  console.log(`   MCap:      ${formatUsd(analysis.metrics.mcap)}`);
  console.log(`   Volume:    ${formatUsd(analysis.metrics.volume24h)} (${analysis.metrics.volMcapRatio.toFixed(1)}x mcap)`);
  console.log(`   Buy/Sell:  ${analysis.metrics.buyRatio.toFixed(2)}x`);
  console.log(`   Txs:       ${analysis.metrics.txCount24h} (avg ${formatUsd(analysis.metrics.avgTxSize)})`);
  console.log(`\n📈 Price Change:`);
  console.log(`   1h:  ${analysis.metrics.priceChange.h1 > 0 ? '+' : ''}${analysis.metrics.priceChange.h1.toFixed(1)}%`);
  console.log(`   6h:  ${analysis.metrics.priceChange.h6 > 0 ? '+' : ''}${analysis.metrics.priceChange.h6.toFixed(1)}%`);
  console.log(`   24h: ${analysis.metrics.priceChange.h24 > 0 ? '+' : ''}${analysis.metrics.priceChange.h24.toFixed(1)}%`);
  
  if (analysis.signals.length) {
    console.log(`\n✅ Signals:`);
    analysis.signals.forEach(s => console.log(`   ${s}`));
  }
  if (analysis.risks.length) {
    console.log(`\n⚠️ Risks:`);
    analysis.risks.forEach(r => console.log(`   ${r}`));
  }
  console.log('');
}

async function scan(minScore = 50) {
  console.log(`\n🔍 Scanning BAGS ecosystem (min score: ${minScore})...\n`);
  
  const pairs = await searchBags();
  const analyses = pairs.map(analyzeToken).filter(a => a.score >= minScore);
  analyses.sort((a, b) => b.score - a.score);
  
  console.log('═'.repeat(70));
  console.log(`  Found ${analyses.length} tokens with score >= ${minScore}`);
  console.log('═'.repeat(70));
  
  for (const a of analyses.slice(0, 15)) {
    const mcapStr = formatUsd(a.metrics.mcap).padStart(8);
    const volStr = formatUsd(a.metrics.volume24h).padStart(8);
    const ratioStr = `${a.metrics.buyRatio.toFixed(2)}x`.padStart(6);
    console.log(`\n  [${a.score}] ${a.symbol}`);
    console.log(`      MCap: ${mcapStr} | Vol: ${volStr} | B/S: ${ratioStr}`);
    if (a.signals.length) console.log(`      ${a.signals.slice(0, 2).join(' ')}`);
  }
  console.log('');
}

async function trending() {
  console.log('\n🔥 Trending BAGS tokens...\n');
  
  const res = await fetch(`${DEXSCREENER_API}/token-boosts/top/v1`);
  const boosts = await res.json();
  
  const bagsBoosted = boosts.filter((b: any) => 
    b.chainId === 'solana' && 
    b.tokenAddress?.endsWith('BAGS')
  );
  
  if (bagsBoosted.length === 0) {
    console.log('  No BAGS tokens currently boosted on DexScreener');
    return;
  }
  
  for (const b of bagsBoosted.slice(0, 10)) {
    console.log(`  ${b.symbol || 'Unknown'}`);
    console.log(`  └─ ${b.tokenAddress}`);
  }
  console.log('');
}

// CLI
const [,, cmd, arg] = process.argv;

switch (cmd) {
  case 'analyze':
    if (!arg) {
      console.log('Usage: bags-scanner analyze <mint>');
      process.exit(1);
    }
    analyze(arg);
    break;
  case 'scan':
    scan(arg ? parseInt(arg) : 50);
    break;
  case 'trending':
    trending();
    break;
  default:
    console.log(`
BAGS Token Scanner 🔍

Commands:
  analyze <mint>     Deep analysis of a specific token
  scan [min_score]   Scan ecosystem (default score: 50)
  trending           Show DexScreener boosted tokens

Examples:
  npx ts-node bags-scanner.ts analyze CHv6YRoDExZya65YPpTMt7RnguAqHEi9MWJvV9DHBAGS
  npx ts-node bags-scanner.ts scan 60
  npx ts-node bags-scanner.ts trending
`);
}
