# CRAudioVizAI Orchestrator System

**Status:** Production-Ready - Fully Implemented  
**Stack:** Vercel Edge Functions + Supabase (PostgreSQL + Edge Functions) + GitHub  
**Created:** January 23, 2026

---

## Overview

The Orchestrator is the central coordination layer for CRAudioVizAI's multi-agent AI system. It routes tasks between Claude (Anthropic), ChatGPT (OpenAI), and Javari (internal platform AI), manages knowledge base updates via embeddings, and processes system events from GitHub webhooks and platform activity.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL EDGE LAYER                         │
├─────────────────────────────────────────────────────────────┤
│  /api/orchestrator     → Main task coordinator              │
│  /api/github-webhook   → GitHub events processor            │
│  /api/javari-events    → Platform events handler            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   SUPABASE DATABASE                          │
├─────────────────────────────────────────────────────────────┤
│  ai_tasks          → Task queue & results                   │
│  ai_events         → Event audit log                        │
│  embeddings        → Knowledge base vectors                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              SUPABASE EDGE FUNCTIONS                         │
├─────────────────────────────────────────────────────────────┤
│  processClaudeTask     → Execute via Anthropic API          │
│  updateKnowledge       → Generate embeddings via OpenAI     │
└─────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
orchestrator/
├── .env.example                       → Environment variables template
├── README.md                          → This file
├── IMPLEMENTATION_SUMMARY.md          → Technical implementation details
├── vercel/api/
│   ├── orchestrator.ts                → Main task coordination endpoint
│   ├── github-webhook.ts              → GitHub event processor
│   └── javari-events.ts               → Platform event handler
├── supabase/
│   ├── functions/
│   │   ├── processClaudeTask/index.ts → Claude API integration
│   │   └── updateKnowledge/index.ts   → Embeddings generator
│   └── migrations/
│       ├── ai_tasks.sql               → Task queue table
│       ├── ai_events.sql              → Event log table
│       └── embeddings.sql             → Vector search table
└── types/
    ├── TaskEnvelope.ts                → Task type definitions
    └── EventPacket.ts                 → Event type definitions
```

---

## Environment Variables

### Required Variables

#### Supabase Configuration

**`NEXT_PUBLIC_SUPABASE_URL`**
- **Description:** Your Supabase project URL
- **Where to find:** Supabase Dashboard → Settings → API → Project URL
- **Example:** `https://abcdefghijklmnop.supabase.co`
- **Used by:** Vercel API endpoints (client-safe)

**`SUPABASE_SERVICE_ROLE_KEY`**
- **Description:** Supabase service role secret key (bypasses RLS)
- **Where to find:** Supabase Dashboard → Settings → API → service_role secret
- **Security:** 🔒 NEVER commit to version control or expose client-side
- **Used by:** Vercel API endpoints, Supabase Edge Functions

**`SUPABASE_ANON_KEY`**
- **Description:** Supabase anonymous public key
- **Where to find:** Supabase Dashboard → Settings → API → anon public
- **Security:** ✅ Safe to expose in client-side code
- **Used by:** Client-side Supabase queries (if needed)

**`SUPABASE_URL`**
- **Description:** Supabase project URL (duplicate of NEXT_PUBLIC_SUPABASE_URL)
- **Used by:** Supabase Edge Functions (server-side context)

#### AI API Keys

**`ANTHROPIC_API_KEY`**
- **Description:** API key for Claude integration via Anthropic
- **Where to get:** https://console.anthropic.com/settings/keys
- **Format:** `sk-ant-api03-...`
- **Used by:** `processClaudeTask` Edge Function
- **Pricing:** Pay-per-use (Claude Sonnet 4 tokens)

**`OPENAI_API_KEY`**
- **Description:** API key for generating text embeddings
- **Where to get:** https://platform.openai.com/api-keys
- **Format:** `sk-proj-...`
- **Used by:** `updateKnowledge` Edge Function
- **Model:** text-embedding-ada-002

#### GitHub Integration

**`GITHUB_TOKEN`**
- **Description:** GitHub Personal Access Token or GitHub App token
- **Where to get:** https://github.com/settings/tokens (Personal Access Tokens)
- **Required scopes:** `repo` (full control of private repositories)
- **Format:** `ghp_...` or `github_pat_...`
- **Used by:** `processClaudeTask` (commits files), `updateKnowledge` (fetches files)

#### Internal APIs

**`JAVARI_EVENTS_URL`**
- **Description:** Full URL to your deployed Javari events endpoint
- **Format:** `https://your-domain.vercel.app/api/javari-events`
- **Used by:** `updateKnowledge` to notify Javari platform of blueprint updates
- **Example:** `https://craudiovizai.vercel.app/api/javari-events`

### Optional Variables

**`VERCEL_SERVER_KEY`**
- **Description:** Vercel API token for automated deployments
- **Where to get:** https://vercel.com/account/tokens
- **Used by:** CI/CD pipelines (optional)

**`GITHUB_WEBHOOK_SECRET`**
- **Description:** Secret for GitHub webhook signature verification
- **Used by:** `/api/github-webhook` (enhanced security, currently not enforced)

**`JAVARI_INTERNAL_API_KEY`**
- **Description:** Internal API key for Javari system authentication
- **Used by:** `/api/javari-events` (future authentication layer)

---

## Setup Instructions

### 1. Prerequisites

- ✅ Supabase account and project created
- ✅ Vercel account (free tier works)
- ✅ GitHub account with repository access
- ✅ Anthropic API key (Claude access)
- ✅ OpenAI API key (embeddings access)
- ✅ Node.js 18+ installed locally
- ✅ Supabase CLI installed: `npm install -g supabase`

### 2. Clone and Configure

```bash
# Clone the orchestrator directory
cd /path/to/your/project

# Copy environment variables template
cp orchestrator/.env.example orchestrator/.env.local

# Edit .env.local with your actual credentials
nano orchestrator/.env.local
```

### 3. Run Database Migrations

**Option A: Via Supabase Dashboard (Recommended for First Time)**

1. Go to Supabase Dashboard → SQL Editor
2. Create a new query
3. Copy contents of `supabase/migrations/ai_tasks.sql`
4. Run the query
5. Repeat for `ai_events.sql`
6. Repeat for `embeddings.sql`
7. Verify tables exist in Table Editor

**Option B: Via Supabase CLI**

```bash
# Link to your Supabase project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push

# Verify migrations
supabase db diff
```

**Option C: Manual SQL Execution**

```bash
# Connect to your Supabase database via psql
psql "postgresql://postgres:[YOUR-PASSWORD]@db.your-project.supabase.co:5432/postgres"

# Run each migration file
\i orchestrator/supabase/migrations/ai_tasks.sql
\i orchestrator/supabase/migrations/ai_events.sql
\i orchestrator/supabase/migrations/embeddings.sql

# Verify tables
\dt
```

**Enable pgvector Extension:**

If you get an error about the `vector` extension:

```sql
-- Run in Supabase SQL Editor or psql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 4. Deploy Vercel API Endpoints

**Option A: Via Vercel Dashboard**

1. Go to your Vercel project
2. Navigate to the Functions section
3. Add the API route files:
   - `pages/api/orchestrator.ts`
   - `pages/api/github-webhook.ts`
   - `pages/api/javari-events.ts`
4. Configure environment variables in Settings → Environment Variables
5. Deploy via Git push or manual deployment

**Option B: Via Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link project
vercel link

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
# ... add all required variables

# Deploy
vercel --prod
```

**File Placement in Next.js Project:**

```
your-nextjs-project/
├── pages/api/
│   ├── orchestrator.ts       ← Copy from orchestrator/vercel/api/
│   ├── github-webhook.ts     ← Copy from orchestrator/vercel/api/
│   └── javari-events.ts      ← Copy from orchestrator/vercel/api/
```

### 5. Deploy Supabase Edge Functions

**Initialize Supabase Functions:**

```bash
# Navigate to your project
cd your-project

# Create functions directory if it doesn't exist
mkdir -p supabase/functions

# Copy Edge Functions
cp -r orchestrator/supabase/functions/processClaudeTask supabase/functions/
cp -r orchestrator/supabase/functions/updateKnowledge supabase/functions/
```

**Deploy Edge Functions:**

```bash
# Deploy processClaudeTask
supabase functions deploy processClaudeTask

# Deploy updateKnowledge
supabase functions deploy updateKnowledge

# Verify deployments
supabase functions list
```

**Set Edge Function Secrets:**

```bash
# Set secrets (environment variables for Edge Functions)
supabase secrets set ANTHROPIC_API_KEY=sk-ant-api03-...
supabase secrets set OPENAI_API_KEY=sk-proj-...
supabase secrets set GITHUB_TOKEN=ghp_...
supabase secrets set SUPABASE_URL=https://your-project.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJ...
supabase secrets set JAVARI_EVENTS_URL=https://your-domain.vercel.app/api/javari-events

# Verify secrets are set
supabase secrets list
```

**Test Edge Functions:**

```bash
# Test processClaudeTask locally
supabase functions serve processClaudeTask

# In another terminal, test the function
curl -i --location --request POST 'http://localhost:54321/functions/v1/processClaudeTask' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{}'

# Test updateKnowledge
supabase functions serve updateKnowledge

curl -i --location --request POST 'http://localhost:54321/functions/v1/updateKnowledge' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "repository": "CR-AudioViz-AI/javari-docs",
    "filePath": "docs/blueprints/test.md",
    "branch": "main"
  }'
```

### 6. Configure GitHub Webhook

**Set Up Webhook:**

1. Go to your GitHub repository → Settings → Webhooks
2. Click "Add webhook"
3. Configure:
   - **Payload URL:** `https://your-domain.vercel.app/api/github-webhook`
   - **Content type:** `application/json`
   - **Secret:** (optional) your `GITHUB_WEBHOOK_SECRET`
   - **Events:** Select "Let me select individual events"
     - ✅ Pushes
     - ✅ Pull requests
     - ✅ Issues
4. Click "Add webhook"
5. Test by pushing a commit to your repository

**Verify Webhook Delivery:**

1. Go to Settings → Webhooks → Recent Deliveries
2. Check for 200 OK responses
3. Review request/response payloads

---

## Testing the Orchestrator

### Test 1: Create a Task via Orchestrator API

```bash
# Create a documentation task
curl -X POST https://your-domain.vercel.app/api/orchestrator \
  -H "Content-Type: application/json" \
  -d '{
    "taskType": "documentation",
    "priority": "high",
    "payload": {
      "description": "Document the CRAudioVizAI orchestrator system architecture",
      "context": {
        "repository": "CR-AudioViz-AI/javari-docs",
        "filePath": "docs/orchestrator-overview.md",
        "branch": "main"
      }
    }
  }'

# Expected response:
# {
#   "success": true,
#   "task_id": "uuid-here",
#   "assigned_agent": "claude",
#   "status": "pending"
# }
```

**Verify in Supabase:**

```sql
-- Check ai_tasks table
SELECT * FROM ai_tasks ORDER BY created_at DESC LIMIT 5;

-- Check ai_events table
SELECT * FROM ai_events WHERE event_type = 'task_created' ORDER BY timestamp DESC LIMIT 5;
```

### Test 2: Process Task with Claude

**Manual Trigger:**

```bash
# Invoke processClaudeTask Edge Function
curl -X POST https://your-project.supabase.co/functions/v1/processClaudeTask \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"

# Expected response:
# {
#   "success": true,
#   "taskId": "uuid-here",
#   "commit_sha": "abc123...",
#   "github_url": "https://github.com/..."
# }
```

**Verify Results:**

1. Check Supabase `ai_tasks` table for `status='completed'`
2. Check GitHub repository for new commit
3. Check `ai_events` table for `event_type='commit'`

### Test 3: GitHub Webhook Event

```bash
# Simulate a push event (or actually push to your repo)
git add .
git commit -m "docs: test orchestrator webhook"
git push origin main

# Webhook should automatically trigger
```

**Verify in Supabase:**

```sql
-- Check for github_push event
SELECT * FROM ai_events WHERE event_type = 'github_push' ORDER BY timestamp DESC LIMIT 1;

-- Check for individual commit events
SELECT * FROM ai_events WHERE event_type = 'commit' ORDER BY timestamp DESC LIMIT 5;
```

### Test 4: Knowledge Base Update

**Manual Trigger:**

```bash
# Invoke updateKnowledge Edge Function
curl -X POST https://your-project.supabase.co/functions/v1/updateKnowledge \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "repository": "CR-AudioViz-AI/javari-docs",
    "filePath": "docs/blueprints/Javariverse_Master_Blueprint.md",
    "branch": "main",
    "category": "blueprints"
  }'

# Expected response:
# {
#   "success": true,
#   "chunks_processed": 15,
#   "embeddings_created": 15
# }
```

**Verify Embeddings:**

```sql
-- Check embeddings table
SELECT id, source, category, chunk_index, total_chunks 
FROM embeddings 
WHERE category = 'blueprints' 
ORDER BY created_at DESC 
LIMIT 10;

-- Test vector similarity search
SELECT content, source, 1 - (embedding <=> '[0.1, 0.2, ...]'::vector) as similarity
FROM embeddings
WHERE category = 'blueprints'
ORDER BY embedding <=> '[0.1, 0.2, ...]'::vector
LIMIT 5;
```

### Test 5: Javari Events API

```bash
# Send a blueprint_updated event
curl -X POST https://your-domain.vercel.app/api/javari-events \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "blueprint_updated",
    "source": "updateKnowledge",
    "priority": "medium",
    "data": {
      "repository": "CR-AudioViz-AI/javari-docs",
      "file_path": "docs/test.md",
      "chunks_added": 5
    }
  }'

# Expected response:
# {
#   "success": true,
#   "eventType": "blueprint_updated",
#   "processed": true
# }
```

**Verify Event Logged:**

```sql
SELECT * FROM ai_events WHERE event_type = 'blueprint_updated' ORDER BY timestamp DESC LIMIT 5;
```

---

## Monitoring and Debugging

### Check Edge Function Logs

```bash
# View processClaudeTask logs
supabase functions logs processClaudeTask

# View updateKnowledge logs
supabase functions logs updateKnowledge

# Follow logs in real-time
supabase functions logs processClaudeTask --follow
```

### Check Vercel Logs

1. Go to Vercel Dashboard → Your Project → Logs
2. Filter by function: `api/orchestrator`, `api/github-webhook`, `api/javari-events`
3. Monitor real-time requests and errors

### Common Issues and Solutions

**Issue: "Failed to fetch pending task"**
- ✅ Verify migrations ran successfully
- ✅ Check SUPABASE_SERVICE_ROLE_KEY is correct
- ✅ Verify RLS policies are not blocking service role

**Issue: "Claude API error: 401"**
- ✅ Verify ANTHROPIC_API_KEY is correct
- ✅ Check API key has credits/billing set up
- ✅ Verify key is set in Supabase secrets

**Issue: "GitHub commit failed: 404"**
- ✅ Verify repository name is correct
- ✅ Check GITHUB_TOKEN has `repo` scope
- ✅ Verify token has access to the repository
- ✅ Check branch exists

**Issue: "OpenAI API error: 401"**
- ✅ Verify OPENAI_API_KEY is correct
- ✅ Check API key has credits
- ✅ Verify key is set in Supabase secrets

**Issue: "pgvector extension not found"**
- ✅ Enable extension: `CREATE EXTENSION IF NOT EXISTS vector;`
- ✅ Run in Supabase SQL Editor
- ✅ Retry migration

---

## Production Deployment Checklist

- [ ] All environment variables configured in Vercel
- [ ] All Supabase secrets set for Edge Functions
- [ ] Database migrations executed successfully
- [ ] pgvector extension enabled
- [ ] Vercel API endpoints deployed and accessible
- [ ] Supabase Edge Functions deployed
- [ ] GitHub webhook configured and tested
- [ ] Test task creation via orchestrator API
- [ ] Test Claude task processing end-to-end
- [ ] Test knowledge base update with embeddings
- [ ] Test Javari events logging
- [ ] Monitor logs for errors
- [ ] Set up alerting for failed tasks
- [ ] Document any custom configuration

---

## Architecture Decisions

### Why Vercel Edge Functions?
- Global edge network (low latency)
- Auto-scaling
- Zero config deployment
- Tight Next.js integration

### Why Supabase Edge Functions?
- Deno runtime (modern TypeScript)
- Direct database access
- Secrets management
- Cost-effective for background tasks

### Why pgvector?
- Native PostgreSQL extension
- Efficient vector similarity search
- No separate vector database needed
- Integrates with existing Supabase setup

### Why Multiple Event Types?
- Granular audit trail
- Easy filtering and analytics
- Clear separation of concerns
- Supports future event-driven workflows

---

## Next Steps

1. **Set up automated task processing:**
   - Create a cron job to trigger `processClaudeTask` every 5 minutes
   - Use Supabase scheduled functions or external cron service

2. **Implement task priority queue:**
   - Add logic to process critical tasks first
   - Implement retry mechanism for failed tasks

3. **Add monitoring and alerting:**
   - Set up Sentry or similar for error tracking
   - Create alerts for failed tasks
   - Monitor API costs (Anthropic, OpenAI)

4. **Enhance security:**
   - Implement GitHub webhook signature verification
   - Add API key authentication for Javari events
   - Set up rate limiting

5. **Build admin dashboard:**
   - View pending/completed tasks
   - Monitor system health
   - Manually trigger tasks
   - View embeddings and search knowledge base

---

## Support and Feedback

For questions, issues, or feature requests:
- Review IMPLEMENTATION_SUMMARY.md for technical details
- Check Supabase logs for Edge Function errors
- Check Vercel logs for API endpoint errors
- Review GitHub webhook delivery logs

---

**Documentation Version:** 2.0  
**Last Updated:** January 23, 2026  
**Status:** Production-Ready - Fully Implemented
