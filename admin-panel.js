const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const multer = require('multer');
const crypto = require('crypto');

const { auth, updateActivity } = require('./middleware/auth');
const databaseService = require('./services/databaseService');

const router = express.Router();

const ADMIN_UPLOAD_DIR = path.join(__dirname, 'uploads/admin');
const CONTENT_STORE_PATH = path.join(ADMIN_UPLOAD_DIR, 'content.json');

const ensureAdminDir = async () => {
  await fs.mkdir(ADMIN_UPLOAD_DIR, { recursive: true });
};

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await ensureAdminDir();
      cb(null, ADMIN_UPLOAD_DIR);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const extension = path.extname(file.originalname) || '';
    cb(null, `content-${uniqueSuffix}${extension}`);
  }
});

const allowedMime = /^(image\/(jpeg|jpg|png|gif|webp)|application\/(pdf|zip|x-zip-compressed)|text\/plain)$/i;

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (allowedMime.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Upload an image or PDF/ZIP.'));
    }
  }
});

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin privileges required.'
    });
  }
  next();
};

router.use(auth);
router.use(requireAdmin);
router.use(updateActivity);

const generateId = () => (crypto.randomUUID ? crypto.randomUUID() : `content_${Date.now()}_${Math.random().toString(16).slice(2)}`);

const readContentStore = async () => {
  try {
    const raw = await fs.readFile(CONTENT_STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    console.error('[admin] Failed to read content store:', error);
    throw error;
  }
};

const writeContentStore = async (items) => {
  await ensureAdminDir();
  await fs.writeFile(CONTENT_STORE_PATH, JSON.stringify(items, null, 2), 'utf8');
};

const countRows = async (table, filterCallback) => {
  try {
    const client = databaseService.getClient();
    let query = client.from(table).select('id', { count: 'exact', head: true });
    if (filterCallback) {
      query = filterCallback(query);
    }
    const { count, error } = await query;
    if (error) {
      console.warn(`[admin] Count query failed for ${table}:`, error.message);
      return 0;
    }
    return count || 0;
  } catch (error) {
    console.warn(`[admin] Count query threw for ${table}:`, error.message);
    return 0;
  }
};

const getDashboardSnapshot = async (user) => {
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));

  const totalUsers = await countRows('users_accounts');
  const activeUsers = await countRows('users_accounts', (query) => query.eq('is_active', true));
  const newThisMonth = await countRows('users_accounts', (query) => query.gte('created_at', monthStart.toISOString()));

  const contentItems = await readContentStore();
  const recentActivity = contentItems
    .slice(-5)
    .reverse()
    .map((item) => ({
      details: `Created content “${item.title}”`,
      user: { name: item.createdBy?.name || 'Admin' },
      createdAt: item.createdAt
    }));

  const adminName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || 'Admin User';

  if (!recentActivity.length) {
    recentActivity.push({
      details: 'Dashboard accessed',
      user: { name: adminName },
      createdAt: new Date().toISOString()
    });
  }

  return {
    stats: {
      users: {
        total: totalUsers,
        active: activeUsers,
        newThisMonth
      },
      eas: {
        active: 0,
        featured: 0
      },
      subscriptions: {
        active: 0,
        revenue: [{ total: 0 }]
      },
      signals: {
        total: 0,
        accuracy: [{ avgConfidence: 0.82 }]
      }
    },
    recentActivity
  };
};

router.get('/dashboard', async (req, res) => {
  try {
    const snapshot = await getDashboardSnapshot(req.user);
    res.json({ success: true, data: snapshot });
  } catch (error) {
    console.error('[admin] dashboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to load dashboard data.' });
  }
});

router.get('/content', async (req, res) => {
  try {
    const content = await readContentStore();
    const sorted = content.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, data: { content: sorted } });
  } catch (error) {
    console.error('[admin] content list error:', error);
    res.status(500).json({ success: false, message: 'Failed to load content library.' });
  }
});

router.post('/content', upload.single('image'), async (req, res) => {
  try {
    const { title, type, status, content: body, summary, tags } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required.' });
    }

    const entry = {
      _id: generateId(),
      title: title.trim(),
      type: (type || 'announcement').toLowerCase(),
      status: (status || 'draft').toLowerCase(),
      content: body?.trim() || summary?.trim() || '',
      tags: Array.from(new Set((tags || '')
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean))),
      image: req.file ? req.file.filename : null,
      createdAt: new Date().toISOString(),
      createdBy: {
        id: req.user.userId,
        name: [req.user.firstName, req.user.lastName].filter(Boolean).join(' ') || req.user.email || 'Admin'
      }
    };

    const content = await readContentStore();
    content.push(entry);
    await writeContentStore(content);

    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    console.error('[admin] create content error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create content.' });
  }
});

const mapUserRecord = (record) => ({
  _id: record.id,
  id: record.id,
  name: [record.first_name, record.last_name].filter(Boolean).join(' ') || record.email || 'User',
  email: record.email,
  role: record.role || 'user',
  status: record.is_active === false ? 'inactive' : 'active',
  createdAt: record.created_at,
  subscription: record.subscription_type || 'free'
});

router.get('/users', async (req, res) => {
  try {
    const client = databaseService.getClient();
    const { data: rows, error } = await client
      .from('users_accounts')
      .select('id, first_name, last_name, email, role, is_active, created_at, subscription_type')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      throw error;
    }

    const users = Array.isArray(rows) ? rows.map(mapUserRecord) : [];
    res.json({ success: true, data: { users } });
  } catch (error) {
    console.error('[admin] users list error:', error);
    res.status(500).json({ success: false, message: 'Failed to load users.' });
  }
});

router.get('/settings', async (req, res) => {
  res.json({
    success: true,
    data: {
      settings: {
        siteName: 'Smart Algos Trading Platform',
        siteDescription: 'Advanced algorithmic trading and investment solutions',
        maintenanceMode: false,
        allowRegistrations: true,
        sessionTimeout: 30,
        maxLoginAttempts: 5,
        requireTwoFactor: false,
        requireEmailVerification: true
      }
    }
  });
});

router.get('/activity', async (req, res) => {
  try {
    const content = await readContentStore();
    const activities = content
      .slice(-20)
      .reverse()
      .map((item) => ({
        id: `${item._id}_activity`,
        type: 'content',
        description: `Content ${item.status === 'published' ? 'published' : 'saved'}: ${item.title}`,
        metadata: {
          status: item.status,
          type: item.type
        },
        timestamp: item.createdAt,
        user: item.createdBy?.name || 'Admin'
      }));

    res.json({ success: true, data: { activities } });
  } catch (error) {
    console.error('[admin] activity error:', error);
    res.status(500).json({ success: false, message: 'Failed to load activity.' });
  }
});

router.get('/signals', async (req, res) => {
  res.json({ success: true, data: { signals: [] } });
});

router.get('/eas', async (req, res) => {
  res.json({ success: true, data: { eas: [] } });
});

router.get('/hft-bots', async (req, res) => {
  res.json({ success: true, data: { bots: [] } });
});

module.exports = router;
