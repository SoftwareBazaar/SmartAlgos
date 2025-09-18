/**
 * System Settings Model
 * Manages global system configuration and settings
 */

const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
    // General Settings
    siteName: {
        type: String,
        default: 'Smart Algos Trading Platform',
        maxlength: 100
    },
    siteDescription: {
        type: String,
        default: 'Advanced algorithmic trading and investment solutions',
        maxlength: 500
    },
    siteUrl: {
        type: String,
        default: 'https://smartalgos.com'
    },
    logo: {
        type: String, // filename
        default: null
    },
    favicon: {
        type: String, // filename
        default: null
    },
    timezone: {
        type: String,
        default: 'UTC'
    },
    language: {
        type: String,
        default: 'en',
        enum: ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ar']
    },
    currency: {
        primary: {
            type: String,
            default: 'USD',
            enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'KES']
        },
        supported: [{
            code: String,
            symbol: String,
            name: String,
            exchangeRate: Number
        }]
    },

    // System Status
    maintenanceMode: {
        enabled: {
            type: Boolean,
            default: false
        },
        message: {
            type: String,
            default: 'System is under maintenance. Please check back later.'
        },
        startTime: Date,
        endTime: Date,
        allowedUsers: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }]
    },
    systemStatus: {
        type: String,
        enum: ['operational', 'degraded', 'maintenance', 'outage'],
        default: 'operational'
    },
    statusMessage: {
        type: String,
        default: 'All systems operational'
    },

    // User Management
    userSettings: {
        registrationEnabled: {
            type: Boolean,
            default: true
        },
        emailVerificationRequired: {
            type: Boolean,
            default: true
        },
        adminApprovalRequired: {
            type: Boolean,
            default: false
        },
        defaultRole: {
            type: String,
            default: 'user',
            enum: ['user', 'trader', 'developer']
        },
        maxUsersPerIP: {
            type: Number,
            default: 5
        },
        passwordPolicy: {
            minLength: { type: Number, default: 8 },
            requireUppercase: { type: Boolean, default: true },
            requireLowercase: { type: Boolean, default: true },
            requireNumbers: { type: Boolean, default: true },
            requireSpecialChars: { type: Boolean, default: true },
            expiryDays: { type: Number, default: 90 }
        }
    },

    // Security Settings
    security: {
        sessionTimeout: {
            type: Number,
            default: 30 // minutes
        },
        maxLoginAttempts: {
            type: Number,
            default: 5
        },
        lockoutDuration: {
            type: Number,
            default: 15 // minutes
        },
        twoFactorRequired: {
            type: Boolean,
            default: false
        },
        ipWhitelist: [{
            ip: String,
            description: String,
            enabled: Boolean
        }],
        ipBlacklist: [{
            ip: String,
            reason: String,
            blockedAt: Date,
            expiresAt: Date
        }],
        corsSettings: {
            allowedOrigins: [String],
            allowCredentials: Boolean,
            maxAge: Number
        },
        rateLimiting: {
            windowMs: { type: Number, default: 900000 }, // 15 minutes
            maxRequests: { type: Number, default: 100 },
            skipSuccessfulRequests: { type: Boolean, default: false }
        }
    },

    // Trading Settings
    trading: {
        defaultSettings: {
            maxPositionSize: { type: Number, default: 0.02 },
            maxPortfolioRisk: { type: Number, default: 0.06 },
            minConfidence: { type: Number, default: 0.69 },
            stopLoss: { type: Number, default: 0.02 },
            takeProfit: { type: Number, default: 0.04 }
        },
        supportedExchanges: [{
            name: String,
            apiUrl: String,
            enabled: Boolean,
            fees: {
                maker: Number,
                taker: Number
            }
        }],
        supportedAssets: [{
            symbol: String,
            name: String,
            type: { type: String, enum: ['stock', 'forex', 'crypto', 'commodity', 'index'] },
            enabled: Boolean,
            minOrderSize: Number,
            maxOrderSize: Number
        }],
        marketHours: {
            forex: {
                open: String, // "00:00"
                close: String, // "23:59"
                timezone: String
            },
            stocks: {
                open: String,
                close: String,
                timezone: String
            },
            crypto: {
                open: String,
                close: String,
                timezone: String
            }
        }
    },

    // Payment Settings
    payments: {
        providers: {
            paystack: {
                enabled: { type: Boolean, default: true },
                publicKey: String,
                webhookSecret: String,
                testMode: { type: Boolean, default: true }
            },
            stripe: {
                enabled: { type: Boolean, default: false },
                publicKey: String,
                webhookSecret: String,
                testMode: { type: Boolean, default: true }
            }
        },
        subscriptionSettings: {
            trialPeriodDays: { type: Number, default: 7 },
            gracePeriodDays: { type: Number, default: 3 },
            autoRenewal: { type: Boolean, default: true },
            refundPolicy: {
                enabled: { type: Boolean, default: true },
                periodDays: { type: Number, default: 30 }
            }
        },
        escrowSettings: {
            enabled: { type: Boolean, default: true },
            holdPeriodDays: { type: Number, default: 7 },
            feePercentage: { type: Number, default: 2.5 },
            autoRelease: { type: Boolean, default: true }
        }
    },

    // Email Settings
    email: {
        provider: {
            type: String,
            enum: ['smtp', 'sendgrid', 'mailgun', 'ses'],
            default: 'smtp'
        },
        smtp: {
            host: String,
            port: Number,
            secure: Boolean,
            auth: {
                user: String,
                pass: String
            }
        },
        templates: {
            welcome: { subject: String, template: String },
            verification: { subject: String, template: String },
            passwordReset: { subject: String, template: String },
            paymentConfirmation: { subject: String, template: String },
            subscriptionExpiry: { subject: String, template: String }
        },
        notifications: {
            adminEmails: [String],
            enableUserNotifications: { type: Boolean, default: true },
            enableAdminAlerts: { type: Boolean, default: true }
        }
    },

    // API Settings
    api: {
        version: {
            type: String,
            default: '1.0.0'
        },
        rateLimit: {
            windowMs: { type: Number, default: 900000 },
            maxRequests: { type: Number, default: 1000 }
        },
        authentication: {
            jwtExpiry: { type: String, default: '7d' },
            refreshTokenExpiry: { type: String, default: '30d' },
            apiKeyExpiry: { type: String, default: '365d' }
        },
        documentation: {
            enabled: { type: Boolean, default: true },
            url: String
        }
    },

    // Content Settings
    content: {
        moderation: {
            autoApprove: { type: Boolean, default: false },
            requireApproval: { type: Boolean, default: true },
            spamFilter: { type: Boolean, default: true }
        },
        uploads: {
            maxFileSize: { type: Number, default: 10485760 }, // 10MB
            allowedTypes: [String],
            imageCompression: { type: Boolean, default: true },
            thumbnailGeneration: { type: Boolean, default: true }
        },
        seo: {
            enableSitemap: { type: Boolean, default: true },
            enableRobotsTxt: { type: Boolean, default: true },
            defaultMetaDescription: String,
            defaultMetaKeywords: [String]
        }
    },

    // Analytics Settings
    analytics: {
        googleAnalytics: {
            enabled: { type: Boolean, default: false },
            trackingId: String
        },
        customAnalytics: {
            enabled: { type: Boolean, default: true },
            trackPageViews: { type: Boolean, default: true },
            trackEvents: { type: Boolean, default: true },
            trackErrors: { type: Boolean, default: true }
        },
        reporting: {
            dailyReports: { type: Boolean, default: true },
            weeklyReports: { type: Boolean, default: true },
            monthlyReports: { type: Boolean, default: true }
        }
    },

    // Backup Settings
    backup: {
        enabled: { type: Boolean, default: true },
        frequency: {
            type: String,
            enum: ['daily', 'weekly', 'monthly'],
            default: 'daily'
        },
        retention: {
            days: { type: Number, default: 30 },
            maxBackups: { type: Number, default: 10 }
        },
        storage: {
            type: String,
            enum: ['local', 's3', 'gcs', 'azure'],
            default: 'local'
        },
        compression: { type: Boolean, default: true },
        encryption: { type: Boolean, default: true }
    },

    // Notification Settings
    notifications: {
        push: {
            enabled: { type: Boolean, default: true },
            vapidKeys: {
                publicKey: String,
                privateKey: String
            }
        },
        email: {
            enabled: { type: Boolean, default: true },
            frequency: {
                type: String,
                enum: ['immediate', 'daily', 'weekly'],
                default: 'immediate'
            }
        },
        sms: {
            enabled: { type: Boolean, default: false },
            provider: String,
            apiKey: String
        },
        webhook: {
            enabled: { type: Boolean, default: false },
            urls: [String]
        }
    },

    // Feature Flags
    features: {
        eaMarketplace: { type: Boolean, default: true },
        hftBots: { type: Boolean, default: true },
        tradingSignals: { type: Boolean, default: true },
        socialTrading: { type: Boolean, default: false },
        mobileApp: { type: Boolean, default: true },
        desktopApp: { type: Boolean, default: true },
        apiAccess: { type: Boolean, default: true },
        betaFeatures: { type: Boolean, default: false }
    },

    // Integration Settings
    integrations: {
        telegram: {
            enabled: { type: Boolean, default: false },
            botToken: String,
            webhookUrl: String
        },
        discord: {
            enabled: { type: Boolean, default: false },
            botToken: String,
            webhookUrl: String
        },
        slack: {
            enabled: { type: Boolean, default: false },
            webhookUrl: String
        },
        tradingview: {
            enabled: { type: Boolean, default: true },
            webhookSecret: String
        }
    },

    // Metadata
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    version: {
        type: String,
        default: '1.0.0'
    },
    lastBackup: Date,
    lastMaintenance: Date
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Ensure only one settings document exists
systemSettingsSchema.index({}, { unique: true });

// Static methods
systemSettingsSchema.statics.getSettings = async function() {
    let settings = await this.findOne();
    if (!settings) {
        settings = new this({});
        await settings.save();
    }
    return settings;
};

systemSettingsSchema.statics.updateSetting = async function(path, value, updatedBy) {
    const settings = await this.getSettings();
    settings.set(path, value);
    if (updatedBy) {
        settings.updatedBy = updatedBy;
    }
    return settings.save();
};

systemSettingsSchema.statics.enableMaintenanceMode = async function(message, startTime, endTime, allowedUsers = []) {
    return this.updateOne({}, {
        'maintenanceMode.enabled': true,
        'maintenanceMode.message': message,
        'maintenanceMode.startTime': startTime,
        'maintenanceMode.endTime': endTime,
        'maintenanceMode.allowedUsers': allowedUsers,
        'systemStatus': 'maintenance'
    });
};

systemSettingsSchema.statics.disableMaintenanceMode = async function() {
    return this.updateOne({}, {
        'maintenanceMode.enabled': false,
        'systemStatus': 'operational'
    });
};

// Instance methods
systemSettingsSchema.methods.isMaintenanceMode = function() {
    return this.maintenanceMode.enabled;
};

systemSettingsSchema.methods.canUserAccess = function(userId) {
    if (!this.maintenanceMode.enabled) return true;
    return this.maintenanceMode.allowedUsers.includes(userId);
};

systemSettingsSchema.methods.updateFeatureFlag = function(feature, enabled) {
    this.features[feature] = enabled;
    return this.save();
};

systemSettingsSchema.methods.getPaymentProvider = function() {
    if (this.payments.providers.paystack.enabled) return 'paystack';
    if (this.payments.providers.stripe.enabled) return 'stripe';
    return null;
};

systemSettingsSchema.methods.isFeatureEnabled = function(feature) {
    return this.features[feature] || false;
};

systemSettingsSchema.methods.getSupportedCurrencies = function() {
    return [
        { code: this.currency.primary, primary: true },
        ...this.currency.supported
    ];
};

// Pre-save middleware
systemSettingsSchema.pre('save', function(next) {
    // Ensure default supported currencies include primary
    const primaryExists = this.currency.supported.some(curr => curr.code === this.currency.primary);
    if (!primaryExists && this.currency.primary) {
        this.currency.supported.unshift({
            code: this.currency.primary,
            symbol: this.currency.primary === 'USD' ? '$' : this.currency.primary,
            name: this.currency.primary,
            exchangeRate: 1
        });
    }

    next();
});

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
