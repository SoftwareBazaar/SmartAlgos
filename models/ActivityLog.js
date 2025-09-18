/**
 * Activity Log Model
 * Tracks all admin and user activities for audit purposes
 */

const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: [
            // User actions
            'user_login', 'user_logout', 'user_register', 'user_updated', 'user_deleted',
            'password_changed', 'email_verified', 'profile_updated',
            
            // Content actions
            'content_created', 'content_updated', 'content_deleted', 'content_published',
            'content_archived', 'comment_added', 'comment_approved', 'comment_deleted',
            
            // EA actions
            'ea_created', 'ea_updated', 'ea_deleted', 'ea_approved', 'ea_rejected',
            'ea_featured', 'ea_unfeatured', 'ea_subscribed', 'ea_unsubscribed',
            
            // HFT Bot actions
            'hft_created', 'hft_updated', 'hft_deleted', 'hft_started', 'hft_stopped',
            'hft_configured', 'hft_subscribed', 'hft_unsubscribed',
            
            // Signal actions
            'signal_created', 'signal_updated', 'signal_deleted', 'signal_executed',
            'signal_closed', 'signal_followed', 'signal_unfollowed',
            
            // Subscription actions
            'subscription_created', 'subscription_updated', 'subscription_cancelled',
            'subscription_renewed', 'subscription_expired', 'payment_processed',
            'payment_failed', 'refund_processed',
            
            // Admin actions
            'settings_updated', 'backup_created', 'backup_restored', 'system_maintenance',
            'user_role_changed', 'bulk_operation', 'data_export', 'data_import',
            
            // Security actions
            'login_failed', 'account_locked', 'account_unlocked', 'suspicious_activity',
            'security_alert', 'api_key_generated', 'api_key_revoked',
            
            // System actions
            'system_startup', 'system_shutdown', 'database_backup', 'database_restore',
            'cache_cleared', 'logs_rotated', 'update_applied'
        ]
    },
    details: {
        type: String,
        required: true,
        maxlength: 1000
    },
    targetType: {
        type: String,
        enum: ['User', 'Content', 'EA', 'HFTBot', 'TradingSignal', 'Subscription', 'System'],
        default: null
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    ipAddress: {
        type: String,
        validate: {
            validator: function(v) {
                if (!v) return true;
                // IPv4 or IPv6 validation
                const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
                const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
                return ipv4Regex.test(v) || ipv6Regex.test(v);
            },
            message: 'Invalid IP address format'
        }
    },
    userAgent: {
        type: String,
        maxlength: 500
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'low'
    },
    category: {
        type: String,
        enum: ['authentication', 'authorization', 'content', 'trading', 'financial', 'system', 'security'],
        default: 'system'
    },
    success: {
        type: Boolean,
        default: true
    },
    errorMessage: {
        type: String,
        default: null
    },
    duration: {
        type: Number, // Duration in milliseconds
        default: null
    },
    sessionId: {
        type: String,
        default: null
    },
    deviceInfo: {
        type: {
            type: String,
            enum: ['desktop', 'mobile', 'tablet', 'api', 'system'],
            default: 'desktop'
        },
        os: String,
        browser: String,
        version: String
    },
    location: {
        country: String,
        region: String,
        city: String,
        timezone: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    isSystemGenerated: {
        type: Boolean,
        default: false
    },
    parentActivity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ActivityLog',
        default: null
    },
    childActivities: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ActivityLog'
    }],
    archived: {
        type: Boolean,
        default: false
    },
    archivedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });
activityLogSchema.index({ targetType: 1, targetId: 1 });
activityLogSchema.index({ severity: 1, createdAt: -1 });
activityLogSchema.index({ category: 1, createdAt: -1 });
activityLogSchema.index({ success: 1, createdAt: -1 });
activityLogSchema.index({ ipAddress: 1 });
activityLogSchema.index({ sessionId: 1 });
activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ archived: 1, createdAt: -1 });

// TTL index to automatically delete old logs (optional)
// activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 }); // 1 year

// Virtual for formatted timestamp
activityLogSchema.virtual('formattedTimestamp').get(function() {
    return this.createdAt.toISOString();
});

// Virtual for activity age
activityLogSchema.virtual('ageInDays').get(function() {
    const now = new Date();
    const diffTime = Math.abs(now - this.createdAt);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Static methods
activityLogSchema.statics.logActivity = function(data) {
    const activity = new this(data);
    return activity.save();
};

activityLogSchema.statics.getRecentActivities = function(limit = 50, userId = null) {
    const query = userId ? { user: userId } : {};
    return this.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('user', 'name email');
};

activityLogSchema.statics.getActivitiesByAction = function(action, limit = 100) {
    return this.find({ action })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('user', 'name email');
};

activityLogSchema.statics.getActivitiesByUser = function(userId, limit = 100) {
    return this.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(limit);
};

activityLogSchema.statics.getActivitiesByDateRange = function(startDate, endDate, options = {}) {
    const query = {
        createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        }
    };

    if (options.action) query.action = options.action;
    if (options.user) query.user = options.user;
    if (options.severity) query.severity = options.severity;
    if (options.category) query.category = options.category;
    if (options.success !== undefined) query.success = options.success;

    return this.find(query)
        .sort({ createdAt: -1 })
        .limit(options.limit || 1000)
        .populate('user', 'name email');
};

activityLogSchema.statics.getSecurityAlerts = function(limit = 50) {
    return this.find({
        $or: [
            { severity: { $in: ['high', 'critical'] } },
            { category: 'security' },
            { success: false, action: { $regex: /login|auth/ } }
        ]
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('user', 'name email');
};

activityLogSchema.statics.getActivityStats = function(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
            $group: {
                _id: {
                    date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    action: '$action'
                },
                count: { $sum: 1 }
            }
        },
        {
            $group: {
                _id: '$_id.date',
                activities: {
                    $push: {
                        action: '$_id.action',
                        count: '$count'
                    }
                },
                totalCount: { $sum: '$count' }
            }
        },
        { $sort: { _id: 1 } }
    ]);
};

activityLogSchema.statics.getUserActivitySummary = function(userId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.aggregate([
        { 
            $match: { 
                user: mongoose.Types.ObjectId(userId),
                createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: '$action',
                count: { $sum: 1 },
                lastActivity: { $max: '$createdAt' },
                successRate: {
                    $avg: { $cond: ['$success', 1, 0] }
                }
            }
        },
        { $sort: { count: -1 } }
    ]);
};

// Instance methods
activityLogSchema.methods.addChild = function(childActivityId) {
    if (!this.childActivities.includes(childActivityId)) {
        this.childActivities.push(childActivityId);
        return this.save();
    }
    return Promise.resolve(this);
};

activityLogSchema.methods.archive = function() {
    this.archived = true;
    this.archivedAt = new Date();
    return this.save();
};

activityLogSchema.methods.addTag = function(tag) {
    if (!this.tags.includes(tag.toLowerCase())) {
        this.tags.push(tag.toLowerCase());
        return this.save();
    }
    return Promise.resolve(this);
};

// Pre-save middleware
activityLogSchema.pre('save', function(next) {
    // Auto-categorize based on action
    if (!this.category) {
        if (this.action.includes('login') || this.action.includes('register') || this.action.includes('password')) {
            this.category = 'authentication';
        } else if (this.action.includes('role') || this.action.includes('permission')) {
            this.category = 'authorization';
        } else if (this.action.includes('content') || this.action.includes('comment')) {
            this.category = 'content';
        } else if (this.action.includes('ea') || this.action.includes('hft') || this.action.includes('signal')) {
            this.category = 'trading';
        } else if (this.action.includes('payment') || this.action.includes('subscription') || this.action.includes('refund')) {
            this.category = 'financial';
        } else if (this.action.includes('suspicious') || this.action.includes('security') || this.action.includes('locked')) {
            this.category = 'security';
        } else {
            this.category = 'system';
        }
    }

    // Auto-set severity based on action
    if (!this.severity || this.severity === 'low') {
        if (this.action.includes('failed') || this.action.includes('error') || this.action.includes('suspicious')) {
            this.severity = 'high';
        } else if (this.action.includes('deleted') || this.action.includes('locked') || this.action.includes('security')) {
            this.severity = 'medium';
        }
    }

    next();
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
