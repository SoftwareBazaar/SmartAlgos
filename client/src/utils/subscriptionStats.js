/**
 * Centralized subscription statistics utility
 * Ensures consistent calculation of subscription counts across the app
 */

/**
 * Calculate subscription statistics from a list of subscriptions
 * @param {Array} subscriptions - Array of subscription objects
 * @returns {Object} Statistics object
 */
export const calculateSubscriptionStats = (subscriptions = []) => {
  const stats = {
    total: subscriptions.length,
    active: 0,
    pending: 0,
    cancelled: 0,
    expired: 0,
    byType: {
      weekly: 0,
      monthly: 0,
      quarterly: 0,
      yearly: 0
    },
    monthlyCost: 0,
    totalCost: 0
  };

  subscriptions.forEach(sub => {
    // Count by status
    const status = (sub.status || '').toLowerCase();
    if (status === 'active') stats.active++;
    else if (status === 'pending') stats.pending++;
    else if (status === 'cancelled') stats.cancelled++;
    else if (status === 'expired' || (sub.endDate && new Date(sub.endDate) < new Date())) {
      stats.expired++;
    }

    // Count by subscription type
    const subType = (sub.subscriptionType || sub.interval || '').toLowerCase();
    if (subType.includes('week')) stats.byType.weekly++;
    else if (subType.includes('month')) stats.byType.monthly++;
    else if (subType.includes('quarter')) stats.byType.quarterly++;
    else if (subType.includes('year')) stats.byType.yearly++;

    // Calculate costs (only for active subscriptions)
    if (status === 'active' && sub.price) {
      const price = parseFloat(sub.price) || 0;
      stats.totalCost += price;

      // Convert to monthly equivalent for consistent display
      if (subType.includes('week')) {
        stats.monthlyCost += price * 4; // 4 weeks in a month
      } else if (subType.includes('month')) {
        stats.monthlyCost += price;
      } else if (subType.includes('quarter')) {
        stats.monthlyCost += price / 3; // 3 months in quarter
      } else if (subType.includes('year')) {
        stats.monthlyCost += price / 12; // 12 months in year
      }
    }
  });

  return stats;
};

/**
 * Filter subscriptions by status
 * @param {Array} subscriptions - Array of subscription objects
 * @param {string} status - Status to filter by ('active', 'pending', 'cancelled', 'expired', 'all')
 * @returns {Array} Filtered subscriptions
 */
export const filterSubscriptionsByStatus = (subscriptions = [], status = 'all') => {
  if (status === 'all' || !status) return subscriptions;

  const statusLower = status.toLowerCase();
  const now = new Date();

  return subscriptions.filter(sub => {
    const subStatus = (sub.status || '').toLowerCase();
    
    if (statusLower === 'active') {
      return subStatus === 'active' && (!sub.endDate || new Date(sub.endDate) > now);
    } else if (statusLower === 'pending') {
      return subStatus === 'pending';
    } else if (statusLower === 'cancelled') {
      return subStatus === 'cancelled';
    } else if (statusLower === 'expired') {
      return subStatus === 'expired' || (sub.endDate && new Date(sub.endDate) < now);
    }
    
    return subStatus === statusLower;
  });
};

