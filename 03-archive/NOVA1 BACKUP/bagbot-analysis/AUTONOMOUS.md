# BagBot Autonomous Operation Mode

BagBot is configured to operate autonomously with safety limits.

## Autonomous Capabilities

### What BagBot Can Do Independently

**Market Monitoring:**
- Track SOL and token prices continuously
- Identify trading opportunities
- Monitor wallet balance and positions
- Watch for market volatility

**Trading Decisions:**
- Execute trades based on market conditions
- Rebalance positions when appropriate
- Take profits at target levels
- Cut losses when needed
- Optimize for best execution prices via Jupiter

**Risk Management:**
- Respect configured transaction limits
- Calculate position sizes based on available capital
- Maintain minimum SOL reserve for gas
- Monitor price impact before executing
- Simulate transactions before sending

**Learning & Adaptation:**
- Log all trades and outcomes
- Analyze performance metrics
- Adjust strategy based on results
- Report significant events

## Safety Limits (Configured)

### Transaction Limits
- **Max SOL per swap:** 1.0 SOL
- **Max slippage:** 0.5% (50 bps)
- **Max price impact:** 1.0%
- **Min SOL reserve:** 0.1 SOL (keep for gas)

### Operating Parameters
- **Max concurrent operations:** 8
- **Max subagents:** 16
- **Network:** Devnet (testing) → Mainnet (production)
- **Confirmation mode:** Always verify before large trades

## Autonomous Behavior Modes

### 1. Conservative (Default - Recommended for Start)
- Focus on capital preservation
- Only trade high-confidence opportunities
- Smaller position sizes (10-25% of available)
- Wider stops, longer holding periods
- Ask before trades >0.5 SOL

### 2. Moderate
- Balanced risk/reward approach
- Moderate position sizes (25-50% of available)
- Active trading when opportunities arise
- Normal stops and profit targets
- Ask before trades >1.0 SOL

### 3. Aggressive (Use with Caution)
- Maximize profit opportunities
- Larger position sizes (50-75% of available)
- Frequent trading, quick entries/exits
- Tighter stops, higher leverage
- Only ask before trades >2.0 SOL

## What Requires Approval

Even in autonomous mode, BagBot will ask before:
- Trades exceeding configured limits
- New trading strategies or approaches
- Unusual market conditions
- Deploying to new protocols
- Any action with significant downside risk

## Monitoring & Oversight

### Real-Time Monitoring
BagBot logs everything:
- `~/clawd-bagbot/swaps.jsonl` - All successful trades
- `~/clawd-bagbot/swap-failures.jsonl` - Failed attempts
- `~/clawd-bagbot/prices.jsonl` - Price monitoring data
- `~/.clawdbot-bagbot/agents/main/sessions/` - Full session logs

### Performance Tracking
Access BagBot dashboard: http://localhost:18790/__clawdbot__/control/

### Alerts
BagBot will notify via:
- Dashboard updates
- Session messages
- Telegram (if configured)

## Starting Autonomous Operation

### Step 1: Fund Wallet (Testing)
```bash
# Get devnet SOL for testing
# Visit: https://faucet.solana.com
# Send to: bL7yksLLAUZDhSXvxhMEVpruqhUNn8T8C4jWzdnVChm
```

### Step 2: Set Initial Directive
Tell BagBot: "You can trade autonomously on devnet. Start conservatively - watch SOL and BONK prices, look for good entry points. Max 0.5 SOL per trade. Focus on learning the market first."

### Step 3: Let It Run
BagBot will:
1. Monitor prices continuously
2. Identify opportunities
3. Execute trades within limits
4. Log all activity
5. Report back periodically

### Step 4: Review & Adjust
- Check dashboard regularly
- Review trade logs
- Adjust limits as needed
- Provide feedback on performance

## Initial Trading Strategy (Suggested)

**For First Week (Devnet Testing):**
```
Mission: Learn market patterns, test execution, verify logging.

Strategy:
- Monitor SOL/USDC and BONK/SOL pairs
- Execute small test swaps (0.01-0.1 SOL)
- Focus on perfect execution over profits
- Log everything, report daily summary
- Ask questions when uncertain

Success Metrics:
- Zero failed transactions
- Clean logs and reporting
- Understanding of market patterns
- Building confidence in execution
```

## Transitioning to Mainnet

### Prerequisites
- [ ] Successfully tested on devnet for 1+ weeks
- [ ] All trades executed cleanly
- [ ] Logging verified and complete
- [ ] Performance metrics look good
- [ ] Comfortable with autonomous behavior

### Mainnet Startup
1. Fund BagBot wallet with small amount (0.5-2 SOL)
2. Start with ultra-conservative limits
3. Monitor very closely for first 24-48 hours
4. Scale gradually based on performance
5. Adjust strategy as needed

## Emergency Controls

### Pause Trading
Tell BagBot: "Stop all trading immediately. Cancel any pending transactions."

### Reset Strategy
Tell BagBot: "Reset to conservative mode. Close all positions safely."

### Manual Override
Access dashboard and interact directly for any trade decisions.

### Kill Switch
```bash
# Stop BagBot gateway entirely
pkill -f "profile bagbot"
```

## Communication Style

BagBot will:
- Report significant trades and decisions
- Provide daily/weekly performance summaries
- Flag unusual market conditions
- Ask for guidance when uncertain
- Log everything for transparency

BagBot won't:
- Spam you with every small action
- Make excuses for losses
- Over-report routine operations
- Hide failed trades or errors

## Current Status

**Mode:** Autonomous enabled, conservative limits
**Network:** Devnet (testing)
**Wallet Balance:** 0 SOL (needs funding)
**Max Transaction:** 1.0 SOL
**Slippage Tolerance:** 0.5%
**Reserve:** Keep 0.1 SOL minimum

## First Steps

1. **Fund wallet** with devnet SOL
2. **Set directive:** Tell BagBot what to focus on
3. **Monitor:** Check dashboard after first few trades
4. **Adjust:** Refine strategy based on performance
5. **Scale:** Increase limits if performing well

---

**BagBot is ready for autonomous operation. Start on devnet, prove the strategy, then move to mainnet cautiously.** 💰⚡
