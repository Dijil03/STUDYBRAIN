import { sendEmail, sendBulkEmails } from '../services/emailService.js';

// Send welcome email
export const sendWelcomeEmail = async (req, res) => {
  try {
    const { email, userName } = req.body;

    if (!email || !userName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and userName are required' 
      });
    }

    const result = await sendEmail(email, 'welcome', { userName });
    
    if (result.success) {
      res.status(200).json({ 
        success: true, 
        message: 'Welcome email sent successfully' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to send welcome email',
        error: result.error 
      });
    }
  } catch (error) {
    console.error('Error in sendWelcomeEmail:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Send subscription success email
export const sendSubscriptionEmail = async (req, res) => {
  try {
    const { email, userName, planName, amount } = req.body;

    if (!email || !userName || !planName || !amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, userName, planName, and amount are required' 
      });
    }

    const result = await sendEmail(email, 'subscriptionSuccess', { 
      userName, 
      planName, 
      amount 
    });
    
    if (result.success) {
      res.status(200).json({ 
        success: true, 
        message: 'Subscription email sent successfully' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to send subscription email',
        error: result.error 
      });
    }
  } catch (error) {
    console.error('Error in sendSubscriptionEmail:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Send subscription cancellation email
export const sendCancellationEmail = async (req, res) => {
  try {
    const { email, userName } = req.body;

    if (!email || !userName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and userName are required' 
      });
    }

    const result = await sendEmail(email, 'subscriptionCancelled', { userName });
    
    if (result.success) {
      res.status(200).json({ 
        success: true, 
        message: 'Cancellation email sent successfully' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to send cancellation email',
        error: result.error 
      });
    }
  } catch (error) {
    console.error('Error in sendCancellationEmail:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (req, res) => {
  try {
    const { email, userName, resetLink } = req.body;

    if (!email || !userName || !resetLink) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, userName, and resetLink are required' 
      });
    }

    const result = await sendEmail(email, 'passwordReset', { 
      userName, 
      resetLink 
    });
    
    if (result.success) {
      res.status(200).json({ 
        success: true, 
        message: 'Password reset email sent successfully' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to send password reset email',
        error: result.error 
      });
    }
  } catch (error) {
    console.error('Error in sendPasswordResetEmail:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Test email functionality
export const testEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    const result = await sendEmail(email, 'welcome', { userName: 'Test User' });
    
    if (result.success) {
      res.status(200).json({ 
        success: true, 
        message: 'Test email sent successfully' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to send test email',
        error: result.error 
      });
    }
  } catch (error) {
    console.error('Error in testEmail:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};
