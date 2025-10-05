const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const fs = require('fs').promises;
const path = require('path');

// Admin-only middleware
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin privileges required.'
    });
  }
  next();
};

// Apply auth and admin middleware to all routes
router.use(auth);
router.use(requireAdmin);

// Content store path
const CONTENT_STORE_PATH = path.join(__dirname, '../data/content.json');
const SETTINGS_STORE_PATH = path.join(__dirname, '../data/settings.json');
const AUDIT_LOG_PATH = path.join(__dirname, '../data/audit-logs.json');

// Ensure data directory exists
const ensureDataDirectory = async () => {
  const dataDir = path.dirname(CONTENT_STORE_PATH);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
};

// Read content store
const readContentStore = async () => {
  try {
    await ensureDataDirectory();
    const raw = await fs.readFile(CONTENT_STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
};

// Write content store
const writeContentStore = async (content) => {
  await ensureDataDirectory();
  await fs.writeFile(CONTENT_STORE_PATH, JSON.stringify(content, null, 2));
};

// Read settings store
const readSettingsStore = async () => {
  try {
    await ensureDataDirectory();
    const raw = await fs.readFile(SETTINGS_STORE_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {
        siteName: 'Smart Algos Trading Platform',
        siteDescription: 'Advanced algorithmic trading and investment solutions',
        contactEmail: 'support@smartalgos.com',
        contactPhone: '+1 (555) 123-4567',
        maintenanceMode: false,
        allowRegistration: true,
        maxUsers: 1000,
        sessionTimeout: 30
      };
    }
    throw error;
  }
};

// Write settings store
const writeSettingsStore = async (settings) => {
  await ensureDataDirectory();
  await fs.writeFile(SETTINGS_STORE_PATH, JSON.stringify(settings, null, 2));
};

// Read audit logs
const readAuditLogs = async () => {
  try {
    await ensureDataDirectory();
    const raw = await fs.readFile(AUDIT_LOG_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
};

// Write audit logs
const writeAuditLogs = async (logs) => {
  await ensureDataDirectory();
  await fs.writeFile(AUDIT_LOG_PATH, JSON.stringify(logs, null, 2));
};

// Add audit log entry
const addAuditLog = async (action, details, user, ipAddress) => {
  const logs = await readAuditLogs();
  const newLog = {
    id: `log_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    timestamp: new Date().toISOString(),
    action,
    details,
    userEmail: user.email,
    userRole: user.role,
    ipAddress
  };
  logs.unshift(newLog);
  // Keep only last 1000 logs
  if (logs.length > 1000) {
    logs.splice(1000);
  }
  await writeAuditLogs(logs);
  return newLog;
};

// @route   GET /api/admin/cms/overview
// @desc    Get CMS overview data
// @access  Admin
router.get('/cms/overview', async (req, res) => {
  try {
    const content = await readContentStore();
    const settings = await readSettingsStore();
    
    // Mock data for demo
    const overview = {
      pages: content.filter(item => item.type === 'page').length,
      posts: content.filter(item => item.type === 'post').length,
      announcements: content.filter(item => item.type === 'announcement').length,
      activeSessions: Math.floor(Math.random() * 50) + 10, // Mock data
      systemHealth: 98,
      content: content.slice(0, 10) // Recent content
    };

    await addAuditLog('VIEW_OVERVIEW', 'Viewed CMS overview', req.user, req.ip);

    res.json({
      success: true,
      data: overview
    });
  } catch (error) {
    console.error('CMS overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch overview data'
    });
  }
});

// @route   GET /api/admin/cms/content
// @desc    Get all content
// @access  Admin
router.get('/cms/content', async (req, res) => {
  try {
    const content = await readContentStore();
    
    await addAuditLog('VIEW_CONTENT', 'Viewed content list', req.user, req.ip);

    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch content'
    });
  }
});

// @route   POST /api/admin/cms/content
// @desc    Create new content
// @access  Admin
router.post('/cms/content', async (req, res) => {
  try {
    const { title, content, type, status, metaTitle, metaDescription, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    const contentList = await readContentStore();
    const newContent = {
      id: `content_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      title,
      content,
      type: type || 'page',
      status: status || 'draft',
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || '',
      tags: tags || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: req.user.email
    };

    contentList.unshift(newContent);
    await writeContentStore(contentList);

    await addAuditLog('CREATE_CONTENT', `Created content: ${title}`, req.user, req.ip);

    res.json({
      success: true,
      data: newContent,
      message: 'Content created successfully'
    });
  } catch (error) {
    console.error('Create content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create content'
    });
  }
});

// @route   PUT /api/admin/cms/content/:id
// @desc    Update content
// @access  Admin
router.put('/cms/content/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, type, status, metaTitle, metaDescription, tags } = req.body;

    const contentList = await readContentStore();
    const contentIndex = contentList.findIndex(item => item.id === id);

    if (contentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    const updatedContent = {
      ...contentList[contentIndex],
      title: title || contentList[contentIndex].title,
      content: content || contentList[contentIndex].content,
      type: type || contentList[contentIndex].type,
      status: status || contentList[contentIndex].status,
      metaTitle: metaTitle || contentList[contentIndex].metaTitle,
      metaDescription: metaDescription || contentList[contentIndex].metaDescription,
      tags: tags || contentList[contentIndex].tags,
      updatedAt: new Date().toISOString(),
      updatedBy: req.user.email
    };

    contentList[contentIndex] = updatedContent;
    await writeContentStore(contentList);

    await addAuditLog('UPDATE_CONTENT', `Updated content: ${updatedContent.title}`, req.user, req.ip);

    res.json({
      success: true,
      data: updatedContent,
      message: 'Content updated successfully'
    });
  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update content'
    });
  }
});

// @route   DELETE /api/admin/cms/content/:id
// @desc    Delete content
// @access  Admin
router.delete('/cms/content/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const contentList = await readContentStore();
    const contentIndex = contentList.findIndex(item => item.id === id);

    if (contentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    const deletedContent = contentList[contentIndex];
    contentList.splice(contentIndex, 1);
    await writeContentStore(contentList);

    await addAuditLog('DELETE_CONTENT', `Deleted content: ${deletedContent.title}`, req.user, req.ip);

    res.json({
      success: true,
      message: 'Content deleted successfully'
    });
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete content'
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Admin
router.get('/users', async (req, res) => {
  try {
    // This would typically fetch from your user database
    // For now, returning mock data
    const users = [
      {
        id: 'user_1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'user',
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'user_2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        role: 'admin',
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ];

    await addAuditLog('VIEW_USERS', 'Viewed user list', req.user, req.ip);

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// @route   POST /api/admin/users/:id/:action
// @desc    Perform user action (activate/deactivate)
// @access  Admin
router.post('/users/:id/:action', async (req, res) => {
  try {
    const { id, action } = req.params;

    if (!['activate', 'deactivate'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action'
      });
    }

    // This would typically update the user in your database
    // For now, just logging the action

    await addAuditLog(`USER_${action.toUpperCase()}`, `User ${action}d: ${id}`, req.user, req.ip);

    res.json({
      success: true,
      message: `User ${action}d successfully`
    });
  } catch (error) {
    console.error('User action error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform user action'
    });
  }
});

// @route   GET /api/admin/settings
// @desc    Get system settings
// @access  Admin
router.get('/settings', async (req, res) => {
  try {
    const settings = await readSettingsStore();

    await addAuditLog('VIEW_SETTINGS', 'Viewed system settings', req.user, req.ip);

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings'
    });
  }
});

// @route   PUT /api/admin/settings
// @desc    Update system settings
// @access  Admin
router.put('/settings', async (req, res) => {
  try {
    const settings = req.body;

    // Validate required fields
    if (!settings.siteName || !settings.contactEmail) {
      return res.status(400).json({
        success: false,
        message: 'Site name and contact email are required'
      });
    }

    await writeSettingsStore(settings);

    await addAuditLog('UPDATE_SETTINGS', 'Updated system settings', req.user, req.ip);

    res.json({
      success: true,
      data: settings,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings'
    });
  }
});

// @route   GET /api/admin/audit-logs
// @desc    Get audit logs
// @access  Admin
router.get('/audit-logs', async (req, res) => {
  try {
    const logs = await readAuditLogs();

    await addAuditLog('VIEW_AUDIT_LOGS', 'Viewed audit logs', req.user, req.ip);

    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs'
    });
  }
});

// @route   POST /api/admin/audit-logs/clear
// @desc    Clear audit logs
// @access  Admin
router.post('/audit-logs/clear', async (req, res) => {
  try {
    await writeAuditLogs([]);

    await addAuditLog('CLEAR_AUDIT_LOGS', 'Cleared all audit logs', req.user, req.ip);

    res.json({
      success: true,
      message: 'Audit logs cleared successfully'
    });
  } catch (error) {
    console.error('Clear audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear audit logs'
    });
  }
});

module.exports = router;
