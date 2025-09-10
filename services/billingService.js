const databaseService = require('./databaseService');
const paystackService = require('./paystackService');
const escrowService = require('./escrowService');
const securityService = require('./securityService');
const { sendNotification } = require('../websocket/handlers');

class BillingService {
  constructor() {
    this.subscriptionTypes = {
      BASIC: {
        name: 'Basic Plan',
        price: 29.99,
        currency: 'USD',
        interval: 'monthly',
        features: ['basic_signals', 'market_data', 'portfolio_tracking'],
        limits: {
          signals_per_day: 10,
          portfolio_size: 5,
          api_calls_per_hour: 100
        }
      },
      PROFESSIONAL: {
        name: 'Professional Plan',
        price: 79.99,
        currency: 'USD',
        interval: 'monthly',
        features: ['advanced_signals', 'market_data', 'portfolio_tracking', 'ea_access', 'priority_support'],
        limits: {
          signals_per_day: 50,
          portfolio_size: 20,
          api_calls_per_hour: 500,
          ea_subscriptions: 3
        }
      },
      ENTERPRISE: {
        name: 'Enterprise Plan',
        price: 199.99,
        currency: 'USD',
        interval: 'monthly',
        features: ['premium_signals', 'market_data', 'portfolio_tracking', 'unlimited_ea_access', 'hft_access', 'dedicated_support'],
        limits: {
          signals_per_day: -1, // unlimited
          portfolio_size: -1, // unlimited
          api_calls_per_hour: 2000,
          ea_subscriptions: -1, // unlimited
          hft_rentals: 2
        }
      }
    };

    this.billingIntervals = {
      monthly: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
      quarterly: 90 * 24 * 60 * 60 * 1000, // 90 days in milliseconds
      yearly: 365 * 24 * 60 * 60 * 1000 // 365 days in milliseconds
    };
  }

  // ==================== SUBSCRIPTION CREATION ====================

  async createSubscription(userId, subscriptionData) {
    try {
      const {
        subscriptionType,
        productId,
        productType, // 'ea' or 'hft'
        interval = 'monthly',
        paymentMethod = 'paystack',
        metadata = {}
      } = subscriptionData;

      // Validate user
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Validate subscription type
      if (!this.subscriptionTypes[subscriptionType]) {
        throw new Error('Invalid subscription type');
      }

      // Get product details
      let product;
      if (productType === 'ea') {
        product = await EA.findById(productId);
      } else if (productType === 'hft') {
        product = await HFTBot.findById(productId);
      } else {
        throw new Error('Invalid product type');
      }

      if (!product) {
        throw new Error('Product not found');
      }

      // Calculate pricing
      const planDetails = this.subscriptionTypes[subscriptionType];
      const basePrice = planDetails.price;
      const productPrice = product.pricing?.price || 0;
      const totalPrice = basePrice + productPrice;

      // Create Paystack plan if needed
      let paystackPlanId = null;
      if (paymentMethod === 'paystack') {
        const planData = {
          name: `${planDetails.name} - ${product.name}`,
          interval: interval,
          amount: totalPrice,
          currency: planDetails.currency,
          description: `Subscription for ${product.name} - ${planDetails.name}`
        };

        const planResponse = await paystackService.createPlan(planData);
        paystackPlanId = planResponse.data.plan_code;
      }

      // Create subscription record
      const subscription = new Subscription({
        user: userId,
        subscriptionType: subscriptionType,
        product: productId,
        productType: productType,
        price: totalPrice,
        currency: planDetails.currency,
        interval: interval,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: paymentMethod,
        paystackPlanId: paystackPlanId,
        startDate: new Date(),
        endDate: new Date(Date.now() + this.billingIntervals[interval]),
        features: planDetails.features,
        limits: planDetails.limits,
        metadata: {
          ...metadata,
          platform: 'smart-algos',
          created_at: new Date().toISOString()
        }
      });

      await subscription.save();

      // Create escrow if required
      if (productType === 'ea' && product.requiresEscrow) {
        await escrowService.createEscrow(subscription._id, {
          walletAddress: user.walletAddress,
          userAgent: metadata.userAgent,
          ipAddress: metadata.ipAddress
        }, {
          walletAddress: product.creator.walletAddress
        });
      }

      // Send notification
      await this.sendSubscriptionNotification(user, subscription, 'created');

      return subscription;
    } catch (error) {
      console.error('Create subscription error:', error);
      throw new Error(`Failed to create subscription: ${error.message}`);
    }
  }

  // ==================== PAYMENT PROCESSING ====================

  async processPayment(subscriptionId, paymentData) {
    try {
      const subscription = await Subscription.findById(subscriptionId)
        .populate('user')
        .populate('product');

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      if (subscription.status !== 'pending') {
        throw new Error('Subscription is not in pending status');
      }

      const { paymentMethod, paymentDetails } = paymentData;

      let paymentResult;
      if (paymentMethod === 'paystack') {
        paymentResult = await this.processPaystackPayment(subscription, paymentDetails);
      } else {
        throw new Error('Unsupported payment method');
      }

      if (paymentResult.success) {
        // Update subscription status
        subscription.status = 'active';
        subscription.paymentStatus = 'paid';
        subscription.paymentReference = paymentResult.reference;
        subscription.paymentDate = new Date();
        await subscription.save();

        // Update user subscription
        const user = subscription.user;
        user.subscription = {
          type: subscription.subscriptionType,
          status: 'active',
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          features: subscription.features,
          limits: subscription.limits
        };
        await user.save();

        // Send notification
        await this.sendSubscriptionNotification(user, subscription, 'activated');

        return {
          success: true,
          subscription: subscription,
          payment: paymentResult
        };
      } else {
        throw new Error('Payment processing failed');
      }
    } catch (error) {
      console.error('Process payment error:', error);
      throw new Error(`Failed to process payment: ${error.message}`);
    }
  }

  async processPaystackPayment(subscription, paymentDetails) {
    try {
      const { email, callback_url } = paymentDetails;
      
      const transactionData = {
        email: email || subscription.user.email,
        amount: subscription.price,
        currency: subscription.currency,
        reference: paystackService.generateReference('SUB'),
        callback_url: callback_url,
        metadata: {
          subscriptionId: subscription._id.toString(),
          userId: subscription.user._id.toString(),
          subscriptionType: subscription.subscriptionType,
          productType: subscription.productType
        }
      };

      const result = await paystackService.initializeTransaction(transactionData);
      
      return {
        success: true,
        reference: result.data.reference,
        authorizationUrl: result.data.authorization_url,
        accessCode: result.data.access_code
      };
    } catch (error) {
      console.error('Process Paystack payment error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ==================== SUBSCRIPTION MANAGEMENT ====================

  async activateSubscription(subscriptionId) {
    try {
      const subscription = await Subscription.findById(subscriptionId)
        .populate('user')
        .populate('product');

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      subscription.status = 'active';
      subscription.activatedAt = new Date();
      await subscription.save();

      // Update user subscription
      const user = subscription.user;
      user.subscription = {
        type: subscription.subscriptionType,
        status: 'active',
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        features: subscription.features,
        limits: subscription.limits
      };
      await user.save();

      // Send notification
      await this.sendSubscriptionNotification(user, subscription, 'activated');

      return subscription;
    } catch (error) {
      console.error('Activate subscription error:', error);
      throw new Error(`Failed to activate subscription: ${error.message}`);
    }
  }

  async cancelSubscription(subscriptionId, reason = 'User request') {
    try {
      const subscription = await Subscription.findById(subscriptionId)
        .populate('user')
        .populate('product');

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      subscription.status = 'cancelled';
      subscription.cancelledAt = new Date();
      subscription.cancellationReason = reason;
      await subscription.save();

      // Update user subscription
      const user = subscription.user;
      user.subscription = {
        type: 'free',
        status: 'cancelled',
        startDate: null,
        endDate: null,
        features: [],
        limits: {}
      };
      await user.save();

      // Cancel Paystack subscription if exists
      if (subscription.paystackSubscriptionId) {
        try {
          await paystackService.disableSubscription(subscription.paystackSubscriptionId);
        } catch (error) {
          console.error('Failed to cancel Paystack subscription:', error);
        }
      }

      // Send notification
      await this.sendSubscriptionNotification(user, subscription, 'cancelled');

      return subscription;
    } catch (error) {
      console.error('Cancel subscription error:', error);
      throw new Error(`Failed to cancel subscription: ${error.message}`);
    }
  }

  async renewSubscription(subscriptionId) {
    try {
      const subscription = await Subscription.findById(subscriptionId)
        .populate('user')
        .populate('product');

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      if (subscription.status !== 'active') {
        throw new Error('Only active subscriptions can be renewed');
      }

      // Calculate new end date
      const newEndDate = new Date(subscription.endDate.getTime() + this.billingIntervals[subscription.interval]);
      
      subscription.endDate = newEndDate;
      subscription.renewedAt = new Date();
      subscription.renewalCount = (subscription.renewalCount || 0) + 1;
      await subscription.save();

      // Update user subscription end date
      const user = subscription.user;
      user.subscription.endDate = newEndDate;
      await user.save();

      // Send notification
      await this.sendSubscriptionNotification(user, subscription, 'renewed');

      return subscription;
    } catch (error) {
      console.error('Renew subscription error:', error);
      throw new Error(`Failed to renew subscription: ${error.message}`);
    }
  }

  // ==================== BILLING AUTOMATION ====================

  async processRecurringBilling() {
    try {
      // Find subscriptions that need renewal
      const expiringSubscriptions = await Subscription.find({
        status: 'active',
        endDate: { $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }, // Expiring in 7 days
        autoRenew: true
      }).populate('user').populate('product');

      for (const subscription of expiringSubscriptions) {
        try {
          await this.processSubscriptionRenewal(subscription);
        } catch (error) {
          console.error(`Failed to process renewal for subscription ${subscription._id}:`, error);
        }
      }

      return {
        processed: expiringSubscriptions.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Process recurring billing error:', error);
      throw new Error(`Failed to process recurring billing: ${error.message}`);
    }
  }

  async processSubscriptionRenewal(subscription) {
    try {
      // Check if user has valid payment method
      const user = subscription.user;
      if (!user.paymentMethods || user.paymentMethods.length === 0) {
        // Send payment method reminder
        await this.sendSubscriptionNotification(user, subscription, 'payment_method_required');
        return;
      }

      // Process payment
      const paymentResult = await this.processPayment(subscription._id, {
        paymentMethod: subscription.paymentMethod,
        paymentDetails: {
          email: user.email,
          paymentMethodId: user.paymentMethods[0].id
        }
      });

      if (paymentResult.success) {
        await this.renewSubscription(subscription._id);
      } else {
        // Send payment failed notification
        await this.sendSubscriptionNotification(user, subscription, 'payment_failed');
      }
    } catch (error) {
      console.error('Process subscription renewal error:', error);
      throw error;
    }
  }

  // ==================== REFUND PROCESSING ====================

  async processRefund(subscriptionId, refundData) {
    try {
      const subscription = await Subscription.findById(subscriptionId)
        .populate('user')
        .populate('product');

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      const { amount, reason, type = 'full' } = refundData;

      let refundAmount = amount;
      if (type === 'full') {
        refundAmount = subscription.price;
      }

      // Process refund with Paystack
      const refundResult = await paystackService.createRefund({
        transaction: subscription.paymentReference,
        amount: refundAmount,
        currency: subscription.currency,
        customer_note: reason,
        merchant_note: `Refund for subscription ${subscription._id}`
      });

      if (refundResult.success) {
        // Update subscription status
        subscription.status = 'refunded';
        subscription.refundedAt = new Date();
        subscription.refundAmount = refundAmount;
        subscription.refundReason = reason;
        await subscription.save();

        // Update user subscription
        const user = subscription.user;
        user.subscription = {
          type: 'free',
          status: 'refunded',
          startDate: null,
          endDate: null,
          features: [],
          limits: {}
        };
        await user.save();

        // Send notification
        await this.sendSubscriptionNotification(user, subscription, 'refunded');

        return {
          success: true,
          refund: refundResult.data,
          subscription: subscription
        };
      } else {
        throw new Error('Refund processing failed');
      }
    } catch (error) {
      console.error('Process refund error:', error);
      throw new Error(`Failed to process refund: ${error.message}`);
    }
  }

  // ==================== SUBSCRIPTION ANALYTICS ====================

  async getSubscriptionAnalytics(options = {}) {
    try {
      const {
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate = new Date(),
        subscriptionType = null,
        status = null
      } = options;

      const filter = {
        createdAt: { $gte: startDate, $lte: endDate }
      };

      if (subscriptionType) filter.subscriptionType = subscriptionType;
      if (status) filter.status = status;

      const subscriptions = await Subscription.find(filter);
      
      const analytics = {
        total: subscriptions.length,
        byType: {},
        byStatus: {},
        revenue: {
          total: 0,
          byType: {},
          byStatus: {}
        },
        trends: {
          daily: {},
          weekly: {},
          monthly: {}
        }
      };

      // Calculate analytics
      subscriptions.forEach(sub => {
        // By type
        analytics.byType[sub.subscriptionType] = (analytics.byType[sub.subscriptionType] || 0) + 1;
        
        // By status
        analytics.byStatus[sub.status] = (analytics.byStatus[sub.status] || 0) + 1;
        
        // Revenue
        analytics.revenue.total += sub.price;
        analytics.revenue.byType[sub.subscriptionType] = (analytics.revenue.byType[sub.subscriptionType] || 0) + sub.price;
        analytics.revenue.byStatus[sub.status] = (analytics.revenue.byStatus[sub.status] || 0) + sub.price;
      });

      return analytics;
    } catch (error) {
      console.error('Get subscription analytics error:', error);
      throw new Error(`Failed to get subscription analytics: ${error.message}`);
    }
  }

  // ==================== NOTIFICATION SYSTEM ====================

  async sendSubscriptionNotification(user, subscription, event) {
    try {
      const notifications = {
        created: {
          title: 'Subscription Created',
          message: `Your ${subscription.subscriptionType} subscription has been created and is ready for payment.`,
          type: 'info'
        },
        activated: {
          title: 'Subscription Activated',
          message: `Your ${subscription.subscriptionType} subscription is now active. Enjoy your premium features!`,
          type: 'success'
        },
        cancelled: {
          title: 'Subscription Cancelled',
          message: `Your ${subscription.subscriptionType} subscription has been cancelled.`,
          type: 'warning'
        },
        renewed: {
          title: 'Subscription Renewed',
          message: `Your ${subscription.subscriptionType} subscription has been renewed successfully.`,
          type: 'success'
        },
        payment_failed: {
          title: 'Payment Failed',
          message: `Payment for your ${subscription.subscriptionType} subscription failed. Please update your payment method.`,
          type: 'error'
        },
        payment_method_required: {
          title: 'Payment Method Required',
          message: `Your ${subscription.subscriptionType} subscription is expiring soon. Please add a payment method.`,
          type: 'warning'
        },
        refunded: {
          title: 'Subscription Refunded',
          message: `Your ${subscription.subscriptionType} subscription has been refunded.`,
          type: 'info'
        }
      };

      const notification = notifications[event];
      if (!notification) return;

      await sendNotification(user._id, {
        ...notification,
        subscriptionId: subscription._id,
        subscriptionType: subscription.subscriptionType,
        amount: subscription.price,
        currency: subscription.currency
      });
    } catch (error) {
      console.error('Send subscription notification error:', error);
    }
  }

  // ==================== UTILITY METHODS ====================

  async getUserSubscriptions(userId, options = {}) {
    try {
      const { status, type, page = 1, limit = 20 } = options;
      
      const filter = { user: userId };
      if (status) filter.status = status;
      if (type) filter.subscriptionType = type;

      const skip = (page - 1) * limit;
      const subscriptions = await Subscription.find(filter)
        .populate('product', 'name description')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Subscription.countDocuments(filter);

      return {
        subscriptions,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      };
    } catch (error) {
      console.error('Get user subscriptions error:', error);
      throw new Error(`Failed to get user subscriptions: ${error.message}`);
    }
  }

  async getSubscriptionDetails(subscriptionId) {
    try {
      const subscription = await Subscription.findById(subscriptionId)
        .populate('user', 'firstName lastName email')
        .populate('product', 'name description pricing');

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      return subscription;
    } catch (error) {
      console.error('Get subscription details error:', error);
      throw new Error(`Failed to get subscription details: ${error.message}`);
    }
  }

  getAvailablePlans() {
    return Object.entries(this.subscriptionTypes).map(([key, plan]) => ({
      type: key,
      ...plan
    }));
  }

  calculateProratedAmount(subscription, newPlanType) {
    try {
      const currentPlan = this.subscriptionTypes[subscription.subscriptionType];
      const newPlan = this.subscriptionTypes[newPlanType];
      
      if (!currentPlan || !newPlan) {
        throw new Error('Invalid plan type');
      }

      const timeRemaining = subscription.endDate.getTime() - Date.now();
      const totalTime = this.billingIntervals[subscription.interval];
      const remainingRatio = timeRemaining / totalTime;

      const currentValue = currentPlan.price * remainingRatio;
      const newValue = newPlan.price * remainingRatio;

      return {
        currentValue,
        newValue,
        difference: newValue - currentValue,
        proratedAmount: Math.abs(newValue - currentValue)
      };
    } catch (error) {
      console.error('Calculate prorated amount error:', error);
      throw new Error(`Failed to calculate prorated amount: ${error.message}`);
    }
  }
}

// Create singleton instance
const billingService = new BillingService();

module.exports = billingService;
