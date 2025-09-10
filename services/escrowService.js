const databaseService = require('./databaseService');
const blockchainService = require('./blockchainService');
const securityService = require('./securityService');
const { sendNotification } = require('../websocket/handlers');

class EscrowService {
  constructor() {
    this.autoReleaseInterval = null;
    this.startAutoReleaseMonitor();
  }

  // ==================== ESCROW CREATION ====================

  async createEscrow(subscriptionId, userData, creatorData) {
    try {
      const subscription = await Subscription.findById(subscriptionId)
        .populate('product')
        .populate('user');

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      // Create multisig wallet
      const owners = [userData.walletAddress, creatorData.walletAddress];
      const threshold = 2; // Require 2 signatures for release

      const multisigWallet = await blockchainService.createMultisigWallet(
        owners,
        threshold,
        'ethereum', // Default network
        'mainnet'
      );

      // Create escrow contract
      const escrowContract = await blockchainService.createEscrowContract({
        buyer: userData.walletAddress,
        seller: creatorData.walletAddress,
        amount: subscription.price,
        currency: subscription.currency,
        network: 'ethereum',
        chain: 'mainnet',
        releaseConditions: {
          type: 'time_based',
          timeDelay: 24, // 24 hours
          performanceThreshold: 0
        },
        expirationTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      });

      // Create escrow record
      const escrowData = {
        subscription: subscriptionId,
        user: subscription.user._id,
        ea: subscription.product._id,
        creator: subscription.product.creator,
        amount: subscription.price,
        currency: subscription.currency,
        blockchain: 'ethereum',
        network: 'mainnet',
        multisigAddress: multisigWallet.address,
        transactionHash: '', // Will be set when funded
        requiredSignatures: threshold,
        totalSignatures: 0,
        status: 'pending',
        state: 'created',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        releaseConditions: {
          type: 'time_based',
          timeDelay: 24,
          performanceThreshold: 0,
          autoRelease: true
        },
        fees: {
          platformFee: subscription.price * 0.05, // 5% platform fee
          creatorFee: subscription.price * 0.90, // 90% to creator
          networkFee: 0, // Will be calculated during funding
          totalFees: subscription.price * 0.05
        },
        metadata: {
          userAgent: userData.userAgent,
          ipAddress: userData.ipAddress,
          version: '1.0.0'
        }
      };

      const escrow = new Escrow(escrowData);
      await escrow.save();

      // Update subscription with escrow reference
      subscription.escrow = escrow._id;
      subscription.escrowStatus = 'pending';
      await subscription.save();

      // Send notifications
      await this.sendEscrowNotifications(escrow, 'created');

      return escrow;
    } catch (error) {
      console.error('Create escrow error:', error);
      throw new Error('Failed to create escrow');
    }
  }

  // ==================== ESCROW FUNDING ====================

  async fundEscrow(escrowId, fundingData) {
    try {
      const escrow = await databaseService.getEscrowTransactionById(escrowId)
        .populate('user')
        .populate('creator');

      if (!escrow) {
        throw new Error('Escrow not found');
      }

      if (escrow.status !== 'pending') {
        throw new Error('Escrow cannot be funded in current state');
      }

      // Fund the escrow contract
      const fundingResult = await blockchainService.fundEscrow(
        escrow.multisigAddress,
        escrow.amount,
        fundingData.fromAddress,
        fundingData.privateKey,
        escrow.blockchain,
        escrow.network
      );

      // Update escrow with funding information
      await escrow.fundEscrow(
        fundingResult.transactionHash,
        fundingResult.blockNumber,
        fundingResult.gasUsed,
        fundingResult.gasPrice
      );

      // Update subscription status
      const subscription = await Subscription.findById(escrow.subscription);
      if (subscription) {
        subscription.escrowStatus = 'funded';
        subscription.paymentStatus = 'paid';
        await subscription.save();
      }

      // Send notifications
      await this.sendEscrowNotifications(escrow, 'funded');

      return escrow;
    } catch (error) {
      console.error('Fund escrow error:', error);
      throw new Error('Failed to fund escrow');
    }
  }

  // ==================== ESCROW LOCKING ====================

  async lockEscrow(escrowId, creatorId) {
    try {
      const escrow = await databaseService.getEscrowTransactionById(escrowId);

      if (!escrow) {
        throw new Error('Escrow not found');
      }

      if (escrow.creator.toString() !== creatorId.toString()) {
        throw new Error('Only the creator can lock the escrow');
      }

      if (escrow.status !== 'funded') {
        throw new Error('Escrow must be funded before locking');
      }

      await escrow.lockEscrow();

      // Send notifications
      await this.sendEscrowNotifications(escrow, 'locked');

      return escrow;
    } catch (error) {
      console.error('Lock escrow error:', error);
      throw new Error('Failed to lock escrow');
    }
  }

  // ==================== SIGNATURE MANAGEMENT ====================

  async addSignature(escrowId, signerId, signature) {
    try {
      const escrow = await databaseService.getEscrowTransactionById(escrowId);

      if (!escrow) {
        throw new Error('Escrow not found');
      }

      // Verify signer has permission
      if (escrow.user.toString() !== signerId.toString() && 
          escrow.creator.toString() !== signerId.toString()) {
        throw new Error('Unauthorized to sign this escrow');
      }

      if (escrow.status !== 'active') {
        throw new Error('Escrow must be active to add signatures');
      }

      await escrow.addSignature(signerId, signature);

      // Check if enough signatures for release
      if (escrow.canRelease) {
        await this.unlockEscrow(escrowId);
      }

      // Send notifications
      await this.sendEscrowNotifications(escrow, 'signed');

      return escrow;
    } catch (error) {
      console.error('Add signature error:', error);
      throw new Error('Failed to add signature');
    }
  }

  // ==================== ESCROW RELEASE ====================

  async releaseEscrow(escrowId, releaseData) {
    try {
      const escrow = await databaseService.getEscrowTransactionById(escrowId)
        .populate('user')
        .populate('creator');

      if (!escrow) {
        throw new Error('Escrow not found');
      }

      if (!escrow.canRelease) {
        throw new Error('Escrow cannot be released yet');
      }

      // Get signatures for release
      const signatures = escrow.signatures.filter(sig => sig.approved);

      // Release funds from blockchain
      const releaseResult = await blockchainService.releaseEscrow(
        escrow.multisigAddress,
        escrow.creator.walletAddress,
        escrow.amount,
        signatures,
        escrow.blockchain,
        escrow.network
      );

      // Update escrow status
      await escrow.releaseEscrow(releaseResult.transactionHash);

      // Update subscription status
      const subscription = await Subscription.findById(escrow.subscription);
      if (subscription) {
        subscription.escrowStatus = 'released';
        subscription.status = 'active';
        await subscription.save();
      }

      // Send notifications
      await this.sendEscrowNotifications(escrow, 'released');

      return escrow;
    } catch (error) {
      console.error('Release escrow error:', error);
      throw new Error('Failed to release escrow');
    }
  }

  // ==================== ESCROW REFUND ====================

  async refundEscrow(escrowId, refundData) {
    try {
      const escrow = await databaseService.getEscrowTransactionById(escrowId)
        .populate('user')
        .populate('creator');

      if (!escrow) {
        throw new Error('Escrow not found');
      }

      // Get signatures for refund
      const signatures = escrow.signatures.filter(sig => sig.approved);

      // Refund funds from blockchain
      const refundResult = await blockchainService.refundEscrow(
        escrow.multisigAddress,
        escrow.user.walletAddress,
        escrow.amount,
        signatures,
        escrow.blockchain,
        escrow.network
      );

      // Update escrow status
      escrow.status = 'refunded';
      escrow.state = 'refunded';
      escrow.refundedAt = new Date();
      escrow.transactionHash = refundResult.transactionHash;
      await escrow.save();

      // Update subscription status
      const subscription = await Subscription.findById(escrow.subscription);
      if (subscription) {
        subscription.escrowStatus = 'refunded';
        subscription.status = 'refunded';
        await subscription.save();
      }

      // Send notifications
      await this.sendEscrowNotifications(escrow, 'refunded');

      return escrow;
    } catch (error) {
      console.error('Refund escrow error:', error);
      throw new Error('Failed to refund escrow');
    }
  }

  // ==================== DISPUTE MANAGEMENT ====================

  async initiateDispute(escrowId, disputeData) {
    try {
      const escrow = await databaseService.getEscrowTransactionById(escrowId);

      if (!escrow) {
        throw new Error('Escrow not found');
      }

      if (!escrow.canDispute) {
        throw new Error('Escrow cannot be disputed in current state');
      }

      await escrow.initiateDispute(
        disputeData.initiatedBy,
        disputeData.reason,
        disputeData.description
      );

      // Update subscription status
      const subscription = await Subscription.findById(escrow.subscription);
      if (subscription) {
        subscription.escrowStatus = 'disputed';
        await subscription.save();
      }

      // Send notifications
      await this.sendEscrowNotifications(escrow, 'disputed');

      return escrow;
    } catch (error) {
      console.error('Initiate dispute error:', error);
      throw new Error('Failed to initiate dispute');
    }
  }

  async resolveDispute(escrowId, resolutionData) {
    try {
      const escrow = await databaseService.getEscrowTransactionById(escrowId);

      if (!escrow) {
        throw new Error('Escrow not found');
      }

      if (escrow.status !== 'disputed') {
        throw new Error('No active dispute to resolve');
      }

      await escrow.resolveDispute(
        resolutionData.resolvedBy,
        resolutionData.resolution,
        resolutionData.resolutionNotes
      );

      // Execute resolution
      if (resolutionData.resolution === 'refund_full' || resolutionData.resolution === 'refund_partial') {
        await this.refundEscrow(escrowId, {});
      } else if (resolutionData.resolution === 'no_refund') {
        await this.releaseEscrow(escrowId, {});
      }

      // Send notifications
      await this.sendEscrowNotifications(escrow, 'resolved');

      return escrow;
    } catch (error) {
      console.error('Resolve dispute error:', error);
      throw new Error('Failed to resolve dispute');
    }
  }

  // ==================== PERFORMANCE TRACKING ====================

  async updatePerformance(escrowId, tradeData) {
    try {
      const escrow = await databaseService.getEscrowTransactionById(escrowId);

      if (!escrow) {
        throw new Error('Escrow not found');
      }

      await escrow.updatePerformance(tradeData);

      // Check if performance meets release conditions
      if (escrow.releaseConditions.type === 'performance_based' && escrow.canRelease) {
        await this.unlockEscrow(escrowId);
      }

      return escrow;
    } catch (error) {
      console.error('Update performance error:', error);
      throw new Error('Failed to update performance');
    }
  }

  // ==================== AUTO-RELEASE MONITORING ====================

  startAutoReleaseMonitor() {
    // Check for escrows that can be auto-released every hour
    this.autoReleaseInterval = setInterval(async () => {
      try {
        await this.checkAutoRelease();
      } catch (error) {
        console.error('Auto-release monitor error:', error);
      }
    }, 60 * 60 * 1000); // 1 hour
  }

  async checkAutoRelease() {
    try {
      const escrows = await databaseService.getEscrowTransactions({
        status: 'active',
        state: 'locked',
        'releaseConditions.autoRelease': true
      });

      for (const escrow of escrows) {
        if (escrow.canRelease) {
          try {
            await this.releaseEscrow(escrow._id, {});
            console.log(`Auto-released escrow ${escrow._id}`);
          } catch (error) {
            console.error(`Failed to auto-release escrow ${escrow._id}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Check auto-release error:', error);
    }
  }

  // ==================== NOTIFICATION SYSTEM ====================

  async sendEscrowNotifications(escrow, event) {
    try {
      const notifications = {
        created: {
          title: 'Escrow Created',
          message: 'Your escrow has been created and is ready for funding.',
          type: 'info'
        },
        funded: {
          title: 'Escrow Funded',
          message: 'Your escrow has been funded and is ready for activation.',
          type: 'success'
        },
        locked: {
          title: 'Escrow Locked',
          message: 'Your escrow has been locked and is now active.',
          type: 'info'
        },
        signed: {
          title: 'Escrow Signed',
          message: 'A signature has been added to your escrow.',
          type: 'info'
        },
        released: {
          title: 'Escrow Released',
          message: 'Your escrow has been released successfully.',
          type: 'success'
        },
        refunded: {
          title: 'Escrow Refunded',
          message: 'Your escrow has been refunded.',
          type: 'warning'
        },
        disputed: {
          title: 'Escrow Disputed',
          message: 'A dispute has been initiated for your escrow.',
          type: 'warning'
        },
        resolved: {
          title: 'Dispute Resolved',
          message: 'The dispute for your escrow has been resolved.',
          type: 'info'
        }
      };

      const notification = notifications[event];
      if (!notification) return;

      // Send to user
      await sendNotification(escrow.user, {
        ...notification,
        escrowId: escrow._id,
        amount: escrow.amount,
        currency: escrow.currency
      });

      // Send to creator
      await sendNotification(escrow.creator, {
        ...notification,
        escrowId: escrow._id,
        amount: escrow.amount,
        currency: escrow.currency
      });
    } catch (error) {
      console.error('Send escrow notifications error:', error);
    }
  }

  // ==================== UTILITY METHODS ====================

  async getEscrowStatus(escrowId) {
    try {
      const escrow = await databaseService.getEscrowTransactionById(escrowId)
        .populate('user', 'firstName lastName email')
        .populate('creator', 'firstName lastName email')
        .populate('subscription', 'subscriptionType price currency');

      if (!escrow) {
        throw new Error('Escrow not found');
      }

      return {
        escrow,
        canRelease: escrow.canRelease,
        canDispute: escrow.canDispute,
        timeRemaining: escrow.timeRemaining,
        signatures: {
          total: escrow.totalSignatures,
          required: escrow.requiredSignatures,
          remaining: escrow.requiredSignatures - escrow.totalSignatures
        }
      };
    } catch (error) {
      console.error('Get escrow status error:', error);
      throw new Error('Failed to get escrow status');
    }
  }

  async getExpiringEscrows(days = 7) {
    try {
      return await databaseService.getEscrowTransactions({
        expires_at: { $lte: new Date(Date.now() + days * 24 * 60 * 60 * 1000) }
      });
    } catch (error) {
      console.error('Get expiring escrows error:', error);
      throw new Error('Failed to get expiring escrows');
    }
  }

  async getDisputedEscrows() {
    try {
      return await databaseService.getEscrowTransactions({
        dispute_initiated: true
      });
    } catch (error) {
      console.error('Get disputed escrows error:', error);
      throw new Error('Failed to get disputed escrows');
    }
  }

  // ==================== CLEANUP ====================

  stopAutoReleaseMonitor() {
    if (this.autoReleaseInterval) {
      clearInterval(this.autoReleaseInterval);
      this.autoReleaseInterval = null;
    }
  }
}

// Create singleton instance
const escrowService = new EscrowService();

module.exports = escrowService;
