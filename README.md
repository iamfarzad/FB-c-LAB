# 🤖 AI Assistant Pro - Consolidated Architecture

A production-ready AI assistant platform with real-time voice capabilities, comprehensive lead management, and advanced AI tools.

## 🏗️ Architecture Overview

This project implements a clean, scalable architecture with clear separation of concerns:

- **Frontend**: Vite + React (deployed on Vercel)
- **API Layer**: Dedicated API routes for each AI tool
- **Real-time Streaming**: Standalone WebSocket server (deployed separately)
- **Persistence**: Supabase for leads, conversations, and transcripts
- **Email**: Resend integration for automated follow-ups

## 🚀 Features

### Core AI Capabilities
- ✅ **Text Generation**: Advanced conversation handling with Gemini 2.0
- ✅ **Image Analysis**: Multi-modal image understanding and description
- ✅ **Document Analysis**: PDF/text analysis with summaries and insights
- ✅ **ROI Calculation**: Business-focused AI ROI analysis and recommendations
- ✅ **Video-to-App**: Convert video descriptions into app specifications
- ✅ **Grounded Search**: Contextual search with conversation history
- ✅ **Translation**: Multi-language text translation

### Real-time Features
- ✅ **WebSocket Voice**: Real-time voice communication via standalone server
- ✅ **Live Sessions**: Persistent sessions with conversation continuity
- ✅ **Multi-modal Streaming**: Text, audio, and image processing in real-time

### Business Features
- ✅ **Lead Management**: Comprehensive lead tracking and qualification
- ✅ **Conversation Analytics**: Detailed conversation analysis and reporting
- ✅ **Email Automation**: Automated follow-ups with beautiful templates
- ✅ **Cost Tracking**: Token usage and budget management
- ✅ **Session Persistence**: Conversations saved and retrievable

## 📦 Project Structure

```
├── src/                          # Frontend application
│   ├── components/              # React components
│   ├── hooks/                   # Custom React hooks
│   │   └── useWebSocketVoice.ts # WebSocket voice hook
│   ├── lib/                     # Core services
│   │   ├── GeminiService.ts     # Unified AI service
│   │   └── LeadManager.ts       # Lead/conversation management
│   └── types/                   # TypeScript definitions
│
├── api/                         # API routes (Vercel functions)
│   ├── routes/                  # Individual AI tool endpoints
│   │   ├── roi-calculation.ts   # ROI analysis
│   │   ├── analyze-document.ts  # Document analysis
│   │   ├── analyze-image.ts     # Image analysis
│   │   ├── video-to-app.ts      # Video app specifications
│   │   ├── grounded-search.ts   # Contextual search
│   │   └── send-lead-email.ts   # Email automation
│   └── gemini-proxy.ts          # Legacy proxy (being phased out)
│
├── server/                      # WebSocket server (deploy separately)
│   ├── live-server.ts          # Main WebSocket server
│   └── package.json            # Server dependencies
│
└── src/lib/supabase/           # Database
    └── schema.sql              # Database schema
```

## 🛠️ Setup & Installation

### 1. Prerequisites
- Node.js 18+
- Supabase account
- Gemini API key
- Resend API key
- Deployment platform supporting WebSockets (Railway, Render, etc.)

### 2. Environment Variables

#### Frontend/API (Vercel)
```bash
# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Email
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=your_sender_email

# WebSocket Server
NEXT_PUBLIC_LIVE_SERVER_URL=wss://your-websocket-server.com/live
```

#### WebSocket Server
```bash
# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Server
PORT=8080
```

### 3. Database Setup

1. Create a new Supabase project
2. Run the schema from `src/lib/supabase/schema.sql` in the SQL editor
3. Set up the required stored procedures:

```sql
-- Add this function to Supabase
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

### 4. Installation

```bash
# Install frontend dependencies
npm install

# Install WebSocket server dependencies
cd server
npm install
cd ..
```

### 5. Development

```bash
# Start frontend (Vite dev server)
npm run dev

# Start WebSocket server (in separate terminal)
cd server
npm run dev
```

## 🚀 Deployment

### Frontend + API (Vercel)
1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main

### WebSocket Server (Railway/Render/Fly.io)
1. Create new service on your platform
2. Set environment variables
3. Deploy the `server/` directory
4. Update `NEXT_PUBLIC_LIVE_SERVER_URL` with the WebSocket URL

### Database (Supabase)
1. Already hosted - just configure connection strings
2. Run migrations from `src/lib/supabase/schema.sql`

## 🔧 API Endpoints

### AI Tools
- `POST /api/routes/roi-calculation` - Generate ROI analysis
- `POST /api/routes/analyze-document` - Analyze documents
- `POST /api/routes/analyze-image` - Analyze images
- `POST /api/routes/video-to-app` - Generate app specs
- `POST /api/routes/grounded-search` - Contextual search

### Business Operations
- `POST /api/routes/send-lead-email` - Send automated emails

### Legacy (being phased out)
- `POST /api/gemini-proxy` - Legacy proxy endpoint

## 🎯 Usage Examples

### Using the GeminiService
```typescript
import { getGeminiService } from '@/lib/GeminiService';

const gemini = getGeminiService(process.env.GEMINI_API_KEY);

// Generate text
const result = await gemini.generateText('Explain AI benefits');

// Analyze image
const analysis = await gemini.analyzeImage(base64Image, 'Describe this image');

// Generate ROI report
const report = await gemini.generateRoiReport({
  description: 'E-commerce AI implementation',
  budget: 50000,
  timeline: '6 months',
  goals: ['Increase sales', 'Improve customer service']
});
```

### Using the WebSocket Voice Hook
```typescript
import { useWebSocketVoice } from '@/hooks/useWebSocketVoice';

function VoiceChat() {
  const {
    isConnected,
    isSessionActive,
    connect,
    startSession,
    sendText,
    sendAudio,
    lastMessage
  } = useWebSocketVoice({
    onMessage: (message) => {
      console.log('Received:', message);
    }
  });

  const handleStartVoice = async () => {
    await connect();
    await startSession({ model: 'gemini-2.0-flash-exp' });
  };

  return (
    <div>
      <button onClick={handleStartVoice}>Start Voice Chat</button>
      {lastMessage && <p>{lastMessage.text}</p>}
    </div>
  );
}
```

### Managing Leads
```typescript
import { getLeadManager } from '@/lib/LeadManager';

const leadManager = getLeadManager();

// Create/get lead
const lead = await leadManager.createLead({
  email: 'user@example.com',
  name: 'John Doe',
  company: 'Acme Corp'
});

// Track conversation
const conversation = await leadManager.createConversation({
  lead_id: lead.id,
  session_id: 'unique-session-id',
  title: 'AI Consultation'
});

// Add messages
await leadManager.addMessage({
  conversation_id: conversation.id,
  message_id: 'msg-1',
  role: 'user',
  content: 'Tell me about AI benefits',
  token_count: 25,
  cost: 0.0001
});
```

## 💰 Cost Management

The system includes comprehensive cost tracking:

- **Token Estimation**: Automatic token counting for all requests
- **Budget Limits**: Daily spending limits with automatic cutoffs
- **Usage Analytics**: Detailed cost breakdowns per lead/conversation
- **Caching**: Intelligent response caching to reduce API calls

## 📊 Analytics & Reporting

Track business metrics with built-in analytics:

- Lead conversion rates
- Conversation stages and progression
- AI usage and costs
- Email engagement metrics
- Session duration and quality

## 🔒 Security Features

- Environment variable protection
- API rate limiting
- Input validation and sanitization
- Secure WebSocket connections
- Database row-level security (RLS) ready

## 🚨 Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Check `NEXT_PUBLIC_LIVE_SERVER_URL` is correct
   - Ensure WebSocket server is deployed and running
   - Verify firewall/proxy settings allow WebSocket connections

2. **Database Connection Issues**
   - Verify Supabase credentials
   - Check if schema has been applied
   - Ensure RLS policies are configured correctly

3. **Email Not Sending**
   - Verify Resend API key
   - Check FROM_EMAIL domain is verified
   - Review email logs in Supabase

4. **High AI Costs**
   - Review daily budget limits in GeminiService
   - Enable caching for repeated requests
   - Monitor token usage in analytics

## 🤝 Contributing

1. Follow the established architecture patterns
2. Add comprehensive error handling
3. Include proper TypeScript types
4. Update documentation for new features
5. Test both frontend and WebSocket server integration

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ for production-scale AI applications**
