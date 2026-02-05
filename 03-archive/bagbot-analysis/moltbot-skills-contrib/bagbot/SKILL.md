---
name: solana-bags-trading
description: |
  Trade tokens on Solana's bags.fm ecosystem using Jupiter aggregator. Use when: (1) user wants to 
  swap tokens on Solana, (2) check token prices on DexScreener, (3) analyze bags.fm tokens,
  (4) verify token creators/devs, (5) manage positions with stop-losses. Specialized for the
  bags.fm tokenized social ecosystem but works with any Solana SPL token via Jupiter routing.
author: BagBotx
version: 1.0.0
date: 2026-01-28
metadata: {"clawdbot":{"emoji":"💰","homepage":"https://x.com/BagBotx","requires":{"bins":["curl","node"]}}}
---

# Solana BAGS Trading

Execute token swaps on Solana using Jupiter aggregator, with specialized support for the bags.fm ecosystem.

## Quick Start

### Prerequisites

1. **Solana Keypair** - JSON format keypair file
2. **Node.js 18+** - For running scripts
3. **SOL Balance** - For transaction fees (~0.001 SOL per swap)

### Setup

```bash
# Create skill directory
mkdir -p ~/.clawdbot/skills/solana-bags
cd ~/.clawdbot/skills/solana-bags

# Set environment variables
export SOLANA_KEYPAIR_PATH=/path/to/keypair.json
export SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Install dependencies
npm install @solana/web3.js
```

### Verify Setup

```bash
# Check wallet balance
solana balance --keypair $SOLANA_KEYPAIR_PATH

# Test DexScreener API
curl -s "https://api.dexscreener.com/tokens/v1/solana/So11111111111111111111111111111111111111112" | jq '.pairs[0].priceUsd'
```

## Core Usage

### Token Swaps via Jupiter

Jupiter aggregates liquidity across Solana DEXes for optimal pricing.

```typescript
import { Connection, Keypair, VersionedTransaction } from '@solana/web3.js';
import fs from 'fs';

const connection = new Connection(process.env.SOLANA_RPC_URL);
const keypair = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(fs.readFileSync(process.env.SOLANA_KEYPAIR_PATH, 'utf-8')))
);

async function swap(inputMint: string, outputMint: string, amountLamports: number) {
  // 1. Get quote
  const quoteUrl = `https://api.jup.ag/swap/v1/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amountLamports}&slippageBps=50`;
  const quote = await fetch(quoteUrl).then(r => r.json());
  
  console.log(`Price impact: ${quote.priceImpactPct}%`);
  console.log(`Output amount: ${quote.outAmount}`);
  
  // 2. Build swap transaction
  const swapResponse = await fetch('https://api.jup.ag/swap/v1/swap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      quoteResponse: quote,
      userPublicKey: keypair.publicKey.toString(),
      dynamicComputeUnitLimit: true,
      prioritizationFeeLamports: 'auto'
    })
  }).then(r => r.json());
  
  // 3. Sign and send
  const tx = VersionedTransaction.deserialize(
    Buffer.from(swapResponse.swapTransaction, 'base64')
  );
  tx.sign([keypair]);
  
  const signature = await connection.sendTransaction(tx, {
    skipPreflight: true,
    maxRetries: 3
  });
  
  // 4. Confirm
  await connection.confirmTransaction(signature, 'confirmed');
  console.log(`Success: https://solscan.io/tx/${signature}`);
  
  return signature;
}

// Example: Swap 0.1 SOL for a token
const SOL = 'So11111111111111111111111111111111111111112';
const TOKEN = 'Anbzvnk4Dy69A8hKJonTrhcCbiUCJ9Yu21edJRcoBAGS'; // $BAGBOT
await swap(SOL, TOKEN, 100_000_000); // 0.1 SOL in lamports
```

### Price Analysis via DexScreener

```typescript
interface TokenData {
  priceUsd: string;
  marketCap: number;
  volume: { h24: number; h6: number; h1: number };
  txns: { h24: { buys: number; sells: number } };
  liquidity: { usd: number };
}

async function analyzeToken(address: string): Promise<TokenData | null> {
  const response = await fetch(`https://api.dexscreener.com/tokens/v1/solana/${address}`);
  const data = await response.json();
  const pair = data.pairs?.[0];
  
  if (!pair) return null;
  
  // Calculate key metrics
  const volMcapRatio = pair.volume.h24 / pair.marketCap;
  const buySellRatio = pair.txns.h24.buys / pair.txns.h24.sells;
  
  console.log(`Price: $${pair.priceUsd}`);
  console.log(`MCap: $${pair.marketCap.toLocaleString()}`);
  console.log(`24h Volume: $${pair.volume.h24.toLocaleString()}`);
  console.log(`Vol/MCap Ratio: ${volMcapRatio.toFixed(2)}x`);
  console.log(`Buy/Sell Ratio: ${buySellRatio.toFixed(2)}`);
  console.log(`Liquidity: $${pair.liquidity.usd.toLocaleString()}`);
  
  return pair;
}
```

## bags.fm Ecosystem

bags.fm is a tokenized social platform on Solana where users can launch tokens tied to their identity.

### Identifying bags.fm Tokens

All bags.fm token addresses end in `BAGS`:

```typescript
function isBagsToken(address: string): boolean {
  return address.endsWith('BAGS');
}

// Filter DexScreener results for bags.fm tokens
async function searchBagsTokens(query: string) {
  const response = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${query}`);
  const data = await response.json();
  
  // Filter by dexId
  return data.pairs?.filter(p => p.dexId === 'bags') || [];
}
```

### Token Page URLs

```
Token: bags.fm/{contract_address}
Profile: bags.fm/$USERNAME
```

### Dev Verification

Before trading bags.fm tokens, verify the creator has an active presence:

```typescript
async function verifyBagsToken(address: string) {
  const response = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${address}`);
  const data = await response.json();
  const pair = data.pairs?.find(p => p.dexId === 'bags');
  
  if (!pair) {
    console.log('Not a bags.fm token');
    return false;
  }
  
  // Check for socials
  const socials = pair.info?.socials || [];
  const hasTwitter = socials.some(s => s.type === 'twitter');
  const hasWebsite = pair.info?.websites?.length > 0;
  
  console.log(`Twitter: ${hasTwitter ? '✅' : '❌'}`);
  console.log(`Website: ${hasWebsite ? '✅' : '❌'}`);
  
  // Verification criteria
  return hasTwitter || hasWebsite;
}
```

## Position Management

### Tracking Positions

```typescript
interface Position {
  token: string;
  symbol: string;
  entryPrice: number;
  amount: number;
  stopLoss: number; // e.g., -0.15 for -15%
  timestamp: number;
}

const positions: Position[] = [];

function addPosition(token: string, symbol: string, entryPrice: number, amount: number) {
  positions.push({
    token,
    symbol,
    entryPrice,
    amount,
    stopLoss: -0.15, // Default -15%
    timestamp: Date.now()
  });
}
```

### Stop Loss Monitoring

```typescript
async function checkStopLosses() {
  for (const position of positions) {
    const data = await analyzeToken(position.token);
    if (!data) continue;
    
    const currentPrice = parseFloat(data.priceUsd);
    const pnl = (currentPrice - position.entryPrice) / position.entryPrice;
    
    console.log(`${position.symbol}: ${(pnl * 100).toFixed(1)}%`);
    
    if (pnl <= position.stopLoss) {
      console.log(`⚠️ STOP LOSS HIT: ${position.symbol}`);
      // Execute sell...
    }
  }
}
```

## Trading Rules

### Risk Management

| Rule | Value | Rationale |
|------|-------|-----------|
| Max per trade | 1 SOL | Limit exposure |
| Default slippage | 50 bps | Balance execution vs cost |
| Max slippage | 100 bps | For volatile tokens |
| Gas reserve | 0.05 SOL | Always keep for fees |
| Stop loss | -15% | Cut losses early |

### Entry Criteria

Before entering a position, verify:

1. **Liquidity** > $10K USD
2. **Volume/MCap** > 2x (active trading)
3. **Buy/Sell Ratio** > 1.0 (more buyers)
4. **Dev Verified** - Twitter/socials present
5. **Pool Age** > 1 hour (avoid rugs)

### Red Flags

- Buy/Sell ratio > 10:1 (manipulation)
- No socials or website
- Locked liquidity not visible
- Price impact > 1%
- Anonymous team

## Common Patterns

### Quick Price Check

```bash
curl -s "https://api.dexscreener.com/tokens/v1/solana/$TOKEN_ADDRESS" | \
  jq '{price: .pairs[0].priceUsd, mcap: .pairs[0].marketCap, volume24h: .pairs[0].volume.h24}'
```

### Scan for Opportunities

```typescript
async function scanBagsEcosystem() {
  const response = await fetch('https://api.dexscreener.com/latest/dex/search?q=BAGS');
  const data = await response.json();
  
  const opportunities = data.pairs
    ?.filter(p => p.dexId === 'bags')
    ?.filter(p => p.volume.h24 / p.marketCap > 2) // High volume
    ?.filter(p => p.txns.h24.buys / p.txns.h24.sells > 1) // More buyers
    ?.sort((a, b) => b.volume.h24 - a.volume.h24) // Sort by volume
    ?.slice(0, 10);
  
  return opportunities;
}
```

### Execute with Confirmation

```typescript
async function safeSwap(inputMint: string, outputMint: string, amount: number) {
  // 1. Get quote first
  const quote = await getQuote(inputMint, outputMint, amount);
  
  // 2. Check price impact
  if (parseFloat(quote.priceImpactPct) > 1) {
    throw new Error(`Price impact too high: ${quote.priceImpactPct}%`);
  }
  
  // 3. Simulate transaction
  const simResult = await simulateSwap(quote);
  if (simResult.error) {
    throw new Error(`Simulation failed: ${simResult.error}`);
  }
  
  // 4. Execute
  return await executeSwap(quote);
}
```

## Error Handling

### Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `Insufficient SOL` | Not enough for fees | Add SOL to wallet |
| `Slippage exceeded` | Price moved too fast | Increase slippage or retry |
| `BlockhashNotFound` | Transaction expired | Retry with fresh blockhash |
| `Token account not found` | First time receiving token | Jupiter creates it automatically |
| `Rate limited` | Too many requests | Wait and retry |

### Retry Logic

```typescript
async function swapWithRetry(input: string, output: string, amount: number, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await swap(input, output, amount);
    } catch (error) {
      if (error.message.includes('BlockhashNotFound')) {
        console.log(`Retry ${i + 1}/${maxRetries}...`);
        await new Promise(r => setTimeout(r, 1000));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}
```

## Key Addresses

| Token | Mint Address |
|-------|--------------|
| SOL (Wrapped) | `So11111111111111111111111111111111111111112` |
| USDC | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` |
| USDT | `Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB` |

## Rate Limits

| Service | Limit | Notes |
|---------|-------|-------|
| Jupiter API | No hard limit | Be reasonable |
| DexScreener | 300 req/min | Generous |
| Solana RPC | Varies | Use dedicated RPC for production |

## Resources

- **Jupiter Docs**: https://docs.jup.ag
- **DexScreener API**: https://docs.dexscreener.com
- **bags.fm**: https://bags.fm
- **Solana Web3.js**: https://solana-labs.github.io/solana-web3.js/
- **Solscan Explorer**: https://solscan.io

## Tips for Success

1. **Always simulate** before broadcasting transactions
2. **Start small** - test with 0.01 SOL first
3. **Verify devs** - check Twitter/socials before aping
4. **Watch ratios** - high buy/sell can indicate manipulation
5. **Keep reserves** - never trade your last SOL
6. **Log everything** - on-chain is truth, but notes help context
