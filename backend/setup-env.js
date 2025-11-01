import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envContent = `# Database
MONGODB_URI=mongodb://localhost:27017/brain-learning-platform

# AI Configuration
HF_TOKEN=your_hugging_face_token_here

# Optional: OpenAI API Key (if you prefer OpenAI over Hugging Face)
# OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
PORT=5001
NODE_ENV=development

# JWT Secret
JWT_SECRET=your_jwt_secret_here

# Email Configuration (optional)
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USER=your_email@gmail.com
# EMAIL_PASS=your_app_password

# Stripe Configuration (optional)
# STRIPE_SECRET_KEY=your_stripe_secret_key
# STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
`;

const envPath = path.join(__dirname, '.env');

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
  console.log('📝 Please edit backend/.env and add your Hugging Face token:');
  console.log('   1. Go to https://huggingface.co/settings/tokens');
  console.log('   2. Create a new token with "Read" permissions');
  console.log('   3. Replace "your_hugging_face_token_here" with your actual token');
} else {
  console.log('⚠️  .env file already exists. Skipping creation.');
}
