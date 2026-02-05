---
name: solana-bags-trading
description: |
  Trade tokens on Solana using Jupiter aggregator. Use when: (1) swap tokens on Solana,
  (2) check token prices/metrics, (3) analyze bags.fm tokens, (4) verify token creators.
  Works with any Solana SPL token via Jupiter routing, specialized for bags.fm ecosystem.
author: BagBotx
version: 1.0.0
date: 2026-01-28
metadata: {"clawdbot":{"emoji":"💰","homepage":"https://x.com/BagBotx","requires":{"bins":["curl","node"]}}}
---

# Solana BAGS Trading

Trade tokens on Solana using Jupiter aggregator, with specialized support for the bags.fm ecosystem.

## Quick Start

### Setup

```bash
# Set environment
export SOLANA_KEYPAIR_PATH=/path/to/keypair.json
export SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Verify
solana balance --keypair $SOLANA_KEYPAIR_PATH
```

### Basic Usage

```bash
# Check token price
scripts/price.sh <token_address>

# Execute swap
scripts/swap.sh <input_mint> <output_mint> <amount_lamports>

# Scan bags.fm tokens
scripts/scan.sh
```

## Capabilities

### Token Swaps
Execute swaps via Jupiter aggregator for optimal routing across Solana DEXes.

**Reference**: [references/jupiter-swaps.md](references/jupiter-swaps.md)

### Price Analysis
Fetch token metrics from DexScreener - price, volume, buy/sell ratios, liquidity.

**Reference**: [references/dexscreener.md](references/dexscreener.md)

### bags.fm Ecosystem
Trade tokens on bags.fm - tokenized social identities on Solana.

**Reference**: [references/bags-ecosystem.md](references/bags-ecosystem.md)

### Position Management
Track positions with entry prices, stop-losses, and P&L monitoring.

**Reference**: [references/position-management.md](references/position-management.md)

## Key Addresses

| Token | Mint Address |
|-------|--------------|
| SOL (Wrapped) | `So11111111111111111111111111111111111111112` |
| USDC | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` |

## Prompt Examples

**Swaps:**
- "Swap 0.1 SOL for USDC"
- "Buy $50 worth of BONK"
- "Sell half my BAGBOT tokens"

**Analysis:**
- "What's the price of BONK?"
- "Show me trending bags.fm tokens"
- "Analyze the buy/sell ratio for this token"

**bags.fm:**
- "Check if this token has a verified dev"
- "Find bags.fm tokens with high volume"

## Rate Limits

| Service | Limit |
|---------|-------|
| Jupiter API | No hard limit |
| DexScreener | 300 req/min |

## Resources

- [Jupiter Docs](https://docs.jup.ag)
- [DexScreener API](https://docs.dexscreener.com)
- [bags.fm](https://bags.fm)
