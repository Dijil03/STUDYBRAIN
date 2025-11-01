# How to Redeploy on Vercel

## Automatic Redeployment (Default)

Vercel **automatically redeploys** your frontend whenever you push changes to your GitHub repository. This should happen within 1-2 minutes of your `git push`.

## Manual Redeploy (If Needed)

If you need to manually trigger a redeploy:

### Option 1: Via Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your **frontend project** (StudyBrain)
3. Click on the **"Deployments"** tab (top menu)
4. Find the latest deployment
5. Click the **three dots (⋯)** menu on the right
6. Click **"Redeploy"**
7. Select **"Use existing Build Cache"** or **"Rebuild"** (rebuild is safer)
8. Click **"Redeploy"**

### Option 2: Trigger via Git Push

If auto-deploy didn't trigger, you can trigger it manually:

```bash
# Make a small change and push again
git commit --allow-empty -m "Trigger Vercel redeploy"
git push origin main
```

### Option 3: Via Vercel CLI (If Installed)

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

## Check Deployment Status

1. Go to your Vercel Dashboard
2. Click on your project
3. Check the **"Deployments"** tab
4. You'll see:
   - ✅ **Building** - Deployment in progress
   - ✅ **Ready** - Deployment complete (usually takes 1-3 minutes)
   - ❌ **Error** - Something went wrong (check logs)

## View Deployment Logs

1. In Vercel Dashboard → Your Project → Deployments
2. Click on a specific deployment
3. Click **"Build Logs"** to see what happened during deployment

## Verify Your Changes Are Live

After redeploy completes:

1. Go to your site URL (e.g., `https://studybrain.vercel.app`)
2. **Hard refresh** your browser:
   - Windows: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`
3. Open browser DevTools (F12) → Console tab
4. Look for the debug logs: `🔍 Navbar mainNavLinks:`
5. The Pricing link should now be visible!

## Troubleshooting

### Changes Not Showing?

1. **Wait 2-3 minutes** - Builds can take time
2. **Hard refresh** your browser (Ctrl+Shift+R)
3. **Clear browser cache** completely
4. **Check deployment logs** in Vercel for errors
5. **Verify the commit was pushed** - Check GitHub to confirm

### Build Failed?

1. Check the **Build Logs** in Vercel
2. Look for error messages
3. Common issues:
   - Missing dependencies
   - Build command errors
   - Environment variable issues

### Still Not Working?

1. Check Vercel project settings → **Git** → Make sure GitHub integration is connected
2. Verify **Auto-deploy** is enabled in project settings
3. Check that the correct **branch** is set for production (usually `main`)

---

**Note:** Vercel is serverless - there's no "server" to restart. Each deployment creates a new version of your site. The latest successful deployment is automatically live!

