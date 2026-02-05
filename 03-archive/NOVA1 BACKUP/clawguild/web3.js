/**
 * Web3 Utilities for ClawGuild
 * Handles USDC transactions on Base L2
 */

const { ethers } = require('ethers');

// USDC Contract ABI (minimal for transfers)
const USDC_ABI = [
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)"
];

// ERC20 minimal ABI
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)"
];

class Web3Provider {
  constructor() {
    this.rpcUrl = process.env.BASE_RPC_URL || 'https://mainnet.base.org';
    this.usdcContract = process.env.USDC_CONTRACT || '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
    this.treasuryKey = process.env.TREASURY_PRIVATE_KEY;
    this.treasuryAddress = process.env.TREASURY_ADDRESS;
    
    this.provider = null;
    this.signer = null;
    this.usdc = null;
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return true;
    
    try {
      this.provider = new ethers.JsonRpcProvider(this.rpcUrl);
      
      if (this.treasuryKey) {
        this.signer = new ethers.Wallet(this.treasuryKey, this.provider);
        this.usdc = new ethers.Contract(this.usdcContract, USDC_ABI, this.signer);
      } else {
        // Read-only mode
        this.usdc = new ethers.Contract(this.usdcContract, USDC_ABI, this.provider);
      }
      
      this.initialized = true;
      console.log('✅ Web3 provider initialized');
      return true;
    } catch (error) {
      console.error('❌ Web3 initialization failed:', error.message);
      return false;
    }
  }

  /**
   * Check if Web3 is properly configured
   */
  isConfigured() {
    return !!(this.treasuryKey && this.treasuryAddress);
  }

  /**
   * Get USDC balance of an address
   */
  async getBalance(address) {
    await this.init();
    try {
      const balance = await this.usdc.balanceOf(address);
      const decimals = await this.usdc.decimals();
      return ethers.formatUnits(balance, decimals);
    } catch (error) {
      console.error('Failed to get balance:', error);
      return '0';
    }
  }

  /**
   * Get treasury balance
   */
  async getTreasuryBalance() {
    if (!this.treasuryAddress) return '0';
    return this.getBalance(this.treasuryAddress);
  }

  /**
   * Send USDC to a recipient
   * @param {string} to - Recipient address
   * @param {number} amount - Amount in USDC (e.g., 10.5)
   * @returns {Promise<{success: boolean, txHash: string, error: string}>}
   */
  async sendUSDC(to, amount) {
    await this.init();
    
    if (!this.signer) {
      return {
        success: false,
        txHash: null,
        error: 'Treasury wallet not configured'
      };
    }

    try {
      const decimals = await this.usdc.decimals();
      const amountWei = ethers.parseUnits(amount.toString(), decimals);
      
      // Check treasury balance
      const treasuryBalance = await this.usdc.balanceOf(this.treasuryAddress);
      if (treasuryBalance < amountWei) {
        return {
          success: false,
          txHash: null,
          error: 'Insufficient treasury balance'
        };
      }

      // Send transaction
      const tx = await this.usdc.transfer(to, amountWei);
      console.log(`🔄 Transaction sent: ${tx.hash}`);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        console.log(`✅ Transaction confirmed: ${tx.hash}`);
        return {
          success: true,
          txHash: tx.hash,
          error: null
        };
      } else {
        return {
          success: false,
          txHash: tx.hash,
          error: 'Transaction failed on-chain'
        };
      }
    } catch (error) {
      console.error('❌ Transaction failed:', error);
      return {
        success: false,
        txHash: null,
        error: error.message
      };
    }
  }

  /**
   * Validate Ethereum address
   */
  isValidAddress(address) {
    try {
      return ethers.isAddress(address);
    } catch {
      return false;
    }
  }

  /**
   * Get transaction URL on BaseScan
   */
  getExplorerUrl(txHash) {
    return `https://basescan.org/tx/${txHash}`;
  }

  /**
   * Get address URL on BaseScan
   */
  getAddressUrl(address) {
    return `https://basescan.org/address/${address}`;
  }
}

// Singleton instance
const web3Provider = new Web3Provider();

module.exports = { web3Provider, Web3Provider };
