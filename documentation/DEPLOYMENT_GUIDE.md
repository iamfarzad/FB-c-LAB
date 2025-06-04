# Deployment Guide - Serverless Proxy Architecture

## Overview

This guide covers deploying the AI Assistant Pro application with the new serverless proxy architecture to Vercel. The proxy securely handles all Google Gemini API calls server-side.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Google AI Studio Account**: Get API key from [aistudio.google.com](https://aistudio.google.com)
3. **Git Repository**: Code pushed to GitHub/GitLab/Bitbucket

## Step 1: Environment Variables Setup

### 1.1 Get Your Google Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com)
2. Sign in with your Google account
3. Click "Get API Key" → "Create API Key"
4. Copy the generated API key (starts with `AIza...`)

### 1.2 Configure Vercel Environment Variables
1. Go to your Vercel dashboard
2. Select your project (or import from Git)
3. Go to **Settings** → **Environment Variables**
4. Add the following variable:
   - **Name**: `GEMINI_API_KEY_SERVER`
   - **Value**: Your Google Gemini API key
   - **Environments**: Production, Preview, Development

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Configure build settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy**

### Option B: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel

# Follow prompts to configure project
```

## Step 3: Verify Deployment

### 3.1 Check Proxy Health
Visit: `https://your-app.vercel.app/api/gemini-proxy/health`

Expected response:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-01-03T..."
  }
}
```

### 3.2 Test Application Features
1. **Text Chat**: Send a message in the chat interface
2. **Voice**: Click voice button and speak
3. **Image Analysis**: Upload an image for analysis

## Step 4: Environment Configuration

### 4.1 Remove Client-Side API Key
Ensure your `.env` file does NOT contain:
```bash
# Remove this - no longer needed
VITE_API_KEY=your_api_key
```

### 4.2 Update .gitignore
Make sure `.env` is in your `.gitignore`:
```
.env
.env.local
.env.production
```

## Step 5: Monitoring and Troubleshooting

### 5.1 Check Vercel Function Logs
1. Go to Vercel Dashboard → Your Project
2. Click **Functions** tab
3. Click on `api/gemini-proxy.ts`
4. View logs for errors

### 5.2 Common Issues

#### Issue: "GEMINI_API_KEY_SERVER environment variable is required"
**Solution**: Ensure environment variable is set in Vercel dashboard

#### Issue: "Failed to generate content"
**Solutions**:
- Verify API key is valid
- Check Google AI Studio quota limits
- Review function logs for specific errors

#### Issue: CORS errors
**Solution**: Proxy automatically handles CORS - ensure you're calling the proxy endpoints

### 5.3 Performance Monitoring
Monitor these metrics in Vercel:
- Function execution time
- Error rates
- Request volume

## Step 6: Production Optimizations

### 6.1 Add Rate Limiting (Optional)
Consider adding rate limiting to prevent abuse:

```typescript
// In api/gemini-proxy.ts
const rateLimiter = new Map();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const requests = rateLimiter.get(ip) || [];
  
  // Allow 100 requests per hour
  const validRequests = requests.filter(time => now - time < 3600000);
  
  if (validRequests.length >= 100) {
    return false;
  }
  
  validRequests.push(now);
  rateLimiter.set(ip, validRequests);
  return true;
}
```

### 6.2 Add Caching (Optional)
Cache responses for better performance:

```typescript
// Simple in-memory cache
const cache = new Map();

function getCachedResponse(key: string) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < 300000) { // 5 min cache
    return cached.data;
  }
  return null;
}
```

## Step 7: Security Best Practices

### 7.1 API Key Security
- ✅ API key stored server-side only
- ✅ Never commit API keys to Git
- ✅ Use environment variables
- ✅ Rotate keys periodically

### 7.2 Request Validation
The proxy includes:
- Input validation
- Error handling
- CORS configuration
- Request method restrictions

### 7.3 Monitoring
Set up alerts for:
- High error rates
- Unusual request patterns
- API quota approaching limits

## Architecture Benefits

### Security
- 🔒 API keys never exposed to client
- 🔒 Server-side request validation
- 🔒 CORS properly configured

### Performance
- ⚡ Serverless scaling
- ⚡ Edge deployment
- ⚡ Browser-based voice processing

### Maintainability
- 🛠️ Centralized API logic
- 🛠️ Easy to update/modify
- 🛠️ Clear separation of concerns

## Support

If you encounter issues:
1. Check Vercel function logs
2. Verify environment variables
3. Test proxy health endpoint
4. Review Google AI Studio quota

For additional help, refer to:
- [Vercel Documentation](https://vercel.com/docs)
- [Google AI Studio Documentation](https://ai.google.dev/docs)
- Project `PROJECT_UPDATES.md` for recent changes 