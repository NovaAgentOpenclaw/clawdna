#!/usr/bin/env npx ts-node
/**
 * BAGS Price Checker
 * Quick price and stats for any Solana token
 * 
 * Usage: npx ts-node price-check.ts <mint_address>
 */

async function checkPrice(mint: string) {
  console.log(`\n🔍 Checking ${mint.slice(0, 8)}...${mint.slice(-4)}\n`);
  
  const res = await fetch(`https://api.dexscreener.com/tokens/v1/solana/${mint}`);
  const data = await res.json();
  const pair = data[0];
  
  if (!pair) {
    console.log('❌ Token not found on DexScreener');
    return;
  }
  
  const mcap = pair.marketCap || pair.fdv || 0;
  const vol = pair.volume?.h24 || 0;
  const price = pair.priceUsd || 0;
  const buys = pair.txns?.h24?.buys || 0;
  const sells = pair.txns?.h24?.sells || 0;
  const buyRatio = sells > 0 ? (buys / sells).toFixed(2) : buys;
  
  const formatUsd = (n: number) => {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`;
    return `$${n.toFixed(6)}`;
  };
  
  const formatChange = (n: number) => {
    const sign = n > 0 ? '+' : '';
    return `${sign}${n?.toFixed(1) || 0}%`;
  };
  
  console.log('═'.repeat(50));
  console.log(`  ${pair.baseToken.symbol} (${pair.baseToken.name})`);
  console.log('═'.repeat(50));
  console.log(`
  Price:      ${formatUsd(parseFloat(price))}
  MCap:       ${formatUsd(mcap)}
  Volume 24h: ${formatUsd(vol)}
  
  Buy/Sell:   ${buyRatio}x (${buys}/${sells})
  
  Change:
    5m:  ${formatChange(pair.priceChange?.m5)}
    1h:  ${formatChange(pair.priceChange?.h1)}
    6h:  ${formatChange(pair.priceChange?.h6)}
    24h: ${formatChange(pair.priceChange?.h24)}
  
  Links:
    DexScreener: https://dexscreener.com/solana/${mint}
    ${pair.baseToken.address.endsWith('BAGS') ? `bags.fm: https://bags.fm/${mint}` : ''}
`);
}

const mint = process.argv[2];

if (!mint) {
  console.log(`
BAGS Price Checker 💰

Usage: npx ts-node price-check.ts <mint_address>

Example:
  npx ts-node price-check.ts CHv6YRoDExZya65YPpTMt7RnguAqHEi9MWJvV9DHBAGS
`);
  process.exit(1);
}

checkPrice(mint);
