# AI Assistant Feature Guide

## Overview
The AI Assistant feature integrates Hugging Face's DeepSeek model to provide intelligent study assistance, tutoring, and academic support to users.

## Features

### 🤖 AI Chat Interface
- Real-time chat with AI assistant
- Persistent chat sessions
- Message history storage
- Typing indicators and smooth animations
- Minimizable chat window

### 🧠 Smart Capabilities
- **Smart Tutoring**: Personalized explanations and step-by-step solutions
- **Study Planning**: Create customized study schedules
- **Quiz Generation**: Generate practice questions and quizzes
- **Concept Explanation**: Clear explanations of difficult topics
- **Progress Tracking**: Monitor learning progress
- **Study Groups**: Collaboration recommendations

### 📚 Quick Actions
- Help with homework
- Create study plans
- Explain concepts
- Generate practice quizzes

## Backend Implementation

### API Endpoints
- `POST /api/ai/sessions` - Create new chat session
- `POST /api/ai/chat` - Send message to AI
- `GET /api/ai/sessions/:sessionId` - Get chat history
- `GET /api/ai/sessions` - Get user's chat sessions
- `DELETE /api/ai/sessions/:sessionId` - Delete chat session
- `DELETE /api/ai/sessions/:sessionId/messages` - Clear chat history

### Database Schema
```javascript
{
  userId: String,
  sessionId: String,
  messages: [{
    role: 'user' | 'assistant' | 'system',
    content: String,
    timestamp: Date
  }],
  model: String,
  totalTokens: Number,
  isActive: Boolean
}
```

## Frontend Implementation

### Components
- **AIChat.jsx**: Main chat interface component
- **AI.jsx**: AI assistant landing page
- **Navbar.jsx**: Updated with AI navigation link

### Features
- Responsive design with mobile support
- Smooth animations using Framer Motion
- Real-time message updates
- Session management
- Quick action buttons

## Setup Instructions

### 1. Environment Variables
Add to your `.env` file:
```env
HF_TOKEN=your_hugging_face_token_here
```

### 2. Install Dependencies
```bash
cd backend
npm install openai --legacy-peer-deps
```

### 3. Database
The AI model will be automatically created when the server starts.

### 4. Hugging Face Setup
1. Get your Hugging Face token from https://huggingface.co/settings/tokens
2. Add it to your environment variables
3. The model used is `deepseek-ai/DeepSeek-V3.2-Exp:novita`

## Usage

### Starting a Chat
1. Navigate to `/ai` or click "AI Assistant" in the navbar
2. Click "Start New Conversation" or use quick actions
3. Type your message and press Enter or click Send

### Chat Features
- **Minimize/Maximize**: Click the minimize button to collapse the chat
- **Clear Chat**: Use the trash icon to clear current conversation
- **New Chat**: Use the refresh icon to start a fresh conversation
- **Session History**: View recent sessions on the AI page

### Quick Actions
- **Help with Homework**: Get assistance with specific problems
- **Create Study Plan**: Generate personalized study schedules
- **Explain Concepts**: Get detailed explanations of topics
- **Practice Quiz**: Generate practice questions

## Technical Details

### Model Configuration
- **Model**: `deepseek-ai/DeepSeek-V3.2-Exp:novita`
- **Max Tokens**: 1000
- **Temperature**: 0.7
- **Base URL**: `https://router.huggingface.co/v1`

### Security
- All routes require authentication
- User sessions are isolated
- Messages are stored securely in MongoDB

### Performance
- Lazy loading for better performance
- Optimized database queries
- Efficient message pagination

## Troubleshooting

### Common Issues
1. **"Failed to send message"**: Check HF_TOKEN environment variable
2. **"Chat session not found"**: Session may have expired, start a new chat
3. **Slow responses**: Check Hugging Face API status

### Debug Mode
Enable debug logging by setting `NODE_ENV=development` in your environment.

## Future Enhancements
- Voice input/output
- File upload support
- Multi-language support
- Advanced study analytics
- Integration with other study tools
