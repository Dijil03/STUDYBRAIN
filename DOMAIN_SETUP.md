# Connecting Your GoDaddy Domain to Vercel

Follow these steps to connect your custom domain from GoDaddy to your Vercel deployment.

## Step 1: Add Domain in Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **frontend project** (StudyBrain)
3. Go to **Settings** → **Domains**
4. In the "Domains" section, enter your domain (e.g., `studybrain.com` or `www.studybrain.com`)
5. Click **Add**
6. Vercel will show you DNS records that need to be configured

## Step 2: Get DNS Records from Vercel

After adding the domain, Vercel will show you one of these options:

### Option A: Use Vercel's Nameservers (Recommended)
- Vercel will provide nameservers like:
  - `ns1.vercel-dns.com`
  - `ns2.vercel-dns.com`
- Skip to **Step 3A** below

### Option B: Use DNS Records (If keeping GoDaddy DNS)
- Vercel will provide:
  - **A Record**: `76.76.21.21` (point to this IP)
  - **CNAME Record**: `cname.vercel-dns.com` (for www subdomain)
- Skip to **Step 3B** below

## Step 3A: Update Nameservers in GoDaddy

**Use this if Vercel recommended nameservers:**

1. Log in to [GoDaddy](https://www.godaddy.com/)
2. Go to **My Products** → **Domains**
3. Click on your domain
4. Scroll down to **Additional Settings**
5. Click **Manage DNS**
6. Scroll to **Nameservers** section
7. Click **Change**
8. Select **Custom** (instead of "GoDaddy Nameservers")
9. Replace the existing nameservers with Vercel's:
   - `ns1.vercel-dns.com`
   - `ns2.vercel-dns.com`
10. Click **Save**
11. **Wait 24-48 hours** for DNS propagation (usually much faster, but can take time)

## Step 3B: Add DNS Records in GoDaddy

**Use this if you're keeping GoDaddy's nameservers:**

1. Log in to [GoDaddy](https://www.godaddy.com/)
2. Go to **My Products** → **Domains**
3. Click on your domain
4. Scroll down to **Additional Settings**
5. Click **Manage DNS**
6. In the **Records** section, add/edit records:

### For Root Domain (studybrain.com):
- **Type**: A
- **Name**: `@` (or leave blank)
- **Value**: `76.76.21.21` (or the IP Vercel provided)
- **TTL**: 600 (or default)

### For WWW Subdomain (www.studybrain.com):
- **Type**: CNAME
- **Name**: `www`
- **Value**: `cname.vercel-dns.com` (or the CNAME Vercel provided)
- **TTL**: 600 (or default)

7. Click **Save**
8. **Wait 1-24 hours** for DNS propagation

## Step 4: Verify Domain in Vercel

1. Go back to Vercel → Your Project → Settings → Domains
2. You'll see your domain with a status:
   - **Pending**: DNS is propagating (wait a bit longer)
   - **Valid**: ✅ Domain is connected and working!
   - **Error**: Check DNS settings (might need to wait longer or fix records)

## Step 5: Update Environment Variables

Once your domain is live, update these environment variables:

### In Vercel (Frontend):
1. Go to Vercel → Your Project → Settings → Environment Variables
2. Update or add:
   - `VITE_API_URL` → `https://your-backend-url.onrender.com/api`
   - (Keep your backend URL here - don't change it to your domain)

### In Render (Backend):
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Select your backend service
3. Go to **Environment**
4. Update these variables:
   - `CLIENT_URL` → `https://yourdomain.com` (your new Vercel domain)
   - `FRONTEND_URL` → `https://yourdomain.com` (your new Vercel domain)
5. Click **Save Changes**
6. Render will automatically redeploy

### Also Update Google OAuth (Important!)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Update **Authorized JavaScript origins**:
   - Add: `https://yourdomain.com`
   - Add: `https://www.yourdomain.com`
   - Keep existing URLs too (backend URL, etc.)
5. Update **Authorized redirect URIs**:
   - Keep your backend URL: `https://your-backend-url.onrender.com/api/auth/google/callback`
   - (Redirect URI should always point to your backend, not frontend!)
6. Click **Save**

## Step 6: Force HTTPS (Automatic)

Vercel automatically provides SSL certificates via Let's Encrypt. Once DNS propagates, your site will be:
- ✅ Accessible at `https://yourdomain.com`
- ✅ Secure with SSL certificate
- ✅ Automatically redirects HTTP to HTTPS

## Testing Your Domain

1. Wait for DNS propagation (check status in Vercel)
2. Once it shows "Valid", try:
   - `https://yourdomain.com`
   - `https://www.yourdomain.com` (if configured)
3. Test that:
   - Site loads correctly
   - Login/Signup works
   - API calls work (check browser console)
   - Google OAuth works

## Troubleshooting

### Domain shows "Pending" for a long time?
- DNS can take 1-48 hours to propagate
- Check DNS propagation: https://dnschecker.org/
- Make sure DNS records are correct in GoDaddy

### Getting SSL errors?
- Wait longer - SSL certificates are issued automatically
- Vercel can take a few minutes to issue certificates after DNS is valid

### Google OAuth not working?
- Make sure you updated Authorized JavaScript origins in Google Cloud Console
- Remember: Redirect URI stays as your backend URL (Render), not your domain

### API calls failing?
- Check that `VITE_API_URL` in Vercel still points to your Render backend
- Verify backend `CLIENT_URL` is updated to your new domain

## Quick Checklist

- [ ] Domain added in Vercel
- [ ] DNS records updated in GoDaddy (nameservers OR A/CNAME records)
- [ ] Domain shows "Valid" in Vercel
- [ ] `CLIENT_URL` updated in Render backend
- [ ] `FRONTEND_URL` updated in Render backend
- [ ] Google OAuth origins updated
- [ ] Test login/signup works
- [ ] Test Google OAuth works
- [ ] Site accessible at `https://yourdomain.com`

---

**Need Help?** Check Vercel's official guide: https://vercel.com/docs/concepts/projects/domains/add-a-domain

