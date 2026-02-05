# BagBot Status

## ✅ Setup Complete

BagBot is running alongside Axiom with complete isolation.

## Running Instances

### Axiom (Personal Assistant)
- **Profile:** default
- **Port:** 18789
- **PID:** 58537
- **Workspace:** ~/clawd/
- **Config:** ~/.clawdbot/
- **Dashboard:** http://localhost:18789/__clawdbot__/control/
- **Telegram:** @ButlerAxiomBot
- **Purpose:** Personal assistant, creative partner

### BagBot (Solana Trading Agent)
- **Profile:** bagbot
- **Port:** 18790
- **PID:** 63996
- **Workspace:** ~/clawd-bagbot/
- **Config:** ~/.clawdbot-bagbot/
- **Dashboard:** http://localhost:18790/__clawdbot__/control/
- **Telegram:** Not configured yet
- **Purpose:** Autonomous Solana blockchain operations

## Zero Overlap

✓ Different ports (18789 vs 18790)
✓ Different workspaces (~/clawd vs ~/clawd-bagbot)
✓ Different config directories (~/.clawdbot vs ~/.clawdbot-bagbot)
✓ Different sessions/memory
✓ Different cron jobs
✓ Different agent personalities
✓ Different messaging bots (when configured)

✓ Same Claude API token (shared max plan quota)

## Next Steps for BagBot

1. **Set up Solana Wallet**
   ```bash
   # Install Solana CLI
   sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

   # Generate keypair
   solana-keygen new --outfile ~/clawd-bagbot/wallet/bagbot-keypair.json

   # Get wallet address
   solana-keygen pubkey ~/clawd-bagbot/wallet/bagbot-keypair.json
   ```

2. **Install Solana Libraries**
   ```bash
   cd ~/clawdbot
   pnpm add @solana/web3.js @solana/spl-token @jup-ag/api
   ```

3. **Test on Devnet**
   ```bash
   # Airdrop test SOL
   solana airdrop 2 --url devnet

   # Check balance
   solana balance --url devnet
   ```

4. **Create Trading Skills**
   - Wallet balance monitoring
   - Token swaps (Jupiter aggregator)
   - Price feeds
   - Position tracking
   - Risk management

5. **Configure Messaging** (optional)
   Create separate Telegram bot for BagBot:
   ```bash
   # At @BotFather, create new bot
   # Then:
   pnpm clawdbot --profile bagbot config set channels.telegram.enabled true
   pnpm clawdbot --profile bagbot config set channels.telegram.botToken "YOUR_TOKEN"
   ```

6. **Set Transaction Limits**
   ```bash
   # Add to ~/.clawdbot-bagbot/clawdbot.json
   # Configure max transaction size, risk limits, etc.
   ```

## Managing Both Instances

**Restart Axiom:**
```bash
pkill -f "clawdbot gateway run" # kills both
cd ~/clawdbot
nohup pnpm clawdbot gateway run > /tmp/clawdbot-gateway.log 2>&1 &
```

**Restart BagBot:**
```bash
pkill -f "profile bagbot"
cd ~/clawdbot
CLAWDBOT_GATEWAY_PORT=18790 nohup pnpm clawdbot --profile bagbot gateway run > /tmp/bagbot-gateway.log 2>&1 &
```

**View Logs:**
```bash
# Axiom
tail -f /tmp/clawdbot-gateway.log

# BagBot
tail -f /tmp/bagbot-gateway.log
```

**Check Status:**
```bash
# Show both instances
lsof -i :18789 -i :18790 | grep LISTEN

# Axiom status
pnpm clawdbot gateway status

# BagBot status
pnpm clawdbot --profile bagbot gateway status
```

## Access Points

**Axiom Dashboard:**
http://localhost:18789/__clawdbot__/control/

**BagBot Dashboard:**
http://localhost:18790/__clawdbot__/control/

## Safety Reminders

- BagBot will have real Solana wallet with real funds
- Test thoroughly on devnet before mainnet
- Set conservative transaction limits
- Monitor BagBot's decisions closely at first
- Keep wallet keypair backed up and secure
- Never commit keypair to git (already in .gitignore)

---

Last updated: 2026-01-27T06:38:33Z
