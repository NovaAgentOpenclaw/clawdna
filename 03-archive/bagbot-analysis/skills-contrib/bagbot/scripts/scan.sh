#!/bin/bash
# Scan bags.fm ecosystem for trading opportunities
# Usage: scan.sh [min_volume]

set -euo pipefail

MIN_VOLUME="${1:-10000}"

# Fetch bags.fm tokens from DexScreener
RESULT=$(curl -s "https://api.dexscreener.com/latest/dex/search?q=BAGS")

# Filter and sort by volume
echo "$RESULT" | jq --argjson minvol "$MIN_VOLUME" '
  [.pairs[] | 
    select(.dexId == "bags") |
    select(.volume.h24 > $minvol) |
    {
      symbol: .baseToken.symbol,
      address: .baseToken.address,
      price: .priceUsd,
      mcap: .marketCap,
      volume_24h: .volume.h24,
      vol_mcap_ratio: ((.volume.h24 // 0) / (.marketCap // 1)),
      buys_1h: .txns.h1.buys,
      sells_1h: .txns.h1.sells,
      buy_sell_ratio: ((.txns.h1.buys // 0) / ((.txns.h1.sells // 1) | if . == 0 then 1 else . end)),
      change_24h: .priceChange.h24,
      has_socials: ((.info.socials | length) > 0)
    }
  ] | sort_by(-.volume_24h) | .[0:15]'
