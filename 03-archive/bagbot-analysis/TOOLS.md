# TOOLS.md - Local Notes

Skills define *how* tools work. This file is for *your* specifics — the stuff that's unique to your setup.

## Twitter / X

- **Handle:** @BagBotx
- **User ID:** 1939335167031861248
- **First Tweet:** 2026-01-27 (status/2016233054138990917)

### API Access (OAuth 2.0 ✅)
- **App:** BagBotX
- **Credentials:** `~/.credentials/twitter.env` + `twitter-tokens.json`
- **Monthly Budget:** $200 credits (pay-per-use)
- **Docs:** https://docs.x.com/llms.txt

### API Commands
```bash
npx ts-node scripts/twitter-api.ts me                    # Profile stats
npx ts-node scripts/twitter-api.ts mentions [limit]      # Get mentions
npx ts-node scripts/twitter-api.ts search "query"        # Search tweets
npx ts-node scripts/twitter-api.ts tweet "text"          # Post tweet
npx ts-node scripts/twitter-api.ts reply <id> "text"     # Reply to tweet
npx ts-node scripts/twitter-api.ts like <id>             # Like tweet
npx ts-node scripts/twitter-api.ts timeline [limit]      # My tweets
```

### Key Rate Limits (per 15min unless noted)
| Action | Per User | Per App |
|--------|----------|---------|
| Post tweet | 100 (10K/24h) | 10K/24h |
| Like | 50 (1K/24h) | - |
| Search recent | 300 | 450 |
| Get mentions | 300 | 450 |

### Auth Notes
- OAuth 2.0 user tokens stored in `twitter-tokens.json`
- Auto-refresh via `offline.access` scope
- Browser fallback: clawd profile still works

## Telegram

- **Bot:** @BagsXBot
- **Bot ID:** 8591854123
- **Credentials:** `~/.credentials/telegram.env`

## Solana

- **Wallet:** `bL7yksLLAUZDhSXvxhMEVpruqhUNn8T8C4jWzdnVChm`
- **Keypair:** `~/clawd-bagbot/wallet/bagbot-keypair.json`
- **Network:** mainnet-beta
- **RPC:** https://api.mainnet-beta.solana.com

## bags.fm

- **Referral Link:** https://bags.fm/?ref=bagbotx
- **Use this link** when sharing bags.fm or in tweets about the platform

## bags.fm API

- **Base URL:** `https://public-api-v2.bags.fm/api/v1/`
- **Credentials:** `~/.credentials/bags.env`
- **Rate Limit:** 1,000 req/hour
- **Client:** `scripts/bags-api.ts`
- **Commands:**
  - `bags-api quote SOL <mint> <amount>` — Swap quote
  - `bags-api fees <mint>` — Lifetime fees
  - `bags-api creators <mint>` — Token creators

### bags.fm SDK Services (@bagsfm/bags-sdk v1.2.7)
| Service | Key Methods | Use Case |
|---------|-------------|----------|
| `trade` | `getQuote()`, `createSwapTransaction()` | Swap execution |
| `state` | `getTokenCreators()`, `getTokenLifetimeFees()`, `getTokenClaimStats()` | **Dev verification**, analytics |
| `fee` | Fee claiming methods | Claim accumulated fees |
| `tokenLaunch` | Launch management | Not using (buyer not launcher) |

**Dev Verification via SDK:** `sdk.state.getTokenCreators(mint)` returns creators with Twitter handles for verification.

## BagBot Scripts

### Trading Tools
```bash
# Pre-trade checklist V2 (with auto dev verification!) — RECOMMENDED
npx ts-node scripts/trade-checklist-v2.ts <mint> [amount]

# Dev verification (bags.fm SDK)
npx ts-node scripts/dev-checker.ts <mint>    # Verify creators before trading

# Pre-trade checklist (legacy, manual dev check)
npx ts-node scripts/trade-checklist.ts <mint> [amount]

# Fee checker (bags.fm SDK)
npx ts-node scripts/fees-checker.ts check    # Check claimable
npx ts-node scripts/fees-checker.ts claim    # Claim all

# Portfolio & positions
npx ts-node scripts/position-value.ts        # Current holdings
npx ts-node scripts/portfolio.ts             # Full portfolio view
npx ts-node scripts/performance.ts           # P&L analysis

# Scanning
npx ts-node scripts/bags-scanner.ts          # BAGS token scanner
npx ts-node scripts/bags-tracker.ts          # Track specific tokens

# Execution
npx ts-node scripts/bags-api.ts quote SOL <mint> <amt>  # Get quote
npx ts-node scripts/execute-swap.ts          # Execute trades
```

---

Add whatever helps you do your job. This is your cheat sheet.
