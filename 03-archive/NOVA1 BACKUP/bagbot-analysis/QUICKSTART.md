# BagBot Quick Start

## Status

✓ Profile created: `bagbot`
✓ Workspace: `~/clawd-bagbot`
✓ Identity configured
✓ Auth token copied from main profile
✓ Wallet directory created

## Start BagBot Gateway

```bash
cd ~/clawdbot
pnpm clawdbot --profile bagbot gateway run --port 18790
```

Or run in background:
```bash
cd ~/clawdbot
nohup pnpm clawdbot --profile bagbot gateway run --port 18790 > /tmp/bagbot-gateway.log 2>&1 &
```

View logs:
```bash
tail -f /tmp/bagbot-gateway.log
```

## Access BagBot

**Web Dashboard:**
- Open: http://localhost:18790/__clawdbot__/control/
- BagBot runs completely separate from Axiom (port 18789)

**Check Status:**
```bash
pnpm clawdbot --profile bagbot gateway status
```

## Connect Messaging

### Telegram (separate bot)
```bash
# Create new bot at @BotFather
# Then configure:
pnpm clawdbot --profile bagbot config set channels.telegram.enabled true
pnpm clawdbot --profile bagbot config set channels.telegram.botToken "YOUR_BOT_TOKEN"
```

### Discord (separate bot)
```bash
pnpm clawdbot --profile bagbot config set channels.discord.enabled true
pnpm clawdbot --profile bagbot config set channels.discord.botToken "YOUR_BOT_TOKEN"
```

## Set Up Solana Wallet

See `wallet/README.md` for detailed instructions.

**Quick setup:**
```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Generate keypair
solana-keygen new --outfile ~/clawd-bagbot/wallet/bagbot-keypair.json

# Get address
solana-keygen pubkey ~/clawd-bagbot/wallet/bagbot-keypair.json

# Test on devnet first
solana airdrop 2 --url devnet
```

## Install Solana Libraries

```bash
cd ~/clawdbot
pnpm add @solana/web3.js @solana/spl-token @jup-ag/api
```

## Configure Trading Limits

Edit `~/.clawdbot-bagbot/clawdbot.json` or use:
```bash
pnpm clawdbot --profile bagbot config set agents.defaults.maxConcurrent 4
```

## Create Trading Skills

BagBot will need custom skills for:
- Wallet balance monitoring
- Token swaps (Jupiter)
- Price checking
- Position tracking
- Risk management

Skills go in: `~/clawdbot/skills/` or as plugins

## Architecture

```
Main Instance (Axiom)          BagBot Instance
├─ Port: 18789                 ├─ Port: 18790
├─ Workspace: ~/clawd/         ├─ Workspace: ~/clawd-bagbot/
├─ Config: ~/.clawdbot/        ├─ Config: ~/.clawdbot-bagbot/
├─ Telegram: @ButlerAxiomBot   ├─ Telegram: (your BagBot)
└─ Purpose: Personal assistant └─ Purpose: Solana trading

Both instances:
✓ Share same Claude API token (your max plan)
✓ Run simultaneously
✓ Completely isolated (no overlap)
✓ Independent sessions/memory
✓ Separate cron jobs
```

## Safety Checklist

- [ ] Test on devnet first
- [ ] Set transaction limits in config
- [ ] Start with small amounts on mainnet
- [ ] Backup wallet keypair securely
- [ ] Never commit keypair to git
- [ ] Monitor BagBot's decisions closely at first
- [ ] Set up alerts for large transactions

## Next Steps

1. Start BagBot gateway
2. Generate Solana wallet
3. Install Solana libraries
4. Create trading skills/tools
5. Test on devnet
6. Deploy cautiously to mainnet
