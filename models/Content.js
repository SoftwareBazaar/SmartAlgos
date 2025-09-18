/**
 * Content Management Model
 * Handles all content types: news, blogs, guides, announcements, FAQs
 */

const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    excerpt: {
        type: String,
        maxlength: 500
    },
    type: {
        type: String,
        enum: ['news', 'blog', 'announcement', 'guide', 'faq', 'tutorial', 'update'],
        required: true,
        default: 'blog'
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived', 'scheduled'],
        default: 'draft'
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        enum: ['trading', 'technical', 'market-analysis', 'platform', 'education', 'general'],
        default: 'general'
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    image: {
        type: String, // filename for uploaded image
        default: null
    },
    images: [{ // Additional images for content
        filename: String,
        caption: String,
        alt: String
    }],
    publishedAt: {
        type: Date,
        default: null
    },
    scheduledAt: {
        type: Date,
        default: null
    },
    featured: {
        type: Boolean,
        default: false
    },
    priority: {
        type: String,
        enum: ['low', 'normal', 'high', 'urgent'],
        default: 'normal'
    },
    seo: {
        metaTitle: {
            type: String,
            maxlength: 60
        },
        metaDescription: {
            type: String,
            maxlength: 160
        },
        keywords: [{
            type: String,
            trim: true
        }],
        canonicalUrl: String
    },
    readTime: {
        type: Number, // estimated read time in minutes
        default: 0
    },
    views: {
        type: Number,
        default: 0
    },
    likes: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        content: {
            type: String,
            required: true,
            maxlength: 1000
        },
        approved: {
            type: Boolean,
            default: false
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    }],
    relatedContent: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Content'
    }],
    attachments: [{
        filename: String,
        originalName: String,
        mimetype: String,
        size: Number,
        description: String
    }],
    visibility: {
        type: String,
        enum: ['public', 'members-only', 'premium-only', 'private'],
        default: 'public'
    },
    language: {
        type: String,
        default: 'en',
        enum: ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ar']
    },
    analytics: {
        impressions: { type: Number, default: 0 },
        clicks: { type: Number, default: 0 },
        shares: { type: Number, default: 0 },
        avgTimeOnPage: { type: Number, default: 0 },
        bounceRate: { type: Number, default: 0 }
    },
    versions: [{
        content: String,
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        changes: String // description of changes
    }],
    isTemplate: {
        type: Boolean,
        default: false
    },
    templateData: {
        variables: mongoose.Schema.Types.Mixed,
        defaultValues: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
contentSchema.index({ slug: 1 }, { unique: true });
contentSchema.index({ type: 1, status: 1 });
contentSchema.index({ author: 1 });
contentSchema.index({ publishedAt: -1 });
contentSchema.index({ featured: -1, publishedAt: -1 });
contentSchema.index({ tags: 1 });
contentSchema.index({ category: 1 });
contentSchema.index({ 'seo.keywords': 1 });
contentSchema.index({ title: 'text', content: 'text', excerpt: 'text' });

// Virtual for like count
contentSchema.virtual('likeCount').get(function() {
    return this.likes ? this.likes.length : 0;
});

// Virtual for comment count
contentSchema.virtual('commentCount').get(function() {
    return this.comments ? this.comments.filter(comment => comment.approved).length : 0;
});

// Virtual for reading time calculation
contentSchema.virtual('estimatedReadTime').get(function() {
    if (!this.content) return 0;
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
});

// Pre-save middleware
contentSchema.pre('save', function(next) {
    // Generate slug if not provided
    if (!this.slug && this.title) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
    }

    // Calculate read time
    if (this.content && !this.readTime) {
        const wordsPerMinute = 200;
        const wordCount = this.content.split(/\s+/).length;
        this.readTime = Math.ceil(wordCount / wordsPerMinute);
    }

    // Generate excerpt if not provided
    if (!this.excerpt && this.content) {
        // Remove HTML tags and get first 150 characters
        const plainText = this.content.replace(/<[^>]*>/g, '');
        this.excerpt = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');
    }

    // Auto-generate SEO meta if not provided
    if (!this.seo.metaTitle) {
        this.seo.metaTitle = this.title.substring(0, 60);
    }
    if (!this.seo.metaDescription && this.excerpt) {
        this.seo.metaDescription = this.excerpt.substring(0, 160);
    }

    // Set publishedAt when status changes to published
    if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
        this.publishedAt = new Date();
    }

    next();
});

// Static methods
contentSchema.statics.getPublished = function() {
    return this.find({ 
        status: 'published',
        publishedAt: { $lte: new Date() }
    }).sort({ publishedAt: -1 });
};

contentSchema.statics.getFeatured = function(limit = 5) {
    return this.find({ 
        status: 'published',
        featured: true,
        publishedAt: { $lte: new Date() }
    })
    .sort({ publishedAt: -1 })
    .limit(limit);
};

contentSchema.statics.getByCategory = function(category, limit = 10) {
    return this.find({ 
        status: 'published',
        category: category,
        publishedAt: { $lte: new Date() }
    })
    .sort({ publishedAt: -1 })
    .limit(limit);
};

contentSchema.statics.searchContent = function(query, options = {}) {
    const {
        type,
        category,
        tags,
        limit = 20,
        skip = 0
    } = options;

    const searchQuery = {
        status: 'published',
        publishedAt: { $lte: new Date() },
        $text: { $search: query }
    };

    if (type) searchQuery.type = type;
    if (category) searchQuery.category = category;
    if (tags && tags.length > 0) searchQuery.tags = { $in: tags };

    return this.find(searchQuery)
        .sort({ score: { $meta: 'textScore' }, publishedAt: -1 })
        .limit(limit)
        .skip(skip);
};

// Instance methods
contentSchema.methods.incrementViews = function() {
    this.views += 1;
    this.analytics.impressions += 1;
    return this.save();
};

contentSchema.methods.addLike = function(userId) {
    const existingLike = this.likes.find(like => like.user.toString() === userId.toString());
    if (!existingLike) {
        this.likes.push({ user: userId });
        return this.save();
    }
    return Promise.resolve(this);
};

contentSchema.methods.removeLike = function(userId) {
    this.likes = this.likes.filter(like => like.user.toString() !== userId.toString());
    return this.save();
};

contentSchema.methods.addComment = function(userId, content) {
    this.comments.push({
        user: userId,
        content: content,
        approved: false // Comments need approval by default
    });
    return this.save();
};

contentSchema.methods.approveComment = function(commentId) {
    const comment = this.comments.id(commentId);
    if (comment) {
        comment.approved = true;
        return this.save();
    }
    return Promise.resolve(this);
};

contentSchema.methods.createVersion = function(userId, changes = '') {
    this.versions.push({
        content: this.content,
        author: userId,
        changes: changes
    });
    return this.save();
};

contentSchema.methods.getRelatedContent = function(limit = 5) {
    return this.constructor.find({
        _id: { $ne: this._id },
        status: 'published',
        $or: [
            { category: this.category },
            { tags: { $in: this.tags } }
        ]
    })
    .limit(limit)
    .sort({ publishedAt: -1 });
};

module.exports = mongoose.model('Content', contentSchema);
