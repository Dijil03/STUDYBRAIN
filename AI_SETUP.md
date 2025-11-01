# AI Assistant Setup Guide

## Quick Setup

### 1. Get Hugging Face Token
1. Go to [Hugging Face Settings](https://huggingface.co/settings/tokens)
2. Create a new token with "Read" permissions
3. Copy the token

### 2. Add to Environment Variables
Add this line to your `.env` file in the backend directory:
```env
HF_TOKEN=your_hugging_face_token_here
```

### 3. Install Dependencies
```bash
cd backend
npm install openai --legacy-peer-deps
```

### 4. Test the Setup
```bash
node test-ai.js
```

### 5. Start the Application
```bash
# Backend
cd backend
npm run dev

# Frontend (in another terminal)
cd frontend
npm run dev
```

### 6. Access AI Assistant
Navigate to `http://localhost:5173/ai` in your browser.

## Features Available

✅ **AI Chat Interface** - Real-time chat with AI assistant  
✅ **Study Planning** - Create personalized study schedules  
✅ **Homework Help** - Get assistance with academic problems  
✅ **Concept Explanation** - Understand difficult topics  
✅ **Quiz Generation** - Create practice questions  
✅ **Session Management** - Save and resume conversations  
✅ **Mobile Responsive** - Works on all devices  

## Troubleshooting

### Common Issues

**"Failed to send message"**
- Check if HF_TOKEN is set correctly
- Verify the token has proper permissions
- Check internet connection

**"Chat session not found"**
- Refresh the page and start a new conversation
- Check if the backend server is running

**Slow responses**
- This is normal for AI models
- Check Hugging Face API status
- Consider upgrading to a paid plan for faster responses

### Getting Help

1. Check the console for error messages
2. Verify all environment variables are set
3. Test with the provided test script
4. Check the AI_FEATURE_GUIDE.md for detailed documentation

## Model Information

- **Model**: `deepseek-ai/DeepSeek-V3.2-Exp:novita`
- **Provider**: Hugging Face
- **Type**: Chat completion
- **Max Tokens**: 1000
- **Temperature**: 0.7

## Security Notes

- All conversations are stored securely in your database
- User sessions are isolated
- No data is shared with third parties
- Messages are encrypted in transit
