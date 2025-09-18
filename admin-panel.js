/**
 * Smart Algos Trading Platform - Advanced Admin Panel
 * Comprehensive content management system with modern UI
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'uploads/admin');
        try {
            await fs.mkdir(uploadPath, { recursive: true });
            cb(null, uploadPath);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|zip|rar/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images, documents, and archives are allowed.'));
        }
    }
});

// Admin authentication middleware
const adminAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token.' });
    }
};

// Content Management System Routes

// Dashboard Overview
router.get('/dashboard', adminAuth, async (req, res) => {
    try {
        // Get system statistics
        const stats = {
            users: {
                total: await User.countDocuments(),
                active: await User.countDocuments({ isActive: true }),
                premium: await User.countDocuments({ subscriptionTier: { $ne: 'free' } }),
                newThisMonth: await User.countDocuments({
                    createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
                })
            },
            eas: {
                total: await EA.countDocuments(),
                active: await EA.countDocuments({ isActive: true }),
                featured: await EA.countDocuments({ isFeatured: true }),
                revenue: await Subscription.aggregate([
                    { $group: { _id: null, total: { $sum: '$price' } } }
                ])
            },
            hftBots: {
                total: await HFTBot.countDocuments(),
                active: await HFTBot.countDocuments({ isActive: true }),
                running: await HFTBot.countDocuments({ status: 'running' })
            },
            signals: {
                total: await TradingSignal.countDocuments(),
                active: await TradingSignal.countDocuments({ isActive: true }),
                accuracy: await TradingSignal.aggregate([
                    { $group: { _id: null, avgConfidence: { $avg: '$aiAnalysis.confidence' } } }
                ])
            },
            subscriptions: {
                total: await Subscription.countDocuments(),
                active: await Subscription.countDocuments({ status: 'active' }),
                revenue: await Subscription.aggregate([
                    { $match: { status: 'active' } },
                    { $group: { _id: null, total: { $sum: '$price' } } }
                ])
            }
        };

        // Recent activity
        const recentActivity = await ActivityLog.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('user', 'name email');

        res.json({
            success: true,
            data: {
                stats,
                recentActivity
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// User Management
router.get('/users', adminAuth, async (req, res) => {
    try {
        const { page = 1, limit = 20, search, role, status } = req.query;
        const query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        if (role) query.role = role;
        if (status) query.isActive = status === 'active';

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('subscriptions');

        const total = await User.countDocuments(query);

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    page: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.put('/users/:id', adminAuth, [
    body('name').optional().isLength({ min: 2 }).trim(),
    body('email').optional().isEmail().normalizeEmail(),
    body('role').optional().isIn(['user', 'admin', 'moderator']),
    body('isActive').optional().isBoolean()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Log activity
        await ActivityLog.create({
            user: req.user._id,
            action: 'user_updated',
            details: `Updated user ${user.email}`,
            targetId: user._id,
            targetType: 'User'
        });

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// EA Management
router.get('/eas', adminAuth, async (req, res) => {
    try {
        const { page = 1, limit = 20, search, category, status } = req.query;
        const query = {};

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        if (category) query.category = category;
        if (status) query.status = status;

        const eas = await EA.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('creator', 'name email');

        const total = await EA.countDocuments(query);

        res.json({
            success: true,
            data: {
                eas,
                pagination: {
                    page: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.post('/eas', adminAuth, upload.fields([
    { name: 'eaFile', maxCount: 1 },
    { name: 'setFile', maxCount: 1 },
    { name: 'manual', maxCount: 1 },
    { name: 'screenshots', maxCount: 5 }
]), [
    body('name').isLength({ min: 3 }).trim(),
    body('description').isLength({ min: 10 }).trim(),
    body('category').isIn(['scalping', 'trend', 'grid', 'martingale', 'hedge']),
    body('minimumDeposit').isFloat({ min: 0 }),
    body('riskLevel').isIn(['low', 'medium', 'high'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const eaData = {
            ...req.body,
            creator: req.user._id,
            files: {
                eaFile: req.files.eaFile?.[0]?.filename,
                setFile: req.files.setFile?.[0]?.filename,
                manual: req.files.manual?.[0]?.filename,
                screenshots: req.files.screenshots?.map(file => file.filename) || []
            }
        };

        const ea = new EA(eaData);
        await ea.save();

        // Log activity
        await ActivityLog.create({
            user: req.user._id,
            action: 'ea_created',
            details: `Created EA: ${ea.name}`,
            targetId: ea._id,
            targetType: 'EA'
        });

        res.status(201).json({
            success: true,
            data: ea
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.put('/eas/:id', adminAuth, [
    body('status').optional().isIn(['draft', 'pending', 'approved', 'rejected']),
    body('isFeatured').optional().isBoolean(),
    body('isActive').optional().isBoolean()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const ea = await EA.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!ea) {
            return res.status(404).json({ message: 'EA not found' });
        }

        // Log activity
        await ActivityLog.create({
            user: req.user._id,
            action: 'ea_updated',
            details: `Updated EA: ${ea.name}`,
            targetId: ea._id,
            targetType: 'EA'
        });

        res.json({
            success: true,
            data: ea
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// HFT Bot Management
router.get('/hft-bots', adminAuth, async (req, res) => {
    try {
        const { page = 1, limit = 20, search, exchange, status } = req.query;
        const query = {};

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        if (exchange) query.exchange = exchange;
        if (status) query.status = status;

        const bots = await HFTBot.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('creator', 'name email');

        const total = await HFTBot.countDocuments(query);

        res.json({
            success: true,
            data: {
                bots,
                pagination: {
                    page: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Trading Signals Management
router.get('/signals', adminAuth, async (req, res) => {
    try {
        const { page = 1, limit = 20, search, asset, action } = req.query;
        const query = {};

        if (search) {
            query['asset.symbol'] = { $regex: search, $options: 'i' };
        }
        if (asset) query['asset.type'] = asset;
        if (action) query.action = action;

        const signals = await TradingSignal.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('aiModel', 'name version');

        const total = await TradingSignal.countDocuments(query);

        res.json({
            success: true,
            data: {
                signals,
                pagination: {
                    page: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Content Management
router.get('/content', adminAuth, async (req, res) => {
    try {
        const { type, status } = req.query;
        const query = {};

        if (type) query.type = type;
        if (status) query.status = status;

        const content = await Content.find(query)
            .sort({ createdAt: -1 })
            .populate('author', 'name email');

        res.json({
            success: true,
            data: content
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.post('/content', adminAuth, upload.single('image'), [
    body('title').isLength({ min: 3 }).trim(),
    body('content').isLength({ min: 10 }).trim(),
    body('type').isIn(['news', 'blog', 'announcement', 'guide', 'faq']),
    body('status').optional().isIn(['draft', 'published', 'archived'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const contentData = {
            ...req.body,
            author: req.user._id,
            image: req.file?.filename,
            slug: req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        };

        const content = new Content(contentData);
        await content.save();

        // Log activity
        await ActivityLog.create({
            user: req.user._id,
            action: 'content_created',
            details: `Created content: ${content.title}`,
            targetId: content._id,
            targetType: 'Content'
        });

        res.status(201).json({
            success: true,
            data: content
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.put('/content/:id', adminAuth, upload.single('image'), [
    body('title').optional().isLength({ min: 3 }).trim(),
    body('content').optional().isLength({ min: 10 }).trim(),
    body('status').optional().isIn(['draft', 'published', 'archived'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const updateData = { ...req.body };
        if (req.file) {
            updateData.image = req.file.filename;
        }

        const content = await Content.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!content) {
            return res.status(404).json({ message: 'Content not found' });
        }

        // Log activity
        await ActivityLog.create({
            user: req.user._id,
            action: 'content_updated',
            details: `Updated content: ${content.title}`,
            targetId: content._id,
            targetType: 'Content'
        });

        res.json({
            success: true,
            data: content
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.delete('/content/:id', adminAuth, async (req, res) => {
    try {
        const content = await Content.findByIdAndDelete(req.params.id);
        
        if (!content) {
            return res.status(404).json({ message: 'Content not found' });
        }

        // Delete associated file if exists
        if (content.image) {
            try {
                await fs.unlink(path.join(__dirname, 'uploads/admin', content.image));
            } catch (error) {
                console.error('Error deleting file:', error);
            }
        }

        // Log activity
        await ActivityLog.create({
            user: req.user._id,
            action: 'content_deleted',
            details: `Deleted content: ${content.title}`,
            targetId: content._id,
            targetType: 'Content'
        });

        res.json({
            success: true,
            message: 'Content deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// System Settings
router.get('/settings', adminAuth, async (req, res) => {
    try {
        const settings = await SystemSettings.findOne() || {};
        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.put('/settings', adminAuth, [
    body('siteName').optional().isLength({ min: 1 }).trim(),
    body('siteDescription').optional().isLength({ min: 1 }).trim(),
    body('maintenanceMode').optional().isBoolean(),
    body('registrationEnabled').optional().isBoolean()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const settings = await SystemSettings.findOneAndUpdate(
            {},
            { ...req.body, updatedBy: req.user._id },
            { new: true, upsert: true }
        );

        // Log activity
        await ActivityLog.create({
            user: req.user._id,
            action: 'settings_updated',
            details: 'Updated system settings'
        });

        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Analytics
router.get('/analytics', adminAuth, async (req, res) => {
    try {
        const { period = '30d' } = req.query;
        const days = parseInt(period.replace('d', ''));
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // User growth
        const userGrowth = await User.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Revenue analytics
        const revenue = await Subscription.aggregate([
            { $match: { createdAt: { $gte: startDate }, status: 'active' } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    revenue: { $sum: '$price' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Popular EAs
        const popularEAs = await EA.aggregate([
            { $match: { isActive: true } },
            {
                $lookup: {
                    from: 'subscriptions',
                    localField: '_id',
                    foreignField: 'ea',
                    as: 'subscriptions'
                }
            },
            {
                $project: {
                    name: 1,
                    category: 1,
                    subscriptionCount: { $size: '$subscriptions' }
                }
            },
            { $sort: { subscriptionCount: -1 } },
            { $limit: 10 }
        ]);

        res.json({
            success: true,
            data: {
                userGrowth,
                revenue,
                popularEAs
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Activity Logs
router.get('/activity', adminAuth, async (req, res) => {
    try {
        const { page = 1, limit = 50, action, user } = req.query;
        const query = {};

        if (action) query.action = action;
        if (user) query.user = user;

        const activities = await ActivityLog.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('user', 'name email');

        const total = await ActivityLog.countDocuments(query);

        res.json({
            success: true,
            data: {
                activities,
                pagination: {
                    page: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Backup and Export
router.post('/backup', adminAuth, async (req, res) => {
    try {
        const { collections } = req.body;
        const backupData = {};

        for (const collection of collections) {
            switch (collection) {
                case 'users':
                    backupData.users = await User.find().select('-password');
                    break;
                case 'eas':
                    backupData.eas = await EA.find();
                    break;
                case 'hftbots':
                    backupData.hftbots = await HFTBot.find();
                    break;
                case 'signals':
                    backupData.signals = await TradingSignal.find();
                    break;
                case 'subscriptions':
                    backupData.subscriptions = await Subscription.find();
                    break;
            }
        }

        const filename = `backup-${Date.now()}.json`;
        const backupPath = path.join(__dirname, 'uploads/admin', filename);
        
        await fs.writeFile(backupPath, JSON.stringify(backupData, null, 2));

        // Log activity
        await ActivityLog.create({
            user: req.user._id,
            action: 'backup_created',
            details: `Created backup: ${filename}`
        });

        res.json({
            success: true,
            data: {
                filename,
                downloadUrl: `/uploads/admin/${filename}`
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
