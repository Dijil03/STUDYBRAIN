import { MailtrapClient } from 'mailtrap';
import dotenv from 'dotenv';

dotenv.config();

// Create Mailtrap client
const createMailtrapClient = () => {
  return new MailtrapClient({
    token: process.env.MAILTRAP_TOKEN
  });
};

// Email templates
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
  }),

  subscriptionCancelled: (userName) => ({
    subject: 'Subscription Cancelled - We\'ll Miss You! 😢',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">😢 We\'ll Miss You!</h1>
          <p style="color: #e0e0e0; margin: 10px 0 0 0; font-size: 16px;">Your subscription has been cancelled</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Hi ${userName}! 👋</h2>
          
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            We're sorry to see you go! Your subscription has been cancelled and you'll continue to have access to your account until the end of your current billing period.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
            <h3 style="color: #333; margin-top: 0;">💡 What happens next:</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>You'll keep premium features until your period ends</li>
              <li>Your data and documents remain safe</li>
              <li>You can reactivate anytime</li>
              <li>We'll send you a feedback survey</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/pricing" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold;
                      display: inline-block;">
              View Plans Again 💎
            </a>
          </div>
          
          <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
            Changed your mind? Reply to this email and we'll help you reactivate!
          </p>
        </div>
      </div>
    `
  }),

  passwordReset: (userName, resetLink) => ({
    subject: 'Reset Your Password - Brain Account 🔐',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6c757d 0%, #495057 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Password Reset</h1>
          <p style="color: #e0e0e0; margin: 10px 0 0 0; font-size: 16px;">Secure your account</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Hi ${userName}! 👋</h2>
          
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            We received a request to reset your password. Click the button below to create a new password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background: linear-gradient(135deg, #6c757d 0%, #495057 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold;
                      display: inline-block;">
              Reset Password 🔑
            </a>
          </div>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
              <strong>Security Note:</strong> This link expires in 1 hour. If you didn't request this reset, please ignore this email.
            </p>
          </div>
          
          <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
            Questions? Reply to this email for support.
          </p>
        </div>
      </div>
    `
  })
};

// Email service functions
export const sendEmail = async (to, template, data = {}) => {
  try {
    const client = createMailtrapClient();
    const emailTemplate = emailTemplates[template];

    if (!emailTemplate) {
      throw new Error(`Email template '${template}' not found`);
    }

    const emailContent = typeof emailTemplate === 'function'
      ? emailTemplate(data)
      : emailTemplate;

    const sender = {
      email: "noreply@brainapp.com",
      name: "Brain Study App"
    };

    const recipients = [
      {
        email: to
      }
    ];

    const result = await client.send({
      from: sender,
      to: recipients,
      subject: emailContent.subject,
      html: emailContent.html,
      category: template
    });

    console.log('Email sent successfully:', result);
    return { success: true, messageId: result.id };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Bulk email function
export const sendBulkEmails = async (recipients, template, data = {}) => {
  const results = [];

  for (const recipient of recipients) {
    const result = await sendEmail(recipient, template, data);
    results.push({ recipient, result });
  }

  return results;
};

export default {
  sendEmail,
  sendBulkEmails,
  emailTemplates
};
