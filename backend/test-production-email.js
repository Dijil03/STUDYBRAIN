// Test script for production email (Gmail example)
const nodemailer = require('nodemailer');
require('dotenv').config();

const testProductionEmail = async () => {
    try {
        console.log('🧪 Testing Production Email...');

        // Check if credentials are set
        if (!process.env.EMAIL_USER) {
            console.error('❌ EMAIL_USER not found in environment variables');
            console.log('Add EMAIL_USER=your-email@gmail.com to your .env file');
            return;
        }

        if (!process.env.EMAIL_PASS) {
            console.error('❌ EMAIL_PASS not found in environment variables');
            console.log('Add EMAIL_PASS=your-app-password to your .env file');
            return;
        }

        console.log('✅ Environment variables found');
        console.log('Email User:', process.env.EMAIL_USER);

        // Create transporter
        const transporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        console.log('✅ Gmail transporter created');

        // Test email
        const mailOptions = {
            from: '"Brain Study App" <noreply@brainapp.com>',
            to: 'dijildeji333@gmail.com',
            subject: 'Test Email from Brain App (Production)',
            text: 'This is a test email from the Brain study app!',
            html: `
        <h1>🧠 Test Email from Brain App</h1>
        <p>This is a test email from the Brain study app!</p>
        <p>If you receive this, the production email system is working! 🎉</p>
      `
        };

        console.log('📧 Sending production email...');

        const result = await transporter.sendMail(mailOptions);
        console.log('✅ Production email sent successfully!');
        console.log('Message ID:', result.messageId);
        console.log('Check your email inbox: dijildeji333@gmail.com');

    } catch (error) {
        console.error('❌ Error sending production email:', error.message);

        if (error.message.includes('Invalid login')) {
            console.log('\n💡 Gmail Setup Help:');
            console.log('1. Enable 2-factor authentication on your Gmail account');
            console.log('2. Generate an App Password:');
            console.log('   - Go to Google Account settings');
            console.log('   - Security → 2-Step Verification → App passwords');
            console.log('   - Generate password for "Mail"');
            console.log('3. Use the App Password (not your regular password)');
        }
    }
};

testProductionEmail();
