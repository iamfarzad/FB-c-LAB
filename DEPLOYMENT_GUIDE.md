# 🚀 Deployment Guide - AI Assistant Pro

This guide walks you through deploying the consolidated AI Assistant Pro architecture across multiple platforms.

## 📋 Deployment Overview

The architecture consists of three main components:

1. **Frontend + API Routes** → Vercel
2. **WebSocket Server** → Railway/Render/Fly.io
3. **Database** → Supabase (already hosted)

## 🛠️ Prerequisites

- [ ] GitHub repository with your code
- [ ] Gemini API key from Google AI Studio
- [ ] Supabase account and project
- [ ] Resend account for email
- [ ] Domain name (optional but recommended)

## 📦 Part 1: Database Setup (Supabase)

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose a region close to your users
3. Save your project URL and anon key

### Step 2: Run Database Schema
1. Go to SQL Editor in your Supabase dashboard
2. Copy and paste the schema from `src/lib/supabase/schema.sql`
3. Click "Run" to create all tables and indexes

### Step 3: Add Required Functions
```sql
-- Add this function in SQL Editor
CREATE OR REPLACE FUNCTION update_conversation_stats(
  p_conversation_id UUID,
  p_additional_cost DECIMAL
) RETURNS VOID AS $$
BEGIN
  UPDATE conversations 
  SET 
    total_messages = total_messages + 1,
    ai_cost = ai_cost + p_additional_cost
  WHERE id = p_conversation_id;
END;
$$ LANGUAGE plpgsql;
```

### Step 4: Configure Row Level Security (Optional)
If you need user-specific access control:
```sql
-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;

-- Add policies as needed
CREATE POLICY "Public read access" ON leads FOR SELECT USING (true);
```

## 🌐 Part 2: Frontend + API Deployment (Vercel)

### Step 1: Prepare Environment Variables
Create a `.env.local` file with:
```bash
# Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key

# Email
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=AI Assistant Pro <noreply@yourdomain.com>

# WebSocket (will be updated after server deployment)
NEXT_PUBLIC_LIVE_SERVER_URL=ws://localhost:8080/live
```

### Step 2: Deploy to Vercel
1. Connect your GitHub repository to Vercel
2. Import your project
3. Configure build settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 3: Add Environment Variables in Vercel
1. Go to Project Settings → Environment Variables
2. Add all variables from your `.env.local`
3. Make sure to mark sensitive variables as "Sensitive"

### Step 4: Configure Vercel Functions
Update your `vercel.json`:
```json
{
  "functions": {
    "api/routes/*.ts": {
      "runtime": "nodejs18.x"
    }
  },
  "rewrites": [
    {
      "source": "/api/roi-calculation",
      "destination": "/api/routes/roi-calculation"
    },
    {
      "source": "/api/analyze-document",
      "destination": "/api/routes/analyze-document"
    },
    {
      "source": "/api/analyze-image", 
      "destination": "/api/routes/analyze-image"
    },
    {
      "source": "/api/video-to-app",
      "destination": "/api/routes/video-to-app"
    },
    {
      "source": "/api/grounded-search",
      "destination": "/api/routes/grounded-search"
    },
    {
      "source": "/api/send-lead-email",
      "destination": "/api/routes/send-lead-email"
    }
  ]
}
```

## 🔌 Part 3: WebSocket Server Deployment

### Option A: Deploy to Railway

1. **Create Railway Account**: Go to [railway.app](https://railway.app)

2. **Create New Project**: 
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure Build Settings**:
   - **Root Directory**: `server/`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

4. **Add Environment Variables**:
   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=8080
   ```

5. **Deploy and Get URL**:
   - Railway will provide a URL like `https://your-app.railway.app`
   - Your WebSocket URL will be `wss://your-app.railway.app/live`

### Option B: Deploy to Render

1. **Create Render Account**: Go to [render.com](https://render.com)

2. **Create Web Service**:
   - Connect your GitHub repository
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

3. **Configure Environment**:
   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=10000
   ```

4. **Get WebSocket URL**:
   - Render provides `https://your-app.onrender.com`
   - WebSocket URL: `wss://your-app.onrender.com/live`

### Option C: Deploy to Fly.io

1. **Install Fly CLI**: `curl -L https://fly.io/install.sh | sh`

2. **Create fly.toml** in `server/` directory:
   ```toml
   app = "your-app-name"
   primary_region = "ord"

   [build]
     dockerfile = "Dockerfile"

   [env]
     PORT = "8080"

   [[services]]
     internal_port = 8080
     protocol = "tcp"

     [[services.ports]]
       port = 443
       handlers = ["tls", "http"]
   ```

3. **Create Dockerfile** in `server/` directory:
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   EXPOSE 8080
   CMD ["npm", "start"]
   ```

4. **Deploy**:
   ```bash
   cd server
   fly deploy
   fly secrets set GEMINI_API_KEY=your_gemini_api_key_here
   ```

## 🔗 Part 4: Connect Frontend to WebSocket Server

### Update Environment Variables
1. Go back to your Vercel project settings
2. Update the `NEXT_PUBLIC_LIVE_SERVER_URL` variable:
   ```bash
   NEXT_PUBLIC_LIVE_SERVER_URL=wss://your-websocket-server.com/live
   ```
3. Redeploy your Vercel project

## 📧 Part 5: Email Configuration (Resend)

### Step 1: Setup Resend
1. Create account at [resend.com](https://resend.com)
2. Verify your sending domain
3. Get your API key

### Step 2: Configure DNS (if using custom domain)
Add these DNS records for your domain:
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all

Type: TXT  
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com

Type: CNAME
Name: resend._domainkey
Value: resend._domainkey.resend.com
```

### Step 3: Update Environment Variables
```bash
FROM_EMAIL=AI Assistant Pro <noreply@yourdomain.com>
RESEND_API_KEY=your_resend_api_key
```

## ✅ Part 6: Testing Your Deployment

### Test Frontend
1. Visit your Vercel URL
2. Try the AI chat functionality
3. Test image upload and analysis

### Test API Routes
```bash
# Test ROI calculation
curl -X POST https://your-app.vercel.app/api/roi-calculation \
  -H "Content-Type: application/json" \
  -d '{
    "description": "E-commerce AI implementation",
    "budget": 50000,
    "timeline": "6 months", 
    "goals": ["Increase sales"]
  }'
```

### Test WebSocket Server
```javascript
// Test in browser console
const ws = new WebSocket('wss://your-websocket-server.com/live');
ws.onopen = () => console.log('Connected');
ws.onmessage = (e) => console.log('Message:', e.data);
ws.send(JSON.stringify({type: 'start_session', config: {}}));
```

### Test Email System
```bash
# Test email sending
curl -X POST https://your-app.vercel.app/api/send-lead-email \
  -H "Content-Type: application/json" \
  -d '{
    "leadId": "test-lead-id",
    "emailType": "welcome"
  }'
```

## 🔧 Troubleshooting

### Common Issues

#### WebSocket Connection Fails
- Check if WebSocket server is running: `curl https://your-websocket-server.com`
- Verify `NEXT_PUBLIC_LIVE_SERVER_URL` is correct
- Check browser console for CORS errors

#### API Routes Return 500
- Check Vercel function logs
- Verify all environment variables are set
- Test API key with direct Gemini API call

#### Database Connection Issues
- Verify Supabase URL and key
- Check if schema was applied correctly
- Test connection in Supabase dashboard

#### Email Not Sending
- Verify Resend API key
- Check domain verification status
- Review email logs in Resend dashboard

### Performance Optimization

#### Frontend
- Enable Vercel Analytics
- Configure caching headers
- Optimize images and assets

#### WebSocket Server
- Enable horizontal scaling if needed
- Add health check endpoints
- Configure proper logging

#### Database
- Add database indexes for frequent queries
- Enable connection pooling
- Monitor query performance

## 📊 Monitoring & Analytics

### Set Up Monitoring
1. **Vercel Analytics**: Enable in project settings
2. **Supabase Logs**: Monitor in dashboard
3. **WebSocket Server**: Add logging middleware
4. **Email Analytics**: Track opens/clicks in Resend

### Key Metrics to Track
- API response times
- WebSocket connection count
- Database query performance
- Email delivery rates
- User engagement metrics

## 🔐 Security Checklist

- [ ] API keys are stored as environment variables
- [ ] Database has proper RLS policies
- [ ] CORS is configured correctly
- [ ] Rate limiting is enabled
- [ ] Input validation is implemented
- [ ] HTTPS is enforced everywhere

## 🚀 Going Live

### Final Steps
1. **Custom Domain**: Configure in Vercel and WebSocket provider
2. **SSL Certificates**: Should be automatic with most providers
3. **DNS Configuration**: Point your domain to Vercel
4. **Testing**: Run full end-to-end tests
5. **Monitoring**: Set up alerts for downtime/errors

### Post-Launch
- Monitor error rates and performance
- Set up automated backups
- Plan for scaling based on usage
- Regular security updates

---

**🎉 Congratulations! Your AI Assistant Pro is now live and ready to serve users.**

For support or questions, refer to the main README.md or create an issue in the repository.