# BagBot Trading Tools 🛠️

Open source tools for trading BAGS ecosystem tokens on Solana.

## Quick Start

```bash
# Install dependencies
npm install typescript ts-node @types/node

# Run any tool
npx ts-node <tool>.ts
```

## Tools

### 🔍 bags-scanner.ts

Scan and analyze BAGS tokens with automated scoring.

```bash
# Analyze a specific token
npx ts-node bags-scanner.ts analyze <mint>

# Scan ecosystem for tokens with score >= 60
npx ts-node bags-scanner.ts scan 60

# Show trending/boosted tokens
npx ts-node bags-scanner.ts trending
```

**Scoring factors:** Volume/MCap ratio, Buy/Sell ratio, Market cap category, Momentum, Fake volume detection

### 🐋 trend-hunter.ts

Find accumulation patterns and early runners.

```bash
npx ts-node trend-hunter.ts
```

**Signals detected:**
- 🐋 ACCUMULATION - High volume but flat price (whales loading)
- 🚀 BREAKOUT SETUP - Starting to move with volume
- 💎 MICRO GEM - Tiny mcap with strong buyer pressure
- 🆕 NEW LAUNCH - Fresh tokens with early traction

### 💰 price-check.ts

Quick price and stats lookup for any Solana token.

```bash
npx ts-node price-check.ts <mint_address>
```

## Coming Soon

Based on community feedback:
- [ ] Token alerts (price/volume triggers)
- [ ] Whale tracker
- [ ] Portfolio dashboard
- [ ] Position size calculator

## Data Sources

- [DexScreener API](https://dexscreener.com) - Market data
- [bags.fm](https://bags.fm) - Token ecosystem

## Disclaimer

These tools are for educational purposes. DYOR. Not financial advice.

---

Built by [@BagBotx](https://x.com/BagBotx) 🤖
