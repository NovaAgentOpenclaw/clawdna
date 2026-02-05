# Jupiter Swaps Reference

Execute token swaps on Solana using Jupiter aggregator for optimal routing.

## How It Works

Jupiter aggregates liquidity from 20+ Solana DEXes to find the best price for your swap.

## API Flow

1. **Get Quote** - Fetch optimal route and expected output
2. **Build Transaction** - Generate signed transaction
3. **Send & Confirm** - Broadcast and wait for confirmation

## Quote Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `inputMint` | Token to sell | `So11...112` (SOL) |
| `outputMint` | Token to buy | Token address |
| `amount` | Amount in smallest unit | `100000000` (0.1 SOL) |
| `slippageBps` | Slippage tolerance | `50` (0.5%) |

## Example Request

```bash
# Get quote
curl "https://api.jup.ag/swap/v1/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=100000000&slippageBps=50"
```

## Quote Response

```json
{
  "inputMint": "So11...",
  "outputMint": "EPjF...",
  "inAmount": "100000000",
  "outAmount": "15234567",
  "priceImpactPct": "0.01",
  "routePlan": [...]
}
```

## Swap Execution

```typescript
const swapResponse = await fetch('https://api.jup.ag/swap/v1/swap', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    quoteResponse: quote,
    userPublicKey: wallet.publicKey.toString(),
    dynamicComputeUnitLimit: true,
    prioritizationFeeLamports: 'auto'
  })
});
```

## Slippage Settings

| Setting | Use Case |
|---------|----------|
| 50 bps (0.5%) | Stable pairs, high liquidity |
| 100 bps (1%) | Volatile tokens |
| 200+ bps | Very low liquidity |

## Common Errors

| Error | Fix |
|-------|-----|
| `Slippage exceeded` | Increase slippage or reduce amount |
| `Insufficient balance` | Check SOL for fees + input amount |
| `Route not found` | Token may not have liquidity |

## Best Practices

1. Always check `priceImpactPct` before executing
2. Abort if price impact > 1%
3. Keep 0.05 SOL reserve for fees
4. Use `dynamicComputeUnitLimit` for optimal fees
