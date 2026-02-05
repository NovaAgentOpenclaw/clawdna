# DexScreener Reference

Fetch token prices and metrics from DexScreener API.

## Endpoints

| Endpoint | Use |
|----------|-----|
| `/tokens/v1/solana/{address}` | Get token data by address |
| `/latest/dex/search?q={query}` | Search tokens |

## Token Data Response

```json
{
  "pairs": [{
    "baseToken": {
      "address": "...",
      "symbol": "TOKEN",
      "name": "Token Name"
    },
    "priceUsd": "0.00001234",
    "marketCap": 50000,
    "volume": {
      "h24": 25000,
      "h6": 8000,
      "h1": 2000
    },
    "txns": {
      "h24": { "buys": 500, "sells": 300 },
      "h6": { "buys": 150, "sells": 100 },
      "h1": { "buys": 30, "sells": 20 }
    },
    "liquidity": { "usd": 15000 },
    "priceChange": {
      "h24": 25.5,
      "h6": 10.2,
      "h1": 5.1
    }
  }]
}
```

## Key Metrics

| Metric | Calculation | Good Value |
|--------|-------------|------------|
| Vol/MCap Ratio | volume.h24 / marketCap | > 2x |
| Buy/Sell Ratio | buys / sells | > 1.0 |
| Liquidity | liquidity.usd | > $10K |

## Quick Price Check

```bash
curl -s "https://api.dexscreener.com/tokens/v1/solana/$ADDRESS" | \
  jq '{price: .pairs[0].priceUsd, mcap: .pairs[0].marketCap}'
```

## Filter for bags.fm Tokens

```bash
curl -s "https://api.dexscreener.com/latest/dex/search?q=BAGS" | \
  jq '.pairs[] | select(.dexId == "bags")'
```

## Rate Limits

- 300 requests per minute
- No authentication required

## Best Practices

1. Cache responses when possible
2. Use search endpoint for discovery
3. Check `dexId` field for DEX identification
4. Monitor buy/sell ratios for sentiment
