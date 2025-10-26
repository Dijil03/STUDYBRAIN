# Mailtrap Setup Guide

## 🚀 Quick Setup

### 1. Create Mailtrap Account

1. Go to [mailtrap.io](https://mailtrap.io)
2. Sign up for a free account
3. Verify your email address

### 2. Get Your API Credentials

1. In your Mailtrap dashboard, go to **Email Testing** → **Inboxes**
2. Click on your default inbox or create a new one
3. Go to **API** tab (not SMTP)
4. Copy your credentials:
   - **API Token**: (your API token)
   - **Inbox ID**: (the number from your inbox URL)

### 3. Update Environment Variables

Add these to your `.env` file in the backend directory:

```env
# Mailtrap Configuration
MAILTRAP_TOKEN=your_mailtrap_api_token_here
MAILTRAP_INBOX_ID=your_mailtrap_inbox_id_here

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5173
```

### 4. Test Email Functionality

You can test the email system using these API endpoints:

#### Test Welcome Email
```bash
POST http://localhost:5001/api/email/test
Content-Type: application/json

{
  "email": "dijildeji333@gmail.com"
}
```

#### Test Subscription Email
```bash
POST http://localhost:5001/api/email/subscription
Content-Type: application/json

{
  "email": "test@example.com",
  "userName": "Test User",
  "planName": "Study Pro",
  "amount": "9.99"
}
```

## 📧 Email Templates Available

### 1. Welcome Email
- **Trigger**: User signup
- **Template**: `welcome`
- **Data**: `{ userName }`

### 2. Subscription Success
- **Trigger**: Successful payment
- **Template**: `subscriptionSuccess`
- **Data**: `{ userName, planName, amount }`

### 3. Subscription Cancelled
- **Trigger**: Subscription cancellation
- **Template**: `subscriptionCancelled`
- **Data**: `{ userName }`

### 4. Password Reset
- **Trigger**: Password reset request
- **Template**: `passwordReset`
- **Data**: `{ userName, resetLink }`

## 🔧 Integration Points

### Automatic Email Triggers

1. **User Signup** → Welcome email
2. **Subscription Created** → Success email
3. **Subscription Cancelled** → Cancellation email
4. **Password Reset** → Reset email (manual trigger)

### Manual Email Sending

```javascript
import { sendEmail } from '../services/emailService.js';

// Send custom email
await sendEmail('user@example.com', 'welcome', { userName: 'John' });
```

## 🎨 Email Template Customization

Templates are located in `backend/src/services/emailService.js`. Each template includes:

- **Subject**: Email subject line
- **HTML**: Rich HTML content with styling
- **Variables**: Dynamic content placeholders

### Template Structure
```javascript
templateName: (data) => ({
  subject: 'Email Subject',
  html: `
    <div style="...">
      <h1>Hello ${data.userName}!</h1>
      <!-- More content -->
    </div>
  `
})
```

## 🚨 Important Notes

### Development vs Production

- **Development**: Uses Mailtrap sandbox (emails don't actually send)
- **Production**: Requires real SMTP provider (SendGrid, AWS SES, etc.)

### Email Limits

- **Mailtrap Free**: 100 emails/month
- **Mailtrap Paid**: Higher limits available

### Security

- Never commit real SMTP credentials to version control
- Use environment variables for all sensitive data
- Consider using a secrets management service for production

## 🧪 Testing

### 1. Check Mailtrap Inbox
- All test emails appear in your Mailtrap inbox
- No real emails are sent to recipients
- Perfect for development and testing

### 2. Email Preview
- Click on any email in Mailtrap to preview
- Test different email clients
- Verify links and formatting

### 3. API Testing
```bash
# Test all email endpoints
curl -X POST http://localhost:5001/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

## 🚀 Next Steps

1. **Set up Mailtrap account** ✅
2. **Configure environment variables** ✅
3. **Test email functionality** ✅
4. **Customize email templates** (optional)
5. **Set up production SMTP** (when ready to deploy)

## 🆘 Troubleshooting

### Common Issues

1. **"Authentication failed"**
   - Check MAILTRAP_USER and MAILTRAP_PASS
   - Verify credentials in Mailtrap dashboard

2. **"Connection timeout"**
   - Check internet connection
   - Verify Mailtrap service status

3. **"Template not found"**
   - Check template name spelling
   - Verify template exists in emailService.js

### Support

- Mailtrap Documentation: [docs.mailtrap.io](https://docs.mailtrap.io)
- Check server logs for detailed error messages
- Test with simple email first before complex templates

Happy emailing! 📧✨
