# How to Add HF_TOKEN to Render

The AI Assistant feature requires a Hugging Face token to work. Follow these steps to add it:

## Step 1: Get Your Hugging Face Token

1. Go to [Hugging Face](https://huggingface.co/)
2. Sign in or create an account
3. Go to your profile → Settings → Access Tokens
4. Click "New token"
5. Give it a name (e.g., "StudyBrain AI")
6. Select "Read" permissions (or "Write" if needed)
7. Click "Generate token"
8. **Copy the token immediately** - you won't be able to see it again!

## Step 2: Add Token to Render

1. Go to your [Render Dashboard](https://dashboard.render.com/)
2. Select your backend service (the one serving the API)
3. Click on **Environment** in the left sidebar
4. Click **Add Environment Variable**
5. Enter:
   - **Key**: `HF_TOKEN`
   - **Value**: Paste your Hugging Face token
6. Click **Save Changes**
7. Render will automatically redeploy your service

## Step 3: Verify It's Working

1. Wait for the deployment to complete (check the Render logs)
2. Try using the AI Assistant feature on your frontend
3. It should now work without errors!

## Troubleshooting

- **Error persists?** Make sure you copied the entire token (they're usually long strings)
- **Still getting errors?** Check the Render logs to see if the environment variable is being read correctly
- **Token invalid?** Make sure the token has the correct permissions and hasn't been revoked

## Optional: Using OpenAI Instead

If you prefer to use OpenAI directly instead of Hugging Face:

1. Get an OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add it as `OPENAI_API_KEY` in Render (instead of `HF_TOKEN`)
3. Update the `ai.controller.js` to use OpenAI directly (modify the `getClient` function)

---

**Note:** The AI Assistant feature will show a friendly error message if the token is not configured, but the rest of your application will continue to work normally.

