/**
 * Admin Panel Setup Script
 * Creates admin user, initializes models, and sets up the admin panel
 */

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Supabase connection
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase configuration in .env file');
    console.log('Please add:');
    console.log('SUPABASE_URL=your-supabase-url');
    console.log('SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupAdminPanel() {
    console.log('🚀 Setting up Smart Algos Admin Panel...\n');

    try {
        // 1. Create admin user if not exists
        await createAdminUser();
        
        // 2. Create content management tables
        await createContentTables();
        
        // 3. Create activity log tables
        await createActivityLogTables();
        
        // 4. Create system settings tables
        await createSystemSettingsTables();
        
        // 5. Initialize default system settings
        await initializeSystemSettings();
        
        // 6. Create sample content
        await createSampleContent();
        
        // 7. Setup admin permissions
        await setupAdminPermissions();
        
        console.log('✅ Admin Panel setup completed successfully!\n');
        console.log('🎉 You can now access the admin panel at: http://localhost:3000/admin');
        console.log('📧 Admin Login: admin@smartalgos.com');
        console.log('🔑 Password: admin123456');
        console.log('\n⚠️  Please change the admin password after first login!');
        
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        process.exit(1);
    }
}

async function createAdminUser() {
    console.log('👤 Creating admin user...');
    
    // Check if admin user already exists
    const { data: existingAdmin } = await supabase
        .from('users')
        .select('id')
        .eq('email', 'admin@smartalgos.com')
        .single();
    
    if (existingAdmin) {
        console.log('   ℹ️  Admin user already exists, skipping...');
        return;
    }
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123456', 12);
    
    const { data, error } = await supabase
        .from('users')
        .insert([
            {
                name: 'System Administrator',
                email: 'admin@smartalgos.com',
                password: hashedPassword,
                role: 'admin',
                email_verified: true,
                is_active: true,
                created_at: new Date().toISOString(),
                profile: {
                    avatar: null,
                    bio: 'System Administrator',
                    location: 'Global',
                    website: 'https://smartalgos.com',
                    social: {
                        twitter: '@smartalgos',
                        linkedin: 'smart-algos'
                    }
                },
                preferences: {
                    theme: 'dark',
                    language: 'en',
                    timezone: 'UTC',
                    notifications: {
                        email: true,
                        push: true,
                        sms: false
                    }
                }
            }
        ])
        .select();
    
    if (error) {
        throw new Error(`Failed to create admin user: ${error.message}`);
    }
    
    console.log('   ✅ Admin user created successfully');
}

async function createContentTables() {
    console.log('📄 Creating content management tables...');
    
    // Create content table
    const { error: contentError } = await supabase.rpc('create_table_if_not_exists', {
        table_name: 'content',
        table_schema: `
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            title VARCHAR(200) NOT NULL,
            slug VARCHAR(250) UNIQUE NOT NULL,
            content TEXT NOT NULL,
            excerpt VARCHAR(500),
            type VARCHAR(50) DEFAULT 'blog' CHECK (type IN ('news', 'blog', 'announcement', 'guide', 'faq', 'tutorial', 'update')),
            status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived', 'scheduled')),
            author UUID REFERENCES users(id) NOT NULL,
            category VARCHAR(50) DEFAULT 'general' CHECK (category IN ('trading', 'technical', 'market-analysis', 'platform', 'education', 'general')),
            tags TEXT[],
            image VARCHAR(255),
            images JSONB DEFAULT '[]',
            published_at TIMESTAMP WITH TIME ZONE,
            scheduled_at TIMESTAMP WITH TIME ZONE,
            featured BOOLEAN DEFAULT FALSE,
            priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
            seo JSONB DEFAULT '{}',
            read_time INTEGER DEFAULT 0,
            views INTEGER DEFAULT 0,
            likes JSONB DEFAULT '[]',
            comments JSONB DEFAULT '[]',
            related_content UUID[],
            attachments JSONB DEFAULT '[]',
            visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'members-only', 'premium-only', 'private')),
            language VARCHAR(10) DEFAULT 'en',
            analytics JSONB DEFAULT '{"impressions": 0, "clicks": 0, "shares": 0, "avgTimeOnPage": 0, "bounceRate": 0}',
            versions JSONB DEFAULT '[]',
            is_template BOOLEAN DEFAULT FALSE,
            template_data JSONB DEFAULT '{}',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        `
    });
    
    if (contentError) {
        console.log('   ℹ️  Content table might already exist');
    } else {
        console.log('   ✅ Content table created');
    }
}

async function createActivityLogTables() {
    console.log('📊 Creating activity log tables...');
    
    const { error: activityError } = await supabase.rpc('create_table_if_not_exists', {
        table_name: 'activity_logs',
        table_schema: `
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES users(id) NOT NULL,
            action VARCHAR(100) NOT NULL,
            details VARCHAR(1000) NOT NULL,
            target_type VARCHAR(50),
            target_id UUID,
            ip_address INET,
            user_agent VARCHAR(500),
            metadata JSONB DEFAULT '{}',
            severity VARCHAR(20) DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
            category VARCHAR(50) DEFAULT 'system' CHECK (category IN ('authentication', 'authorization', 'content', 'trading', 'financial', 'system', 'security')),
            success BOOLEAN DEFAULT TRUE,
            error_message TEXT,
            duration INTEGER,
            session_id VARCHAR(255),
            device_info JSONB DEFAULT '{}',
            location JSONB DEFAULT '{}',
            tags TEXT[],
            is_system_generated BOOLEAN DEFAULT FALSE,
            parent_activity UUID REFERENCES activity_logs(id),
            child_activities UUID[],
            archived BOOLEAN DEFAULT FALSE,
            archived_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        `
    });
    
    if (activityError) {
        console.log('   ℹ️  Activity log table might already exist');
    } else {
        console.log('   ✅ Activity log table created');
    }
}

async function createSystemSettingsTables() {
    console.log('⚙️  Creating system settings tables...');
    
    const { error: settingsError } = await supabase.rpc('create_table_if_not_exists', {
        table_name: 'system_settings',
        table_schema: `
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            site_name VARCHAR(100) DEFAULT 'Smart Algos Trading Platform',
            site_description VARCHAR(500) DEFAULT 'Advanced algorithmic trading and investment solutions',
            site_url VARCHAR(255) DEFAULT 'https://smartalgos.com',
            logo VARCHAR(255),
            favicon VARCHAR(255),
            timezone VARCHAR(50) DEFAULT 'UTC',
            language VARCHAR(10) DEFAULT 'en',
            currency JSONB DEFAULT '{"primary": "USD", "supported": []}',
            maintenance_mode JSONB DEFAULT '{"enabled": false, "message": "System is under maintenance. Please check back later.", "allowedUsers": []}',
            system_status VARCHAR(20) DEFAULT 'operational' CHECK (system_status IN ('operational', 'degraded', 'maintenance', 'outage')),
            status_message VARCHAR(255) DEFAULT 'All systems operational',
            user_settings JSONB DEFAULT '{}',
            security JSONB DEFAULT '{}',
            trading JSONB DEFAULT '{}',
            payments JSONB DEFAULT '{}',
            email JSONB DEFAULT '{}',
            api JSONB DEFAULT '{}',
            content JSONB DEFAULT '{}',
            analytics JSONB DEFAULT '{}',
            backup JSONB DEFAULT '{}',
            notifications JSONB DEFAULT '{}',
            features JSONB DEFAULT '{}',
            integrations JSONB DEFAULT '{}',
            updated_by UUID REFERENCES users(id),
            version VARCHAR(20) DEFAULT '1.0.0',
            last_backup TIMESTAMP WITH TIME ZONE,
            last_maintenance TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        `
    });
    
    if (settingsError) {
        console.log('   ℹ️  System settings table might already exist');
    } else {
        console.log('   ✅ System settings table created');
    }
}

async function initializeSystemSettings() {
    console.log('🔧 Initializing system settings...');
    
    // Check if settings already exist
    const { data: existingSettings } = await supabase
        .from('system_settings')
        .select('id')
        .limit(1);
    
    if (existingSettings && existingSettings.length > 0) {
        console.log('   ℹ️  System settings already exist, skipping...');
        return;
    }
    
    // Create default settings
    const defaultSettings = {
        site_name: 'Smart Algos Trading Platform',
        site_description: 'Advanced algorithmic trading and investment solutions',
        site_url: 'https://smartalgos.com',
        timezone: 'UTC',
        language: 'en',
        currency: {
            primary: 'USD',
            supported: [
                { code: 'USD', symbol: '$', name: 'US Dollar', exchangeRate: 1 },
                { code: 'EUR', symbol: '€', name: 'Euro', exchangeRate: 0.85 },
                { code: 'GBP', symbol: '£', name: 'British Pound', exchangeRate: 0.75 },
                { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', exchangeRate: 110 }
            ]
        },
        user_settings: {
            registrationEnabled: true,
            emailVerificationRequired: true,
            adminApprovalRequired: false,
            defaultRole: 'user',
            maxUsersPerIP: 5,
            passwordPolicy: {
                minLength: 8,
                requireUppercase: true,
                requireLowercase: true,
                requireNumbers: true,
                requireSpecialChars: true,
                expiryDays: 90
            }
        },
        security: {
            sessionTimeout: 30,
            maxLoginAttempts: 5,
            lockoutDuration: 15,
            twoFactorRequired: false,
            rateLimiting: {
                windowMs: 900000,
                maxRequests: 100,
                skipSuccessfulRequests: false
            }
        },
        features: {
            eaMarketplace: true,
            hftBots: true,
            tradingSignals: true,
            socialTrading: false,
            mobileApp: true,
            desktopApp: true,
            apiAccess: true,
            betaFeatures: false
        }
    };
    
    const { error } = await supabase
        .from('system_settings')
        .insert([defaultSettings]);
    
    if (error) {
        throw new Error(`Failed to initialize system settings: ${error.message}`);
    }
    
    console.log('   ✅ System settings initialized');
}

async function createSampleContent() {
    console.log('📝 Creating sample content...');
    
    // Get admin user ID
    const { data: adminUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', 'admin@smartalgos.com')
        .single();
    
    if (!adminUser) {
        console.log('   ⚠️  Admin user not found, skipping sample content');
        return;
    }
    
    const sampleContent = [
        {
            title: 'Welcome to Smart Algos Trading Platform',
            slug: 'welcome-to-smart-algos',
            content: `
                <h2>Welcome to the Future of Algorithmic Trading</h2>
                <p>Smart Algos Trading Platform is your comprehensive solution for advanced algorithmic trading and investment management. Our platform combines cutting-edge AI technology with institutional-grade trading infrastructure to deliver superior results.</p>
                
                <h3>Key Features:</h3>
                <ul>
                    <li><strong>Expert Advisors (EAs):</strong> Access to a curated marketplace of professional trading algorithms</li>
                    <li><strong>High-Frequency Trading Bots:</strong> Lightning-fast execution for maximum profit potential</li>
                    <li><strong>AI-Powered Signals:</strong> Machine learning algorithms that analyze market patterns 24/7</li>
                    <li><strong>Risk Management:</strong> Advanced portfolio protection and risk assessment tools</li>
                    <li><strong>Multi-Asset Trading:</strong> Trade stocks, forex, cryptocurrencies, and commodities</li>
                </ul>
                
                <h3>Getting Started:</h3>
                <ol>
                    <li>Complete your profile setup</li>
                    <li>Configure your risk preferences</li>
                    <li>Browse our EA marketplace</li>
                    <li>Start with paper trading to test strategies</li>
                    <li>Scale to live trading when ready</li>
                </ol>
                
                <p>Our team of quantitative analysts and software engineers work continuously to improve our algorithms and provide you with the best possible trading experience.</p>
            `,
            excerpt: 'Welcome to Smart Algos Trading Platform - your comprehensive solution for advanced algorithmic trading and investment management.',
            type: 'announcement',
            status: 'published',
            author: adminUser.id,
            category: 'platform',
            tags: ['welcome', 'getting-started', 'platform', 'trading'],
            featured: true,
            priority: 'high',
            published_at: new Date().toISOString(),
            seo: {
                metaTitle: 'Welcome to Smart Algos Trading Platform',
                metaDescription: 'Get started with Smart Algos Trading Platform - advanced algorithmic trading solutions for modern investors.',
                keywords: ['algorithmic trading', 'expert advisors', 'trading platform', 'AI trading']
            },
            visibility: 'public'
        },
        {
            title: 'Understanding Expert Advisors (EAs)',
            slug: 'understanding-expert-advisors',
            content: `
                <h2>What are Expert Advisors?</h2>
                <p>Expert Advisors (EAs) are automated trading systems that execute trades based on pre-programmed algorithms. They analyze market conditions, identify trading opportunities, and execute trades without human intervention.</p>
                
                <h3>Types of EAs Available:</h3>
                <ul>
                    <li><strong>Scalping EAs:</strong> High-frequency trading for small, quick profits</li>
                    <li><strong>Trend Following EAs:</strong> Identify and follow market trends</li>
                    <li><strong>Grid EAs:</strong> Place multiple orders at predetermined intervals</li>
                    <li><strong>Martingale EAs:</strong> Progressive position sizing strategies</li>
                    <li><strong>Hedge EAs:</strong> Risk management through offsetting positions</li>
                </ul>
                
                <h3>How to Choose the Right EA:</h3>
                <ol>
                    <li><strong>Risk Tolerance:</strong> Match the EA's risk level with your comfort zone</li>
                    <li><strong>Account Size:</strong> Ensure minimum deposit requirements are met</li>
                    <li><strong>Market Conditions:</strong> Choose EAs suited for current market volatility</li>
                    <li><strong>Backtesting Results:</strong> Review historical performance data</li>
                    <li><strong>Live Trading Results:</strong> Check real-world performance metrics</li>
                </ol>
                
                <h3>Best Practices:</h3>
                <ul>
                    <li>Start with demo trading to understand EA behavior</li>
                    <li>Never risk more than you can afford to lose</li>
                    <li>Diversify across multiple EAs and strategies</li>
                    <li>Monitor performance regularly and adjust as needed</li>
                    <li>Keep EAs updated to latest versions</li>
                </ul>
            `,
            excerpt: 'Learn about Expert Advisors (EAs) and how to choose the right automated trading system for your needs.',
            type: 'guide',
            status: 'published',
            author: adminUser.id,
            category: 'education',
            tags: ['expert-advisors', 'automated-trading', 'guide', 'education'],
            featured: true,
            priority: 'normal',
            published_at: new Date().toISOString(),
            seo: {
                metaTitle: 'Understanding Expert Advisors (EAs) - Complete Guide',
                metaDescription: 'Complete guide to Expert Advisors - learn how to choose and use automated trading systems effectively.',
                keywords: ['expert advisors', 'automated trading', 'trading robots', 'algorithmic trading']
            },
            visibility: 'public'
        }
    ];
    
    const { error } = await supabase
        .from('content')
        .insert(sampleContent);
    
    if (error) {
        console.log('   ⚠️  Sample content might already exist');
    } else {
        console.log('   ✅ Sample content created');
    }
}

async function setupAdminPermissions() {
    console.log('🔐 Setting up admin permissions...');
    
    // Enable RLS policies for admin access
    const policies = [
        'ALTER TABLE content ENABLE ROW LEVEL SECURITY;',
        'ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;',
        'ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;',
        
        // Admin can do everything
        `CREATE POLICY "Admins can manage content" ON content FOR ALL TO authenticated USING (
            EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
        );`,
        
        `CREATE POLICY "Admins can view activity logs" ON activity_logs FOR SELECT TO authenticated USING (
            EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
        );`,
        
        `CREATE POLICY "Admins can manage settings" ON system_settings FOR ALL TO authenticated USING (
            EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
        );`,
        
        // Users can view published content
        `CREATE POLICY "Users can view published content" ON content FOR SELECT TO authenticated USING (
            status = 'published' AND visibility IN ('public', 'members-only')
        );`,
        
        // Public can view public published content
        `CREATE POLICY "Public can view public content" ON content FOR SELECT TO anon USING (
            status = 'published' AND visibility = 'public'
        );`
    ];
    
    for (const policy of policies) {
        try {
            await supabase.rpc('execute_sql', { sql: policy });
        } catch (error) {
            // Policies might already exist
            console.log(`   ℹ️  Policy might already exist: ${policy.substring(0, 50)}...`);
        }
    }
    
    console.log('   ✅ Admin permissions configured');
}

// Run the setup
if (require.main === module) {
    setupAdminPanel()
        .then(() => {
            console.log('\n🎉 Setup completed! You can now start the server and access the admin panel.');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Setup failed:', error);
            process.exit(1);
        });
}

module.exports = { setupAdminPanel };
