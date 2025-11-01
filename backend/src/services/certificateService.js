import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Certificate PDF generation service
export class CertificateService {

    static async generateCertificatePDF(certificateData) {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                layout: 'landscape',
                margins: { top: 30, bottom: 30, left: 30, right: 30 }
            });

            // Certificate styling constants
            const pageWidth = doc.page.width - 60;
            const pageHeight = doc.page.height - 60;
            const centerX = doc.page.width / 2;

            // Generate QR code for verification
            const qrCodeDataUrl = await QRCode.toDataURL(certificateData.verification.verificationUrl, {
                errorCorrectionLevel: 'H',
                type: 'image/png',
                quality: 0.95,
                margin: 1,
                width: 120,
                color: {
                    dark: '#1f2937',
                    light: '#ffffff'
                }
            });

            // Convert base64 to buffer
            const qrCodeBuffer = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');

            // Draw certificate background and borders
            this.drawCertificateBackground(doc, pageWidth, pageHeight);

            // Draw decorative elements
            this.drawDecorativeElements(doc, pageWidth, pageHeight);

            // Header section with institution branding
            this.drawEnhancedHeader(doc, centerX);

            // Certificate title with elegant styling
            this.drawEnhancedCertificateTitle(doc, centerX, certificateData.certificateData.title);

            // Level badge with premium styling
            this.drawEnhancedLevelBadge(doc, certificateData.certificateData.level, centerX);

            // Recipient section with elegant typography
            this.drawEnhancedRecipientSection(doc, centerX, certificateData.certificateData.userName);

            // Achievement details with professional layout
            this.drawEnhancedAchievementDetails(doc, centerX, certificateData);

            // Authenticity seals and stamps
            this.drawAuthenticitySeals(doc, pageWidth, pageHeight);

            // Footer with signatures and verification
            this.drawEnhancedFooter(doc, certificateData, pageWidth, pageHeight);

            // QR Code for verification with styling
            this.drawVerificationQR(doc, qrCodeBuffer, pageWidth, pageHeight);

            // Certificate ID with security styling
            this.drawCertificateID(doc, certificateData.certificateId, pageWidth, pageHeight);

            return doc;

        } catch (error) {
            console.error('Error generating certificate PDF:', error);
            throw error;
        }
    }

    static drawCertificateBackground(doc, pageWidth, pageHeight) {
        // Main background with gradient effect (simulated)
        doc.fillColor('#f8fafc')
            .rect(30, 30, pageWidth, pageHeight)
            .fill();

        // Premium outer border - double line
        doc.strokeColor('#1e293b')
            .lineWidth(4)
            .rect(30, 30, pageWidth, pageHeight)
            .stroke();

        doc.strokeColor('#334155')
            .lineWidth(2)
            .rect(35, 35, pageWidth - 10, pageHeight - 10)
            .stroke();

        // Inner elegant border with red accent
        doc.strokeColor('#dc2626')
            .lineWidth(1)
            .rect(45, 45, pageWidth - 30, pageHeight - 30)
            .stroke();

        // Decorative inner frame
        doc.strokeColor('#e2e8f0')
            .lineWidth(0.5)
            .rect(50, 50, pageWidth - 40, pageHeight - 40)
            .stroke();
    }

    static drawDecorativeElements(doc, pageWidth, pageHeight) {
        // Corner ornaments - more elegant design
        const cornerSize = 25;
        const corners = [
            { x: 40, y: 40 },
            { x: pageWidth - 15, y: 40 },
            { x: 40, y: pageHeight + 5 },
            { x: pageWidth - 15, y: pageHeight + 5 }
        ];

        corners.forEach((corner, index) => {
            // Draw ornamental corner designs with red accent
            doc.strokeColor('#dc2626') // Red color
                .lineWidth(2);

            // Create decorative corner pattern
            const size = cornerSize;
            if (index % 2 === 0) {
                // Top-left and bottom-left style
                doc.moveTo(corner.x, corner.y + size)
                    .lineTo(corner.x, corner.y)
                    .lineTo(corner.x + size, corner.y)
                    .stroke();
            } else {
                // Top-right and bottom-right style  
                doc.moveTo(corner.x - size, corner.y)
                    .lineTo(corner.x, corner.y)
                    .lineTo(corner.x, corner.y + size)
                    .stroke();
            }

            // Add small red decorative elements
            doc.fillColor('#dc2626')
                .circle(corner.x + (index % 2 === 0 ? 8 : -8), corner.y + 8, 4)
                .fill();
        });

        // Add decorative side borders
        const sideY = doc.page.height / 2;

        // Left side decoration
        doc.strokeColor('#e2e8f0')
            .lineWidth(1);
        for (let i = 0; i < 5; i++) {
            const y = sideY - 40 + (i * 20);
            doc.moveTo(35, y).lineTo(40, y).stroke();
        }

        // Right side decoration
        for (let i = 0; i < 5; i++) {
            const y = sideY - 40 + (i * 20);
            doc.moveTo(pageWidth + 25, y).lineTo(pageWidth + 30, y).stroke();
        }
    }

    static drawEnhancedHeader(doc, centerX) {
        // Institution logo placeholder (you can add actual logo later)
        const logoY = 70;
        doc.fillColor('#1e40af')
            .circle(centerX, logoY, 20)
            .fill();

        doc.fillColor('#ffffff')
            .fontSize(16)
            .font('Helvetica-Bold')
            .text('BP', centerX - 10, logoY - 6);

        // Institution name with premium styling
        doc.fontSize(26)
            .fillColor('#1e293b')
            .font('Helvetica-Bold')
            .text('BrainPlatform Learning Institute', 0, 110, {
                align: 'center',
                width: doc.page.width
            });

        // Decorative line under institution name with red accent
        const lineY = 140;
        doc.strokeColor('#dc2626')
            .lineWidth(3)
            .moveTo(centerX - 150, lineY)
            .lineTo(centerX + 150, lineY)
            .stroke();

        // Subtitle with elegant typography
        doc.fontSize(16)
            .fillColor('#b91c1c')
            .font('Helvetica-Bold')
            .text('Certificate of Achievement', 0, 150, {
                align: 'center',
                width: doc.page.width
            });

        // Add red decorative elements
        doc.fillColor('#dc2626')
            .circle(centerX - 160, lineY, 4)
            .fill()
            .circle(centerX + 160, lineY, 4)
            .fill();
    }

    static drawEnhancedCertificateTitle(doc, centerX, title) {
        const titleY = 180;

        // Title background with subtle styling
        doc.fillColor('#f1f5f9')
            .rect(centerX - 200, titleY - 10, 400, 50)
            .fill();

        doc.strokeColor('#e2e8f0')
            .lineWidth(1)
            .rect(centerX - 200, titleY - 10, 400, 50)
            .stroke();

        // Certificate title with red gradient effect (simulated with color)
        doc.fontSize(34)
            .fillColor('#dc2626')
            .font('Helvetica-Bold')
            .text(title, 0, titleY, { align: 'center', width: doc.page.width });
    }

    static drawEnhancedLevelBadge(doc, level, centerX) {
        const levelColors = {
            bronze: { bg: '#cd7f32', accent: '#8b5a2b', text: '#ffffff' },
            silver: { bg: '#c0c0c0', accent: '#808080', text: '#000000' },
            gold: { bg: '#ffd700', accent: '#b8860b', text: '#000000' },
            platinum: { bg: '#e5e4e2', accent: '#989898', text: '#000000' }
        };

        const color = levelColors[level] || levelColors.bronze;
        const badgeX = centerX - 80;
        const badgeY = 240;
        const badgeWidth = 160;
        const badgeHeight = 45;

        // Badge shadow
        doc.fillColor('#00000020')
            .rect(badgeX + 3, badgeY + 3, badgeWidth, badgeHeight)
            .fill();

        // Badge background with gradient effect
        doc.fillColor(color.bg)
            .rect(badgeX, badgeY, badgeWidth, badgeHeight)
            .fill();

        // Badge border
        doc.strokeColor(color.accent)
            .lineWidth(2)
            .rect(badgeX, badgeY, badgeWidth, badgeHeight)
            .stroke();

        // Badge text with better alignment
        doc.fontSize(16)
            .fillColor(color.text)
            .font('Helvetica-Bold')
            .text(`${level.toUpperCase()} LEVEL`, badgeX, badgeY + 15, {
                width: badgeWidth,
                align: 'center'
            });
    }

    static drawEnhancedRecipientSection(doc, centerX, userName) {
        const certifyY = 310;
        const nameY = 340;

        // "This is to certify that" text with better spacing
        doc.fontSize(18)
            .fillColor('#475569')
            .font('Helvetica-Oblique')
            .text('This is to certify that', 0, certifyY, {
                align: 'center',
                width: doc.page.width
            });

        // Recipient name with elegant styling
        doc.fontSize(32)
            .fillColor('#1e293b')
            .font('Helvetica-Bold')
            .text(userName, 0, nameY, {
                align: 'center',
                width: doc.page.width
            });

        // Elegant underline with decorative elements
        const nameWidth = doc.widthOfString(userName, { fontSize: 32 });
        const nameStartX = centerX - nameWidth / 2;
        const underlineY = nameY + 40;

        // Main underline with red accent
        doc.strokeColor('#dc2626')
            .lineWidth(3)
            .moveTo(nameStartX - 20, underlineY)
            .lineTo(nameStartX + nameWidth + 20, underlineY)
            .stroke();

        // Red decorative dots
        doc.fillColor('#dc2626')
            .circle(nameStartX - 25, underlineY, 5)
            .fill()
            .circle(nameStartX + nameWidth + 25, underlineY, 5)
            .fill();
    }

    static drawEnhancedAchievementDetails(doc, centerX, certificateData) {
        const { achievement, certificateData: certData } = certificateData;
        let currentY = 400;

        // Achievement description
        doc.fontSize(18)
            .fillColor('#475569')
            .font('Helvetica')
            .text('has successfully completed', 0, currentY, {
                align: 'center',
                width: doc.page.width
            });

        currentY += 35;

        // Assessment name with styling
        doc.fontSize(22)
            .fillColor('#1e293b')
            .font('Helvetica-Bold')
            .text(achievement.assessmentName, 0, currentY, {
                align: 'center',
                width: doc.page.width,
                lineGap: 5
            });

        currentY += 35;

        // Subject information
        if (achievement.subject && achievement.subject !== 'General') {
            doc.fontSize(16)
                .fillColor('#64748b')
                .font('Helvetica-Oblique')
                .text(`in ${achievement.subject}`, 0, currentY, {
                    align: 'center',
                    width: doc.page.width
                });
            currentY += 30;
        }

        // Score details in a professional box
        const scoreBoxWidth = 300;
        const scoreBoxHeight = 60;
        const scoreBoxX = centerX - scoreBoxWidth / 2;
        const scoreBoxY = currentY;

        // Score box background
        doc.fillColor('#f0f9ff')
            .rect(scoreBoxX, scoreBoxY, scoreBoxWidth, scoreBoxHeight)
            .fill();

        doc.strokeColor('#0ea5e9')
            .lineWidth(2)
            .rect(scoreBoxX, scoreBoxY, scoreBoxWidth, scoreBoxHeight)
            .stroke();

        // Score text
        doc.fontSize(18)
            .fillColor('#0c4a6e')
            .font('Helvetica-Bold')
            .text(`Score: ${achievement.percentage}%`, scoreBoxX, scoreBoxY + 15, {
                width: scoreBoxWidth,
                align: 'center'
            });

        doc.fontSize(14)
            .fillColor('#0369a1')
            .font('Helvetica')
            .text(`(${achievement.score} out of ${achievement.totalQuestions} questions)`,
                scoreBoxX, scoreBoxY + 35, {
                width: scoreBoxWidth,
                align: 'center'
            });

        // Completion date with elegant styling
        const completionDate = new Date(certData.completionDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        doc.fontSize(16)
            .fillColor('#64748b')
            .font('Helvetica-Oblique')
            .text(`Completed on ${completionDate}`, 0, scoreBoxY + 80, {
                align: 'center',
                width: doc.page.width
            });
    }

    static drawAuthenticitySeals(doc, pageWidth, pageHeight) {
        // Official Seal (Left side)
        const sealX = 80;
        const sealY = pageHeight - 80;
        const sealRadius = 35;

        // Seal background
        doc.fillColor('#1e40af')
            .circle(sealX, sealY, sealRadius)
            .fill();

        // Outer ring
        doc.strokeColor('#ffffff')
            .lineWidth(2)
            .circle(sealX, sealY, sealRadius - 3)
            .stroke();

        // Inner ring
        doc.strokeColor('#ffffff')
            .lineWidth(1)
            .circle(sealX, sealY, sealRadius - 10)
            .stroke();

        // Seal text
        doc.fontSize(8)
            .fillColor('#ffffff')
            .font('Helvetica-Bold')
            .text('OFFICIAL', sealX - 15, sealY - 8, { width: 30, align: 'center' })
            .text('SEAL', sealX - 15, sealY + 2, { width: 30, align: 'center' });

        // Authentication Stamp (Right side) 
        const stampX = pageWidth - 50;
        const stampY = pageHeight - 80;
        const stampWidth = 100;
        const stampHeight = 60;

        // Stamp background
        doc.fillColor('#dc2626')
            .rect(stampX - stampWidth / 2, stampY - stampHeight / 2, stampWidth, stampHeight)
            .fill();

        // Stamp border (double line effect)
        doc.strokeColor('#ffffff')
            .lineWidth(3)
            .rect(stampX - stampWidth / 2 + 3, stampY - stampHeight / 2 + 3, stampWidth - 6, stampHeight - 6)
            .stroke();

        doc.strokeColor('#ffffff')
            .lineWidth(1)
            .rect(stampX - stampWidth / 2 + 8, stampY - stampHeight / 2 + 8, stampWidth - 16, stampHeight - 16)
            .stroke();

        // Stamp text
        doc.fontSize(10)
            .fillColor('#ffffff')
            .font('Helvetica-Bold')
            .text('VERIFIED', stampX - 25, stampY - 12, { width: 50, align: 'center' })
            .fontSize(8)
            .text('AUTHENTIC', stampX - 25, stampY + 2, { width: 50, align: 'center' });

        // Add date to stamp
        const currentDate = new Date().toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: '2-digit'
        });

        doc.fontSize(6)
            .text(currentDate, stampX - 25, stampY + 12, { width: 50, align: 'center' });

        // Security hologram simulation (decorative pattern) with red accent
        const hologramX = pageWidth - 150;
        const hologramY = 100;

        doc.strokeColor('#dc2626')
            .lineWidth(0.5);

        // Create a pattern that simulates a security hologram
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4;
            const x1 = hologramX + Math.cos(angle) * 15;
            const y1 = hologramY + Math.sin(angle) * 15;
            const x2 = hologramX + Math.cos(angle) * 25;
            const y2 = hologramY + Math.sin(angle) * 25;

            doc.moveTo(x1, y1).lineTo(x2, y2).stroke();
        }

        doc.fillColor('#dc2626')
            .circle(hologramX, hologramY, 8)
            .fill();

        doc.fontSize(6)
            .fillColor('#ffffff')
            .font('Helvetica-Bold')
            .text('SEC', hologramX - 6, hologramY - 2);
    }

    static drawEnhancedFooter(doc, certificateData, pageWidth, pageHeight) {
        const footerY = pageHeight - 30;

        // Signature section (left side)
        const signatureX = 120;

        // Signature line with red accent styling
        doc.strokeColor('#dc2626')
            .lineWidth(2)
            .moveTo(signatureX - 60, footerY - 15)
            .lineTo(signatureX + 60, footerY - 15)
            .stroke();

        // Authority signature title
        doc.fontSize(12)
            .fillColor('#dc2626')
            .font('Helvetica-Bold')
            .text('Brain Institute', signatureX - 60, footerY - 10, {
                width: 120,
                align: 'center'
            });

        doc.fontSize(9)
            .fillColor('#b91c1c')
            .font('Helvetica')
            .text('Official Authority', signatureX - 60, footerY + 5, {
                width: 120,
                align: 'center'
            });

        // Institution accreditation (center)
        const centerAccredX = pageWidth / 2;

        doc.fontSize(8)
            .fillColor('#64748b')
            .font('Helvetica-Oblique')
            .text('Accredited by Educational Standards Board', centerAccredX - 80, footerY - 5, {
                width: 160,
                align: 'center'
            });

        doc.fontSize(7)
            .fillColor('#94a3b8')
            .font('Helvetica')
            .text('Certificate No: ' + certificateData.certificateId, centerAccredX - 80, footerY + 8, {
                width: 160,
                align: 'center'
            });
    }

    static drawVerificationQR(doc, qrCodeBuffer, pageWidth, pageHeight) {
        const qrX = pageWidth - 85;
        const qrY = pageHeight - 130;
        const qrSize = 80;

        // QR code background
        doc.fillColor('#ffffff')
            .rect(qrX - 5, qrY - 5, qrSize + 10, qrSize + 10)
            .fill();

        doc.strokeColor('#e2e8f0')
            .lineWidth(2)
            .rect(qrX - 5, qrY - 5, qrSize + 10, qrSize + 10)
            .stroke();

        // Place QR code
        doc.image(qrCodeBuffer, qrX, qrY, { width: qrSize, height: qrSize });

        // QR code label
        doc.fontSize(8)
            .fillColor('#64748b')
            .font('Helvetica-Bold')
            .text('SCAN TO VERIFY', qrX - 5, qrY + qrSize + 10, {
                width: qrSize + 10,
                align: 'center'
            });

        doc.fontSize(7)
            .fillColor('#94a3b8')
            .font('Helvetica')
            .text('AUTHENTICITY', qrX - 5, qrY + qrSize + 22, {
                width: qrSize + 10,
                align: 'center'
            });
    }

    static drawCertificateID(doc, certificateId, pageWidth, pageHeight) {
        // Security watermark effect for certificate ID
        doc.fontSize(7)
            .fillColor('#e2e8f0')
            .font('Helvetica')
            .text(`ID: ${certificateId}`, 50, pageHeight + 15, {
                width: pageWidth - 100,
                align: 'left'
            });

        // Add issue date
        const issueDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        doc.text(`Issued: ${issueDate}`, 50, pageHeight + 25, {
            width: pageWidth - 100,
            align: 'left'
        });

        // Security notice
        doc.fontSize(6)
            .fillColor('#94a3b8')
            .font('Helvetica-Oblique')
            .text('This certificate contains security features to prevent forgery. Verify authenticity at brainplatform.com/verify',
                50, pageHeight + 35, {
                width: pageWidth - 200,
                align: 'left'
            });
    }

    static async savePDFToBuffer(doc) {
        return new Promise((resolve, reject) => {
            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(buffers);
                resolve(pdfBuffer);
            });
            doc.on('error', reject);

            doc.end();
        });
    }
}

// Route handler for PDF download
export const downloadCertificatePDF = async (req, res) => {
    try {
        const { userId, certId } = req.params;

        // Get certificate data (this would typically come from the controller)
        const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:5001'}/api/certificates/${userId}/${certId}/pdf-data`);

        if (!response.ok) {
            return res.status(404).json({
                success: false,
                error: 'Certificate not found'
            });
        }

        const certificateData = await response.json();

        if (!certificateData.success) {
            return res.status(404).json({
                success: false,
                error: 'Certificate not found'
            });
        }

        // Generate PDF
        const doc = await CertificateService.generateCertificatePDF(certificateData.certificate);
        const pdfBuffer = await CertificateService.savePDFToBuffer(doc);

        // Set response headers for PDF download
        const fileName = `certificate-${certId}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Length', pdfBuffer.length);

        // Send PDF buffer
        res.send(pdfBuffer);

    } catch (error) {
        console.error('Error generating certificate PDF:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate certificate PDF'
        });
    }
};
