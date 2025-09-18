# Smart Algos Admin Panel

A comprehensive content management system and administrative dashboard for the Smart Algos Trading Platform.

## 🚀 Features

### Content Management System
- **Rich Content Editor**: Create and manage blog posts, news articles, guides, and announcements
- **Media Management**: Upload and organize images, documents, and other media files
- **SEO Optimization**: Built-in SEO tools with meta tags, keywords, and content optimization
- **Content Scheduling**: Schedule content publication for future dates
- **Multi-language Support**: Create content in multiple languages
- **Content Templates**: Reusable templates for consistent content creation

### User Management
- **User Overview**: Comprehensive user dashboard with activity tracking
- **Role Management**: Assign and modify user roles (admin, moderator, user)
- **User Analytics**: Track user engagement, subscription status, and activity patterns
- **Bulk Operations**: Perform bulk actions on multiple users
- **Security Monitoring**: Monitor suspicious activities and failed login attempts

### Trading System Management
- **EA Management**: Approve, reject, and manage Expert Advisors in the marketplace
- **HFT Bot Oversight**: Monitor and control high-frequency trading bots
- **Signal Management**: Review and manage trading signals
- **Performance Analytics**: Track system-wide trading performance
- **Risk Monitoring**: Monitor risk levels across all trading activities

### System Administration
- **System Settings**: Configure global platform settings
- **Feature Flags**: Enable/disable platform features dynamically
- **Maintenance Mode**: Put the system in maintenance mode with custom messages
- **Backup Management**: Create and manage system backups
- **Activity Logging**: Comprehensive audit trail of all system activities

### Analytics & Reporting
- **Real-time Dashboard**: Live system metrics and performance indicators
- **User Analytics**: User growth, engagement, and retention metrics
- **Revenue Analytics**: Subscription revenue and payment analytics
- **Content Performance**: Track content views, engagement, and effectiveness
- **System Health**: Monitor server performance and system health

## 📋 Prerequisites

- Node.js (v16 or higher)
- Supabase account with database setup
- Smart Algos Trading Platform backend running
- Admin user credentials

## 🛠️ Installation & Setup

### 1. Quick Setup (Recommended)

```bash
# Run the automated setup
node launch-admin-panel.js setup
```

This will:
- Create admin user account
- Set up database tables
- Initialize system settings
- Create sample content
- Configure permissions

### 2. Manual Setup

If you prefer manual setup:

```bash
# 1. Install dependencies (if not already done)
npm install

# 2. Set up environment variables
cp env.example .env
# Edit .env with your configuration

# 3. Run database setup
node setup-admin-panel.js

# 4. Start the server
npm start
```

### 3. Environment Configuration

Ensure your `.env` file contains:

```env
# Supabase Configuration
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT Configuration
JWT_SECRET=your-jwt-secret

# Other required variables...
```

## 🚀 Usage

### Starting the Admin Panel

```bash
# Production mode
node launch-admin-panel.js start

# Development mode (with hot reload)
node launch-admin-panel.js dev

# Check system status
node launch-admin-panel.js status
```

### Accessing the Admin Panel

1. Start the server: `node launch-admin-panel.js start`
2. Open your browser: `http://localhost:3000/admin`
3. Login with admin credentials:
   - **Email**: `admin@smartalgos.com`
   - **Password**: `admin123456`

⚠️ **Important**: Change the default password after first login!

## 📊 Admin Panel Sections

### 1. Dashboard
- System overview with key metrics
- Recent activity feed
- System status indicators
- Quick action buttons

### 2. User Management
- User list with search and filters
- User profile editing
- Role assignment
- Activity monitoring
- Bulk operations

### 3. Content Management
- Content creation and editing
- Media library
- Content scheduling
- SEO optimization
- Content analytics

### 4. Trading Management
- EA marketplace oversight
- HFT bot management
- Signal review and approval
- Performance monitoring

### 5. System Settings
- Global configuration
- Feature flags
- Security settings
- Backup configuration
- Integration settings

### 6. Analytics
- User growth metrics
- Revenue analytics
- Content performance
- System health monitoring

## 🔐 Security Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control
- Session management
- Two-factor authentication support

### Security Monitoring
- Failed login attempt tracking
- Suspicious activity detection
- IP-based access control
- Rate limiting

### Data Protection
- Input sanitization
- SQL injection prevention
- XSS protection
- CSRF protection

## 📝 Content Management

### Creating Content

1. Navigate to **Content Management**
2. Click **Create Content**
3. Fill in the content details:
   - Title and slug
   - Content body (rich text editor)
   - Category and tags
   - SEO settings
   - Visibility settings
4. Save as draft or publish immediately

### Content Types

- **News**: Latest platform news and updates
- **Blog**: Educational and informational articles
- **Announcements**: Important platform announcements
- **Guides**: Step-by-step tutorials and guides
- **FAQs**: Frequently asked questions
- **Updates**: Platform and feature updates

### SEO Optimization

- **Meta Title**: Optimized page titles
- **Meta Description**: Search engine descriptions
- **Keywords**: Relevant search keywords
- **Open Graph**: Social media sharing optimization
- **Schema Markup**: Structured data for search engines

## 👥 User Management

### User Roles

- **Admin**: Full system access
- **Moderator**: Content and user management
- **User**: Standard platform user
- **Trader**: Enhanced trading features
- **Developer**: API access and development tools

### User Operations

- **View Profile**: Complete user information
- **Edit Details**: Modify user information
- **Change Role**: Assign different roles
- **Suspend/Activate**: Control user access
- **View Activity**: Track user actions
- **Send Messages**: Direct communication

## 📈 Analytics & Reporting

### Dashboard Metrics

- **User Statistics**: Total, active, and new users
- **Revenue Metrics**: Subscription revenue and growth
- **Content Performance**: Views, engagement, and effectiveness
- **System Health**: Server performance and uptime

### Detailed Reports

- **User Growth**: Registration and activity trends
- **Revenue Analysis**: Subscription and payment analytics
- **Content Analytics**: Most popular content and engagement
- **Trading Performance**: EA and signal performance metrics

## 🛡️ Security Best Practices

### Admin Account Security

1. **Change Default Password**: Immediately after setup
2. **Use Strong Passwords**: Complex passwords with special characters
3. **Enable 2FA**: Two-factor authentication when available
4. **Regular Password Updates**: Change passwords regularly
5. **Monitor Login Activity**: Review login logs regularly

### System Security

1. **Keep Updated**: Regular system and dependency updates
2. **Monitor Logs**: Review activity logs for suspicious behavior
3. **Backup Regularly**: Automated and manual backups
4. **Access Control**: Limit admin access to necessary personnel
5. **Network Security**: Use HTTPS and secure connections

## 🔧 Troubleshooting

### Common Issues

#### 1. Cannot Access Admin Panel
**Problem**: 404 error when accessing `/admin`
**Solution**: 
- Ensure server is running
- Check that admin routes are properly configured
- Verify admin user exists in database

#### 2. Login Issues
**Problem**: Cannot login with admin credentials
**Solution**:
- Verify admin user exists: Check database
- Reset password if needed
- Check JWT secret configuration

#### 3. Database Connection Issues
**Problem**: Database connection errors
**Solution**:
- Verify Supabase credentials in `.env`
- Check Supabase project status
- Ensure database tables exist

#### 4. Permission Errors
**Problem**: Access denied errors
**Solution**:
- Verify user role is set to 'admin'
- Check RLS policies in Supabase
- Ensure proper authentication headers

### Getting Help

1. **Check Logs**: Review server and browser console logs
2. **Verify Configuration**: Double-check environment variables
3. **Database Status**: Ensure Supabase connection is working
4. **Dependencies**: Verify all npm packages are installed

## 🔄 Maintenance

### Regular Tasks

1. **Monitor System Health**: Check dashboard metrics daily
2. **Review Activity Logs**: Weekly review of user activities
3. **Update Content**: Keep content fresh and relevant
4. **Backup Data**: Regular database backups
5. **Security Review**: Monthly security assessment

### Updates

1. **Dependency Updates**: Regular npm package updates
2. **Feature Updates**: Deploy new admin features
3. **Security Patches**: Apply security updates promptly
4. **Performance Optimization**: Monitor and optimize performance

## 📚 API Documentation

### Admin API Endpoints

```
GET    /api/admin/dashboard     - Dashboard statistics
GET    /api/admin/users         - User management
POST   /api/admin/users         - Create user
PUT    /api/admin/users/:id     - Update user
DELETE /api/admin/users/:id     - Delete user

GET    /api/admin/content       - Content management
POST   /api/admin/content       - Create content
PUT    /api/admin/content/:id   - Update content
DELETE /api/admin/content/:id   - Delete content

GET    /api/admin/settings      - System settings
PUT    /api/admin/settings      - Update settings
GET    /api/admin/analytics     - Analytics data
GET    /api/admin/activity      - Activity logs
POST   /api/admin/backup        - Create backup
```

### Authentication

All admin API endpoints require authentication:

```javascript
headers: {
  'Authorization': 'Bearer <jwt_token>',
  'Content-Type': 'application/json'
}
```

## 🤝 Contributing

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Standards

- Use ESLint for code formatting
- Follow existing code patterns
- Add comments for complex logic
- Write tests for new features
- Update documentation

## 📄 License

This admin panel is part of the Smart Algos Trading Platform and is subject to the same licensing terms.

## 🆘 Support

For support and questions:

1. **Documentation**: Check this README and inline documentation
2. **Logs**: Review system logs for error details
3. **Community**: Join our developer community
4. **Support**: Contact technical support team

---

**Smart Algos Trading Platform Admin Panel** - Empowering administrators with comprehensive system management tools.
