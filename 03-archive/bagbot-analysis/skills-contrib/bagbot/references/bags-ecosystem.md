# bags.fm Ecosystem Reference

Trade tokens on bags.fm - Solana's tokenized social platform.

## What is bags.fm?

bags.fm lets anyone launch a token tied to their identity. Creators earn royalties from trading fees.

## CRITICAL: Bonding Curve Liquidity

**All bags.fm tokens use Dynamic Bonding Curves, NOT AMM pools.**

This means:
- ALL positions are ALWAYS tradeable via the bonding curve
- DexScreener shows `null` for liquidity — **IGNORE THIS**
- Never assume a position is "stranded" — check the actual quote
- Use `/trade/quote` API to get real sell values

```bash
# Get actual sell quote (not DexScreener)
curl -H "x-api-key: $BAGS_API_KEY" \
  "https://public-api-v2.bags.fm/api/v1/trade/quote?inputMint=TOKEN_MINT&outputMint=So11111111111111111111111111111111111111112&amount=AMOUNT_IN_SMALLEST_UNIT"
```

**Lesson learned:** I thought 17 positions were "stranded" with $0 liquidity. They were ALL sellable. The bonding curve always provides liquidity.

## Identifying bags.fm Tokens

- All token addresses end in `BAGS`
- DexScreener shows `dexId: "bags"`

```typescript
function isBagsToken(address: string): boolean {
  return address.endsWith('BAGS');
}
```

## URLs

| Page | Format |
|------|--------|
| Token | `bags.fm/{contract_address}` |
| Profile | `bags.fm/$USERNAME` |

## Dev Verification

Before trading, verify the creator has social presence:

```bash
curl -s "https://api.dexscreener.com/latest/dex/search?q=$ADDRESS" | \
  jq '.pairs[] | select(.dexId == "bags") | .info.socials'
```

Check for:
- Twitter/X account linked
- Website present
- Active engagement

## Red Flags

| Signal | Risk |
|--------|------|
| No socials | High - likely rug |
| Buy/Sell > 10:1 | Manipulation |
| Anonymous team | Medium-High |
| No dev activity | Abandoned |

## Trading Rules

1. **Verify dev** - Check Twitter before entry
2. **Start small** - 0.1 SOL max on unverified
3. **Watch ratios** - Healthy is 1-3x buy/sell
4. **Check earnings** - @BagsEarnings shows claimed fees

## Finding Opportunities

```bash
# Search for active bags.fm tokens
curl -s "https://api.dexscreener.com/latest/dex/search?q=BAGS" | \
  jq '[.pairs[] | select(.dexId == "bags" and .volume.h24 > 10000)] | sort_by(-.volume.h24) | .[0:10]'
```
