import { CertificateTemplate, UserCertificate } from '../models/certificate.model.js';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

// Generate certificate for user upon assessment completion
export const generateCertificate = async (userId, assessmentData, userName) => {
    try {
        const { assessmentId, assessmentName, subject, score, totalQuestions } = assessmentData;
        const percentage = Math.round((score / totalQuestions) * 100);

        // Check if certificate already exists for this assessment
        const existingCert = await UserCertificate.findOne({
            userId,
            'achievement.assessmentId': assessmentId
        });

        if (existingCert) {
            console.log('Certificate already exists for this assessment');
            return existingCert;
        }

        // Determine certificate level based on percentage
        let level = 'bronze';
        if (percentage >= 100) level = 'platinum';
        else if (percentage >= 90) level = 'gold';
        else if (percentage >= 80) level = 'silver';
        else if (percentage >= 70) level = 'bronze';
        else {
            console.log('Score too low for certificate generation');
            return null; // Don't generate certificate for scores below 70%
        }

        // Generate unique certificate ID
        const certificateId = uuidv4();

        // Generate verification hash
        const verificationData = `${userId}-${certificateId}-${score}-${new Date().toISOString()}`;
        const hash = crypto.createHash('sha256').update(verificationData).digest('hex');

        // Create certificate
        const certificate = new UserCertificate({
            userId,
            certificateId,
            templateId: 'assessment-completion', // Default template

            achievement: {
                assessmentId,
                assessmentName,
                subject: subject || 'General',
                score,
                totalQuestions,
                percentage
            },

            certificateData: {
                userName,
                title: `Certificate of Achievement - ${assessmentName}`,
                description: `Successfully completed ${assessmentName} with a score of ${percentage}%`,
                level,
                completionDate: new Date()
            },

            verification: {
                hash,
                verificationUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/certificates/verify/${certificateId}`,
                isVerified: true
            },

            status: 'active',
            earnedAt: new Date()
        });

        await certificate.save();
        console.log(`Certificate generated successfully for user ${userId}`);
        return certificate;

    } catch (error) {
        console.error('Error generating certificate:', error);
        throw error;
    }
};

// Get all certificates for a user
export const getUserCertificates = async (req, res) => {
    try {
        const { userId } = req.params;
        const { level, subject, limit } = req.query;

        const options = {};
        if (level) options.level = level;
        if (subject) options.subject = subject;
        if (limit) options.limit = parseInt(limit);

        const certificates = await UserCertificate.getUserCertificates(userId, options);

        res.status(200).json({
            success: true,
            count: certificates.length,
            certificates
        });

    } catch (error) {
        console.error('Error fetching user certificates:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch certificates'
        });
    }
};

// Get specific certificate by ID
export const getCertificate = async (req, res) => {
    try {
        const { userId, certId } = req.params;

        const certificate = await UserCertificate.findOne({
            userId,
            certificateId: certId,
            status: 'active'
        }).populate('achievement.assessmentId');

        if (!certificate) {
            return res.status(404).json({
                success: false,
                error: 'Certificate not found'
            });
        }

        // Increment view count
        await certificate.incrementViewCount();

        res.status(200).json({
            success: true,
            certificate
        });

    } catch (error) {
        console.error('Error fetching certificate:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch certificate'
        });
    }
};

// Verify certificate by certificate ID (public endpoint)
export const verifyCertificate = async (req, res) => {
    try {
        const { certId } = req.params;

        const certificate = await UserCertificate.findByVerificationId(certId);

        if (!certificate) {
            return res.status(404).json({
                success: false,
                error: 'Certificate not found or invalid'
            });
        }

        // Return verification info (public data only)
        const verificationData = {
            certificateId: certificate.certificateId,
            userName: certificate.certificateData.userName,
            title: certificate.certificateData.title,
            description: certificate.certificateData.description,
            level: certificate.certificateData.level,
            completionDate: certificate.certificateData.completionDate,
            achievement: {
                assessmentName: certificate.achievement.assessmentName,
                subject: certificate.achievement.subject,
                percentage: certificate.achievement.percentage
            },
            earnedAt: certificate.earnedAt,
            isVerified: certificate.verification.isVerified,
            status: certificate.status
        };

        res.status(200).json({
            success: true,
            certificate: verificationData,
            verified: true
        });

    } catch (error) {
        console.error('Error verifying certificate:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to verify certificate'
        });
    }
};

// Get certificate statistics for user
export const getCertificateStats = async (req, res) => {
    try {
        const { userId } = req.params;

        const certificates = await UserCertificate.find({
            userId,
            status: 'active'
        });

        const stats = {
            total: certificates.length,
            byLevel: {
                bronze: certificates.filter(c => c.certificateData.level === 'bronze').length,
                silver: certificates.filter(c => c.certificateData.level === 'silver').length,
                gold: certificates.filter(c => c.certificateData.level === 'gold').length,
                platinum: certificates.filter(c => c.certificateData.level === 'platinum').length
            },
            bySubject: {},
            recent: certificates
                .sort((a, b) => b.earnedAt - a.earnedAt)
                .slice(0, 3)
                .map(cert => ({
                    certificateId: cert.certificateId,
                    title: cert.certificateData.title,
                    level: cert.certificateData.level,
                    earnedAt: cert.earnedAt,
                    subject: cert.achievement.subject
                }))
        };

        // Group by subject
        certificates.forEach(cert => {
            const subject = cert.achievement.subject || 'General';
            stats.bySubject[subject] = (stats.bySubject[subject] || 0) + 1;
        });

        res.status(200).json({
            success: true,
            stats
        });

    } catch (error) {
        console.error('Error fetching certificate stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch certificate statistics'
        });
    }
};

// Delete/revoke certificate (admin function)
export const revokeCertificate = async (req, res) => {
    try {
        const { userId, certId } = req.params;

        const certificate = await UserCertificate.findOne({
            userId,
            certificateId: certId
        });

        if (!certificate) {
            return res.status(404).json({
                success: false,
                error: 'Certificate not found'
            });
        }

        certificate.status = 'revoked';
        certificate.verification.isVerified = false;
        await certificate.save();

        res.status(200).json({
            success: true,
            message: 'Certificate revoked successfully'
        });

    } catch (error) {
        console.error('Error revoking certificate:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to revoke certificate'
        });
    }
};

// Get certificate for PDF generation
export const getCertificateForPDF = async (req, res) => {
    try {
        const { userId, certId } = req.params;

        const certificate = await UserCertificate.findOne({
            userId,
            certificateId: certId,
            status: 'active'
        });

        if (!certificate) {
            return res.status(404).json({
                success: false,
                error: 'Certificate not found'
            });
        }

        // Mark as PDF generated
        certificate.pdfGenerated = true;
        certificate.pdfGeneratedAt = new Date();
        await certificate.save();

        res.status(200).json({
            success: true,
            certificate: {
                ...certificate.toObject(),
                // Add QR code data URL for PDF
                qrCodeUrl: certificate.verification.verificationUrl
            }
        });

    } catch (error) {
        console.error('Error preparing certificate for PDF:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to prepare certificate for PDF'
        });
    }
};


