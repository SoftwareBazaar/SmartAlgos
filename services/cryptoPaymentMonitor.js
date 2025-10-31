/**
 * Crypto Payment Monitor
 * Background service to automatically check pending crypto payments
 * Runs every 2 minutes to verify pending transactions on blockchain
 */

const nodeCron = require('node-cron');
const databaseService = require('./databaseService');
const blockchainMonitor = require('./blockchainMonitorService');
const logger = require('./logger');

class CryptoPaymentMonitor {
  constructor() {
    this.isRunning = false;
    this.interval = null;
    this.checkInterval = 2 * 60 * 1000; // Check every 2 minutes
  }

  start() {
    if (this.isRunning) {
      logger.warn('[Crypto Payment Monitor] Already running');
      return;
    }

    if (!blockchainMonitor) {
      logger.warn('[Crypto Payment Monitor] Blockchain monitor not available - monitor disabled');
      return;
    }

    // Check if API keys are configured
    if (!blockchainMonitor.hasBlockCypherKey() && !process.env.ETHERSCAN_API_KEY) {
      logger.warn('[Crypto Payment Monitor] No blockchain API keys configured - monitor disabled');
      logger.warn('[Crypto Payment Monitor] Add BLOCKCYPHER_API_KEY or ETHERSCAN_API_KEY to enable automatic verification');
      return;
    }

    this.isRunning = true;
    logger.info('[Crypto Payment Monitor] ✅ Started - checking pending payments every 2 minutes');

    // Run immediately on start
    this.checkPendingPayments();

    // Then run every 2 minutes
    this.interval = setInterval(() => {
      this.checkPendingPayments();
    }, this.checkInterval);

    // Also use cron for more reliable scheduling (every 2 minutes)
    nodeCron.schedule('*/2 * * * *', () => {
      this.checkPendingPayments();
    });
  }

  stop() {
    if (!this.isRunning) return;

    this.isRunning = false;
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    logger.info('[Crypto Payment Monitor] Stopped');
  }

  async checkPendingPayments() {
    try {
      const supabase = databaseService.getClient();
      if (!supabase) {
        logger.warn('[Crypto Payment Monitor] Database not available');
        return;
      }

      // Get all pending payments that haven't expired
      const now = new Date().toISOString();
      const { data: pendingPayments, error } = await supabase
        .from('crypto_payments')
        .select('*')
        .eq('status', 'pending')
        .gt('expires_at', now)
        .order('created_at', { ascending: true })
        .limit(50); // Check up to 50 at a time

      if (error) {
        logger.error('[Crypto Payment Monitor] Database error:', error);
        return;
      }

      if (!pendingPayments || pendingPayments.length === 0) {
        return; // No pending payments
      }

      logger.info(`[Crypto Payment Monitor] Checking ${pendingPayments.length} pending payments...`);

      for (const payment of pendingPayments) {
        try {
          await this.verifyPayment(payment);
          
          // Small delay between checks to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          logger.error(`[Crypto Payment Monitor] Error verifying payment ${payment.id}:`, error);
        }
      }
    } catch (error) {
      logger.error('[Crypto Payment Monitor] Check error:', error);
    }
  }

  async verifyPayment(payment) {
    try {
      const verification = await blockchainMonitor.verifyTransaction(payment);

      if (verification.confirmed) {
        // Payment confirmed! Update status
        const supabase = databaseService.getClient();
        
        await supabase
          .from('crypto_payments')
          .update({
            status: 'confirmed',
            tx_hash: verification.txHash,
            confirmations: verification.confirmations || 0,
            confirmed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', payment.id);

        // Process the confirmed payment (activate subscription, etc.)
        const { processConfirmedPayment } = require('../routes/cryptoPayments');
        await processConfirmedPayment(payment);

        logger.info(`[Crypto Payment Monitor] ✅ Payment confirmed: ${payment.id}`, {
          txHash: verification.txHash,
          confirmations: verification.confirmations
        });
      } else if (verification.txHash && !payment.tx_hash) {
        // Transaction found but not confirmed yet - update tx_hash
        const supabase = databaseService.getClient();
        
        await supabase
          .from('crypto_payments')
          .update({
            tx_hash: verification.txHash,
            confirmations: verification.confirmations || 0,
            updated_at: new Date().toISOString()
          })
          .eq('id', payment.id);

        logger.info(`[Crypto Payment Monitor] Transaction found for payment ${payment.id}`, {
          txHash: verification.txHash,
          confirmations: verification.confirmations
        });
      }
    } catch (error) {
      logger.error(`[Crypto Payment Monitor] Verification error for payment ${payment.id}:`, error);
    }
  }
}

module.exports = new CryptoPaymentMonitor();

