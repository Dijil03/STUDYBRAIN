import mongoose from 'mongoose';
import crypto from 'crypto';

// Certificate Template Schema - defines the types of certificates available
const certificateTemplateSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['assessment', 'subject', 'milestone', 'achievement'],
        required: true
    },
    passingCriteria: {
        minScore: {
            type: Number,
            default: 70 // Minimum percentage to earn certificate
        },
        assessmentType: String, // Optional: specific assessment type required
        subject: String // Optional: specific subject
    },
    design: {
        template: {
            type: String,
            default: 'standard'
        },
        color: {
            type: String,
            default: '#6366f1' // indigo-500
        },
        icon: {
            type: String,
            default: 'award'
        }
    },
    level: {
        type: String,
        enum: ['bronze', 'silver', 'gold', 'platinum'],
        default: 'bronze'
    },
    scoreRanges: {
        type: mongoose.Schema.Types.Mixed,
        default: {
            bronze: { min: 70, max: 79 },
            silver: { min: 80, max: 89 },
            gold: { min: 90, max: 99 },
            platinum: { min: 100, max: 100 }
        }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// User Certificate Schema - tracks earned certificates
const userCertificateSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    certificateId: {
        type: String,
        required: true,
        unique: true // Unique certificate instance ID (UUID)
    },
    templateId: {
        type: String,
        required: true
    },

    // Achievement details
    achievement: {
        assessmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Assessment'
        },
        assessmentName: {
            type: String,
            required: true
        },
        subject: String,
        score: {
            type: Number,
            required: true
        },
        totalQuestions: {
            type: Number,
            required: true
        },
        percentage: {
            type: Number,
            required: true
        }
    },

    // Certificate details
    certificateData: {
        userName: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        level: {
            type: String,
            enum: ['bronze', 'silver', 'gold', 'platinum'],
            required: true
        },
        completionDate: {
            type: Date,
            required: true,
            default: Date.now
        }
    },

    // Verification system
    verification: {
        hash: {
            type: String,
            required: true // SHA-256 hash for verification
        },
        qrCode: String, // Base64 encoded QR code
        verificationUrl: String,
        isVerified: {
            type: Boolean,
            default: true
        }
    },

    // Status and metadata
    status: {
        type: String,
        enum: ['active', 'revoked', 'expired'],
        default: 'active'
    },
    earnedAt: {
        type: Date,
        default: Date.now
    },
    viewCount: {
        type: Number,
        default: 0
    },
    lastViewed: Date,

    // PDF generation tracking
    pdfGenerated: {
        type: Boolean,
        default: false
    },
    pdfGeneratedAt: Date

}, {
    timestamps: true
});

// Indexes for efficient queries
userCertificateSchema.index({ userId: 1, earnedAt: -1 });
// Note: certificateId index is automatically created by unique: true
userCertificateSchema.index({ 'verification.hash': 1 });
userCertificateSchema.index({ templateId: 1 });

// Methods
userCertificateSchema.methods.generateVerificationHash = function () {
    const data = `${this.userId}-${this.certificateId}-${this.achievement.score}-${this.earnedAt.toISOString()}`;
    return crypto.createHash('sha256').update(data).digest('hex');
};

userCertificateSchema.methods.incrementViewCount = function () {
    this.viewCount += 1;
    this.lastViewed = new Date();
    return this.save();
};

// Static methods
userCertificateSchema.statics.findByVerificationId = function (certificateId) {
    return this.findOne({
        certificateId: certificateId,
        status: 'active'
    }).populate('achievement.assessmentId');
};

userCertificateSchema.statics.getUserCertificates = function (userId, options = {}) {
    const query = { userId, status: 'active' };

    if (options.level) {
        query['certificateData.level'] = options.level;
    }

    if (options.subject) {
        query['achievement.subject'] = options.subject;
    }

    return this.find(query)
        .sort({ earnedAt: -1 })
        .limit(options.limit || 0)
        .populate('achievement.assessmentId');
};

const CertificateTemplate = mongoose.model('CertificateTemplate', certificateTemplateSchema);
const UserCertificate = mongoose.model('UserCertificate', userCertificateSchema);

export { CertificateTemplate, UserCertificate };
