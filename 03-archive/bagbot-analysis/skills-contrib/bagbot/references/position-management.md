# Position Management Reference

Track positions with entry prices, stop-losses, and P&L monitoring.

## Position Structure

```typescript
interface Position {
  token: string;      // Mint address
  symbol: string;     // Token symbol
  entryPrice: number; // USD price at entry
  amount: number;     // Token amount
  stopLoss: number;   // e.g., -0.15 for -15%
  timestamp: number;  // Entry time
}
```

## Default Settings

| Setting | Value | Rationale |
|---------|-------|-----------|
| Stop Loss | -15% | Cut losses early |
| Max Position | 1 SOL | Limit exposure |
| Min Position | 0.25 SOL | Don't spray 0.1 SOL everywhere |
| Gas Reserve | 0.05 SOL | Always keep for fees |

## Position Sizing (Based on Stack)

| Stack Size | Trade Size | Max Positions |
|------------|------------|---------------|
| < 1 SOL | 0.1 SOL | 5 |
| 1-5 SOL | 0.1-0.2 SOL | 10 |
| 5+ SOL | 0.25-0.5 SOL | 15 |

**Rule:** Don't spray 0.1 SOL across 30 positions. Fewer, larger, higher-conviction trades.

## P&L Calculation

For bags.fm tokens, get real sell value via quote API:

```typescript
// Get actual sell value (not DexScreener price)
const quote = await bagsApi.get('/trade/quote', {
  params: {
    inputMint: tokenMint,
    outputMint: SOL_MINT,
    amount: (tokenBalance * 1e9).toString(),
    slippageBps: 500,
  }
});

const sellValueSOL = Number(quote.data.response.outAmount) / 1e9;
const pnl = (sellValueSOL - entrySOL) / entrySOL;
console.log(`P&L: ${(pnl * 100).toFixed(1)}%`);
```

**Don't trust DexScreener prices for P&L** — the bonding curve quote is the real value.

## Stop Loss Check

```typescript
if (pnl <= position.stopLoss) {
  console.log(`⚠️ STOP LOSS HIT`);
  // Execute sell
}
```

## Entry Criteria

Before opening a position:

| Check | Threshold |
|-------|-----------|
| Vol/MCap | > 2x |
| Buy/Sell ratio | > 1.0 |
| Dev Verified | Yes (check Twitter) |
| Pool Age | > 1 hour |

**Note on Liquidity:** bags.fm uses bonding curves, not AMM pools. DexScreener shows `null` for liquidity but ALL tokens are tradeable. Check real value via `/trade/quote` API.

## Exit Criteria

| Trigger | Action |
|---------|--------|
| Stop loss hit | Sell 100% |
| +50% profit | Consider partial sell |
| Ratio < 0.5 | Review position |
| Dev rugs | Sell immediately |

## Best Practices

1. Log all entries with tx hash
2. Set stop loss at entry time
3. Review positions daily
4. Don't move stop loss down
5. Take profits on the way up
