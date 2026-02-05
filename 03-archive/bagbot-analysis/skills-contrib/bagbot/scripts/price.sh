#!/bin/bash
# Get token price and metrics from DexScreener
# Usage: price.sh <token_address>

set -euo pipefail

if [ $# -lt 1 ]; then
    echo "Usage: price.sh <token_address>" >&2
    exit 1
fi

TOKEN_ADDRESS="$1"

# Fetch from DexScreener
RESULT=$(curl -s "https://api.dexscreener.com/tokens/v1/solana/${TOKEN_ADDRESS}")

# Check if we got data
if ! echo "$RESULT" | jq -e '.pairs[0]' >/dev/null 2>&1; then
    echo "Token not found: ${TOKEN_ADDRESS}" >&2
    exit 1
fi

# Extract and display metrics
echo "$RESULT" | jq '{
  symbol: .pairs[0].baseToken.symbol,
  name: .pairs[0].baseToken.name,
  price: .pairs[0].priceUsd,
  mcap: .pairs[0].marketCap,
  volume_24h: .pairs[0].volume.h24,
  volume_1h: .pairs[0].volume.h1,
  buys_24h: .pairs[0].txns.h24.buys,
  sells_24h: .pairs[0].txns.h24.sells,
  liquidity: .pairs[0].liquidity.usd,
  change_24h: .pairs[0].priceChange.h24,
  change_1h: .pairs[0].priceChange.h1,
  dex: .pairs[0].dexId
}'
