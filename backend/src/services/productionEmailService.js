import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter for production email (Gmail example)
const createProductionTransporter = () => {
    return nodemailer.createTransporter({
        service: 'gmail', // or use your preferred email service
        auth: {
            user: process.env.EMAIL_USER, // your-email@gmail.com
            pass: process.env.EMAIL_PASS  // your-app-password
        }
    });
};

// Email templates (same as before)
export const emailTemplates = {
    welcome: (userName) => ({
        subject: 'Welcome to Brain - Your Study Journey Begins! 🧠',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🧠 Welcome to Brain!</h1>
          <p style="color: #e0e0e0; margin: 10px 0 0 0; font-size: 16px;">Your AI-powered study companion</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Hi ${userName}! 👋</h2>
          
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            Welcome to Brain! We're thrilled to have you join our community of successful students.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3 style="color: #333; margin-top: 0;">🚀 What you can do now:</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>Create unlimited study documents</li>
              <li>Generate AI-powered flashcards</li>
              <li>Track your study time and progress</li>
              <li>Join study groups and collaborate</li>
              <li>Access advanced analytics</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold;
                      display: inline-block;">
              Start Studying Now 🎯
            </a>
          </div>
          
          <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
            Need help? Reply to this email or visit our support center.
          </p>
        </div>
      </div>
    `
    }),

    subscriptionSuccess: (userName, planName, amount) => ({
        subject: `🎉 Subscription Confirmed - Welcome to ${planName}!`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Payment Successful!</h1>
          <p style="color: #e0e0e0; margin: 10px 0 0 0; font-size: 16px;">Your subscription is now active</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Hi ${userName}! 👋</h2>
          
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            Thank you for upgrading to <strong>${planName}</strong>! Your payment of <strong>$${amount}</strong> has been processed successfully.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="color: #333; margin-top: 0;">✨ Your new features:</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>Unlimited documents and storage</li>
              <li>Advanced AI features</li>
              <li>Priority support</li>
              <li>Export and collaboration tools</li>
              <li>Detailed analytics dashboard</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" 
               style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold;
                      display: inline-block;">
              Access Your Dashboard 🚀
            </a>
          </div>
          
          <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
            Questions about your subscription? Reply to this email anytime.
          </p>
        </div>
      </div>
    `
    })
};

// Production email service functions
export const sendProductionEmail = async (to, template, data = {}) => {
    try {
        const transporter = createProductionTransporter();
        const emailTemplate = emailTemplates[template];

        if (!emailTemplate) {
            throw new Error(`Email template '${template}' not found`);
        }

        const emailContent = typeof emailTemplate === 'function'
            ? emailTemplate(data)
            : emailTemplate;

        const mailOptions = {
            from: '"Brain Study App" <noreply@brainapp.com>',
            to,
            subject: emailContent.subject,
            html: emailContent.html
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Production email sent successfully:', result.messageId);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('Error sending production email:', error);
        return { success: false, error: error.message };
    }
};

export default {
    sendProductionEmail,
    emailTemplates
};
