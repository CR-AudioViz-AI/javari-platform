# Multi-AI Orchestrator - Phase B Complete

**Status**: ✅ Phase B Complete - Full Multi-Provider Integration  
**Date**: January 13, 2026  
**Providers**: 10 fully integrated (OpenAI, Anthropic, Google, Groq, Perplexity, Mistral, Together, Cohere, OpenRouter, DeepInfra)

---

## Phase B Overview

Phase B transforms the orchestrator from a single-provider foundation into a complete multi-AI routing system with:

✅ **10 Provider Adapters** - Real API integrations for all major LLM providers  
✅ **Smart Routing** - Cost-based, speed-based, or capability-based provider selection  
✅ **Automatic Fallback** - Resilient request handling with retry chains  
✅ **Streaming Support** - Real-time response streaming from all providers  
✅ **Environment Validation** - Automatic provider detection and activation  
✅ **Enhanced Routing Engine** - Multi-provider selection with transparency  

---

## Provider Matrix

| Provider | Model | Input/1M | Output/1M | Latency | Context | Capabilities |
|----------|-------|----------|-----------|---------|---------|--------------|
| **OpenAI** | gpt-4o-mini | $0.15 | $0.60 | ~1500ms | 128K | text, functions, vision, streaming |
| **Anthropic** | claude-3-5-haiku | $0.80 | $4.00 | ~2000ms | 200K | text, vision, long-context, streaming |
| **Gemini** | gemini-1.5-flash | $0.075 | $0.30 | ~1800ms | 1000K | text, vision, ultra-long-context |
| **Groq** | llama-3.3-70b | $0.59 | $0.79 | ~400ms | 32K | text, fast-inference |
| **Perplexity** | sonar | $1.00 | $1.00 | ~2500ms | 127K | text, online-search, citations |
| **Mistral** | mistral-large | $2.00 | $6.00 | ~1600ms | 128K | text, functions, streaming |
| **Together** | llama-3.1-70b | $0.88 | $0.88 | ~1200ms | 32K | text, streaming |
| **Cohere** | command-r | $0.50 | $1.50 | ~1400ms | 128K | text, embeddings, streaming |
| **OpenRouter** | claude-3.5-sonnet | $3.00 | $15.00 | ~2000ms | 200K | text, multi-model, streaming |
| **DeepInfra** | llama-3.1-70b | $0.35 | $0.40 | ~1100ms | 131K | text, streaming |

---

## Environment Setup

### 1. Copy Environment Template
```bash
cp .env.example .env
```

### 2. Add Provider API Keys
Edit `.env` and add keys for providers you want to use:

```env
# At least one provider required
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=AI...
GROQ_API_KEY=gsk_...
PERPLEXITY_API_KEY=pplx-...
MISTRAL_API_KEY=...
TOGETHER_API_KEY=...
COHERE_API_KEY=...
OPENROUTER_API_KEY=sk-or-...
DEEPINFRA_API_KEY=...
```

### 3. Verify Configuration
```bash
# Check which providers are active
curl http://localhost:3000/api/ai/providers
```

---

## API Endpoints

### POST /api/ai/generate
Main generation endpoint with automatic provider routing.

**Request**:
```json
{
  "prompt": "Explain quantum computing",
  "systemPrompt": "You are a helpful physics teacher",
  "temperature": 0.7,
  "maxTokens": 500,
  "provider": "openai",  // Optional: specify provider
  "userId": "user-123",
  "priority": "normal"
}
```

**Response**:
```json
{
  "success": true,
  "requestId": "uuid",
  "content": "Generated response...",
  "usage": { "promptTokens": 10, "completionTokens": 50, "totalTokens": 60 },
  "costUSD": 0.0024,
  "latencyMs": 850,
  "provider": "openai",
  "model": "gpt-4o-mini"
}
```

### GET /api/ai/health
Health check for all configured providers.

**Response**:
```json
{
  "overall": "healthy",
  "providers": {
    "openai": { "status": "healthy", "latencyMs": 75 },
    "anthropic": { "status": "healthy", "latencyMs": 120 }
  },
  "routing": {
    "activeProviders": 2,
    "routingStrategy": "cheapest",
    "providers": ["openai", "anthropic"]
  }
}
```

### GET /api/ai/providers
List all providers with metadata.

**Response**:
```json
{
  "total": 10,
  "active": 3,
  "providers": [
    {
      "name": "openai",
      "displayName": "OpenAI",
      "isConfigured": true,
      "defaultModel": "gpt-4o-mini",
      "capabilities": ["text-generation", "streaming"],
      "estimatedCost": { "inputPerMToken": 0.15, "outputPerMToken": 0.6 }
    }
  ]
}
```

### POST /api/ai/stream
Streaming generation endpoint.

**Request**:
```json
{
  "prompt": "Tell me a story",
  "provider": "anthropic",  // Optional
  "model": "claude-3-5-haiku-20241022"  // Optional
}
```

**Response**: Server-Sent Events stream

---

## Routing Strategies

### Cost-Based (Default)
Selects the cheapest provider capable of handling the request.

```typescript
const router = new RouterEngine({
  routingStrategy: 'cheapest'
});
```

### Speed-Based
Selects the fastest provider (lowest latency).

```typescript
const router = new RouterEngine({
  routingStrategy: 'fastest'
});
```

### Specified Provider
User explicitly requests a specific provider.

```json
{
  "prompt": "Hello",
  "provider": "groq"  // Forces Groq usage
}
```

### Capability-Based
Automatically selects providers based on required capabilities.

```typescript
// Example: Only providers with 'vision' capability
const providers = getProvidersWithCapability('vision');
```

---

## Fallback & Retry Logic

The router automatically handles provider failures:

1. **Primary Provider Fails** → Try first fallback
2. **First Fallback Fails** → Try second fallback
3. **All Fallbacks Fail** → Return error

```typescript
const router = new RouterEngine({
  enableFallback: true,
  maxRetries: 2
});
```

**Example Fallback Chain**:
1. Primary: `openai` (fails)
2. Fallback 1: `anthropic` (fails)
3. Fallback 2: `groq` (succeeds) ✓

---

## Cost Optimization

### Automatic Cost Estimation
Every request estimates cost before execution:

```typescript
const cost = await adapter.estimateCost(request);
// Returns: { estimatedCostUSD, inputTokenCost, outputTokenCost }
```

### Approval Gates
Requests exceeding cost threshold require approval:

```typescript
// Default: $1.00 threshold
const router = new RouterEngine({
  autoApproveThresholdUSD: 1.0
});
```

### Cost Comparison
Get the cheapest active provider:

```typescript
const cheapest = getCheapestProvider();
console.log(`Cheapest: ${cheapest.name} at $${cheapest.estimatedCostPerMToken.input}/1M tokens`);
```

---

## Testing Phase B

### Run Test Harness
```bash
npm run test:orchestrator
# or
ts-node orchestrator/tests/phase-b-tests.ts
```

### Test Output
```
══════════════════════════════════════
   Phase B Test Harness - Simulation
══════════════════════════════════════

✓ Environment Validation
  Configured: 3/10 providers
  Active: openai, anthropic, groq

✓ Provider Registry: 10 total, 3 active
  - OpenAI: $0.15/$0.6 per 1M tokens
  - Anthropic (Claude): $0.8/$4 per 1M tokens
  - Groq: $0.59/$0.79 per 1M tokens

✓ Cost Estimation (openai): $0.000024

✓ Provider Selection
  Cheapest: OpenAI
  Fastest: Groq

✓ Health Checks (3 providers)
  OpenAI: healthy
  Anthropic (Claude): healthy
  Groq: healthy

══════════════════════════════════════
   Test Summary: 5/5 passed
══════════════════════════════════════
```

---

## Architecture

### Provider Adapter Pattern
Every provider implements the same interface:

```typescript
interface LLMAdapter {
  generate(request): Promise<Response>
  stream(request): Promise<ReadableStream>
  healthCheck(): Promise<HealthStatus>
  estimateCost(request): Promise<CostEstimate>
  getRateLimits(): Promise<RateLimits>
  supports(capability): boolean
}
```

### Router Decision Flow
```
Request → Validate → Select Provider → Estimate Cost → Check Approval → Execute → Log → Return
                          ↓
                  (Primary Provider)
                          ↓
                    [Try Execute]
                          ↓
                   Success? → Return
                      No ↓
                  Try Fallback #1
                          ↓
                   Success? → Return
                      No ↓
                  Try Fallback #2
                          ↓
                   Success? → Return
                      No ↓
                    Return Error
```

---

## Configuration Reference

### Router Config
```typescript
interface RouterConfig {
  defaultProvider?: string;              // Default: none (auto-select)
  routingStrategy?: 'cheapest' | 'fastest' | 'specified';
  autoApproveThresholdUSD?: number;     // Default: 1.0
  enableAudit?: boolean;                 // Default: true
  enableFallback?: boolean;              // Default: true
  maxRetries?: number;                   // Default: 2
}
```

### Environment Variables
```env
# Provider API Keys (at least one required)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GEMINI_API_KEY=
GROQ_API_KEY=
PERPLEXITY_API_KEY=
MISTRAL_API_KEY=
TOGETHER_API_KEY=
COHERE_API_KEY=
OPENROUTER_API_KEY=
DEEPINFRA_API_KEY=

# Orchestrator Configuration
ORCHESTRATOR_AUTO_APPROVE_THRESHOLD_USD=1.00
ORCHESTRATOR_ENABLE_AUDIT=true
ORCHESTRATOR_DEFAULT_PROVIDER=openai
```

---

## What's Next (Phase C)

Phase C will add:
1. **Database Persistence** - Move audit logs to Supabase
2. **Advanced Analytics** - Usage tracking, cost analysis dashboards
3. **A/B Testing** - Compare provider outputs for quality
4. **Response Caching** - Cache common requests to reduce costs
5. **Custom Models** - Support for fine-tuned models
6. **Batch Processing** - Efficient handling of bulk requests
7. **Quality Monitoring** - Track response quality across providers
8. **User Quotas** - Per-user rate limiting and cost caps

---

## Key Metrics (Phase B)

- **Total Files**: 25+
- **Lines of Code**: ~3,000
- **Providers**: 10
- **API Endpoints**: 4
- **Routing Strategies**: 3
- **Test Coverage**: 5 test suites

---

## Security Notes

- **Never commit .env** - Contains API keys
- **API keys validated at runtime** - No hard-coded keys
- **Provider errors logged safely** - No key exposure in logs
- **Rate limiting respected** - Each adapter honors provider limits

---

**Phase B Complete!** 🎉

The Multi-AI Orchestrator now supports 10 providers with intelligent routing, automatic fallback, and comprehensive monitoring.

---

# Phase C: Workflows, Persistence & Analytics

**Status**: ✅ Complete  
**Features**: Workflow Engine, Supabase Persistence, Caching, Analytics

---

## New Capabilities

### 🔄 Workflow Engine
Execute multi-step AI workflows with:
- Sequential execution
- Conditional branching
- Retry logic
- Variable interpolation
- Cost limits
- Approval gates

### 💾 Supabase Persistence
- Audit logs stored in database
- Workflow definitions saved
- Workflow run history tracked
- Response caching with TTL
- Analytics pre-computation

### 📊 Analytics
- Provider usage statistics
- Cost analysis
- Latency metrics
- Cache hit rates
- Workflow success rates

### ⚡ Caching
- Request deduplication
- Response caching (24hr TTL)
- In-memory + Supabase tiers
- Hit count tracking

---

## Supabase Setup

### 1. Create Supabase Project
```
1. Go to https://supabase.com
2. Create new project
3. Copy URL and anon key
```

### 2. Run Migrations
```bash
# In Supabase SQL Editor
psql -f orchestrator/db/supabase/001_initial_schema.sql
```

### 3. Configure Environment
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

---

## Workflow DSL

### Basic Workflow
```json
{
  "name": "content-generation",
  "version": 1,
  "steps": [
    {
      "id": "generate",
      "action": "generate",
      "provider": "openai",
      "input": {
        "prompt": "Write a blog post about AI",
        "maxTokens": 500
      }
    }
  ]
}
```

### Multi-Step Workflow
```json
{
  "name": "research-and-summarize",
  "version": 1,
  "steps": [
    {
      "id": "research",
      "action": "generate",
      "provider": "perplexity",
      "input": {
        "prompt": "Research latest AI trends",
        "maxTokens": 1000
      },
      "onSuccess": "summarize"
    },
    {
      "id": "summarize",
      "action": "generate",
      "provider": "anthropic",
      "input": {
        "prompt": "Summarize: {{research.output}}",
        "maxTokens": 200
      }
    }
  ]
}
```

### Workflow with Retry
```json
{
  "name": "resilient-generation",
  "version": 1,
  "steps": [
    {
      "id": "generate",
      "action": "generate",
      "input": { "prompt": "Generate content" },
      "retry": {
        "maxAttempts": 3,
        "delayMs": 1000
      },
      "onFailure": "fallback"
    },
    {
      "id": "fallback",
      "action": "generate",
      "provider": "groq",
      "input": { "prompt": "Simple fallback" }
    }
  ]
}
```

---

## API Endpoints (Phase C)

### POST /api/workflows/run
Execute a workflow.

**Request**:
```json
{
  "workflow": { ... },  // Or use workflowId
  "userId": "user-123"
}
```

**Response**:
```json
{
  "success": true,
  "runId": "uuid",
  "status": "completed",
  "steps": [...],
  "totalCostUSD": 0.024,
  "totalLatencyMs": 1500
}
```

### POST /api/workflows/create
Save a workflow definition.

**Request**:
```json
{
  "name": "my-workflow",
  "version": 1,
  "definition": { ... }
}
```

### GET /api/workflows/list
List all saved workflows.

**Response**:
```json
{
  "total": 5,
  "workflows": [...]
}
```

### GET /api/workflows/runs
Get workflow execution history.

**Query Params**:
- `workflowId` - Filter by workflow
- `userId` - Filter by user
- `limit` - Max results (default: 50)

### GET /api/ai/analytics
Get usage analytics.

**Response**:
```json
{
  "overview": {
    "totalEvents": 1250,
    "totalCostUSD": "15.432000"
  },
  "providers": [
    { "provider": "openai", "requestCount": 500, "percentage": "40.0" }
  ],
  "cache": {
    "inMemorySize": 42
  }
}
```

---

## Database Schema

### ai_audit_log
Persistent audit trail for all AI requests.

**Key Fields**:
- `event_id`, `event_type`, `timestamp`
- `provider`, `model`, `tokens_in/out`
- `cost_usd`, `latency_ms`
- `routing_decision`, `fallback_used`
- `request_body`, `response_body` (JSONB)

**Indexes**:
- timestamp, user_id, provider, event_type

### ai_workflows
Workflow definitions storage.

**Key Fields**:
- `name`, `version`, `definition` (JSONB)
- `status` (active/archived/draft)

### ai_workflow_runs
Workflow execution history.

**Key Fields**:
- `workflow_id`, `user_id`, `status`
- `steps` (JSONB array)
- `total_cost_usd`, `total_latency_ms`

### ai_cache
Response caching for deduplication.

**Key Fields**:
- `request_hash` (unique)
- `response_body` (JSONB)
- `expires_at`, `hit_count`

---

## Caching Behavior

### Cache Key Generation
```typescript
const hash = SHA256({
  prompt,
  systemPrompt,
  temperature,
  maxTokens,
  provider
});
```

### Cache Tiers
1. **In-Memory** - Fastest, session-scoped
2. **Supabase** - Persistent, cross-session

### Cache Hit Flow
```
Request → Check Memory → HIT? Return
              ↓ MISS
         Check Supabase → HIT? Return + Store in Memory
              ↓ MISS
         Execute Request → Cache Result
```

### TTL Management
- Default: 24 hours
- Configurable per request
- Auto-cleanup via Supabase function

---

## Testing Phase C

### Run Test Harness
```bash
ts-node orchestrator/tests/phase-c-tests.ts
```

### Expected Output
```
══════════════════════════════════════
   Phase C Test Harness
══════════════════════════════════════

✓ Supabase Connection: configured
✓ Workflow Validation: passed
✓ Simple Workflow: completed (850ms, $0.000024)
✓ Branching Workflow: 2 steps executed
✓ Caching: hit/set working (1 entries)
✓ Audit Logging: 15 events, $0.000120 total cost

══════════════════════════════════════
   Test Summary: 6/6 passed
══════════════════════════════════════
```

---

## Performance Optimizations

### Caching Benefits
- ~100% cost reduction on cache hits
- Near-zero latency for cached responses
- Automatic deduplication

### Workflow Efficiency
- Parallel step execution (future)
- Early termination on failure
- Conditional branching reduces unnecessary calls

### Database Indexing
- Optimized queries on timestamp, user_id, provider
- JSONB indexes for fast metadata queries

---

## Phase C Metrics

- **Files Added**: 15
- **Database Tables**: 5
- **API Endpoints**: 8 total
- **Test Suites**: 6
- **Lines of Code**: ~2,500

---

**Phase C Complete!** 🎉

The orchestrator now includes workflow execution, persistent storage, intelligent caching, and comprehensive analytics.

**Next Phase (D)**: Advanced features like parallel execution, A/B testing, quality monitoring, and user quotas.

---

# Phase D: Enterprise Hardening

**Status**: ✅ Complete  
**Features**: Multi-Layer Rate Limiting, Circuit Breakers, Telemetry, Security Hardening, Workflow Sandboxing

---

## Enterprise Features

### 🛡️ Multi-Layer Rate Limiting

**6 Layers of Protection**:
1. **User-level**: 100 requests/minute per user
2. **IP-level**: 300 requests/minute per IP
3. **API Key-level**: 500 requests/minute per key
4. **Workflow-level**: 20 workflows/5min per user
5. **Provider-level**: 1,000 requests/minute per provider
6. **Global**: 5,000 requests/minute orchestrator-wide

**Features**:
- Sliding window counters
- Exponential cooldown after violations
- Persistent storage (Supabase)
- In-memory fallback
- Per-route configurability

**Example**:
```typescript
const result = await checkRateLimit('user', 'user-123');
if (!result.allowed) {
  // Rate limited, retry after ${result.retryAfterMs}ms
}
```

### ⚡ Provider Circuit Breakers

**Automatic Failure Detection**:
- Tracks rolling error rates (50% threshold)
- Monitors latency windows (5s slow call threshold)
- Auto-disables failing providers
- Auto-recovery after cooldown (1min default)

**States**:
- **Closed**: Normal operation
- **Open**: Provider disabled (too many failures)
- **Half-Open**: Testing recovery (3 attempts)

**Integration**:
```typescript
if (!globalCircuitBreaker.isAvailable('openai')) {
  // Fallback to alternate provider
}
```

### 📊 Observability & Telemetry

**Real-Time Metrics**:
- p50/p90/p95/p99 latency percentiles
- Error rate per provider
- Cost per 1M tokens (rolling average)
- Fallback frequency heatmap
- Routing distribution

**Endpoint**: `GET /api/ai/telemetry`

**Response**:
```json
{
  "metrics": {
    "providers": {
      "openai": {
        "latency": {
          "p50": 850,
          "p90": 1500,
          "p99": 2200,
          "mean": 950
        },
        "errorRate": 2.5,
        "successCount": 1234,
        "costPerMToken": 0.75
      }
    },
    "fallbacks": {
      "openai→anthropic": 12
    },
    "routing": {
      "openai": 850,
      "anthropic": 250
    }
  },
  "circuitBreakers": {
    "openai": {
      "state": "closed",
      "failureRate": 2.5,
      "avgLatency": 950
    }
  }
}
```

### 🔒 Security Hardening

**Input Sanitization**:
- Max input length enforcement (50KB)
- Null byte removal
- Whitespace normalization

**Sensitive Data Redaction**:
- SSN patterns: `123-45-6789` → `[REDACTED]`
- Credit cards: `4111-1111-1111-1111` → `[REDACTED]`
- Email addresses
- Phone numbers
- API keys (OpenAI/Anthropic patterns)

**Safe Templating**:
- Variable name validation (`^[a-zA-Z0-9_]+$`)
- Recursive reference detection
- Type coercion limits

### 🏖️ Workflow Sandbox

**Safety Limits**:
```typescript
const WORKFLOW_SAFETY_LIMITS = {
  MAX_STEPS: 20,
  MAX_TOTAL_COST_USD: 1.0,
  MAX_RUNTIME_MS: 300000, // 5 minutes
  MAX_RETRIES_PER_STEP: 5,
  MAX_TOKENS_PER_STEP: 10000,
};
```

**Protections**:
- Recursion detection (cycle analysis)
- Step count enforcement
- Cost limit enforcement
- Timeout handling
- Retry cap per step

**Example**:
```json
{
  "settings": {
    "maxTotalCost": 0.50,
    "timeout": 120000,
    "maxSteps": 10
  }
}
```

### 🔍 Enhanced Audit Correlation

**Correlation IDs**:
- `correlation_id`: Tracks entire workflow run
- `step_id`: Individual step tracking
- `run_group`: Batch/group identifier
- `replay_token`: Deterministic reproduction

**Query by Correlation**:
```typescript
const events = await auditLogger.queryLogs({
  correlationId: 'wf-run-12345'
});
```

---

## API Endpoints (Phase D)

### GET /api/ai/telemetry
Real-time metrics and observability.

**Response**:
```json
{
  "metrics": { ... },
  "circuitBreakers": { ... },
  "rateLimits": {
    "activeKeys": 42,
    "totalViolations": 5
  }
}
```

### GET /api/ai/health/full
Comprehensive system health check.

**Response**:
```json
{
  "status": "healthy",
  "uptime": 3600000,
  "components": {
    "environment": { "status": "healthy" },
    "database": { "status": "healthy" },
    "providers": { "status": "healthy", "details": { "active": 3 } },
    "circuitBreakers": { "status": "healthy" },
    "rateLimiting": { "status": "healthy" },
    "router": { "status": "healthy" }
  }
}
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] All required environment variables set
- [ ] Supabase connection tested
- [ ] At least 2 providers configured
- [ ] Rate limits configured appropriately
- [ ] Circuit breaker thresholds reviewed
- [ ] Security redaction enabled

### Health Checks

```bash
# 1. Full system health
curl https://your-domain/api/ai/health/full

# 2. Provider health
curl https://your-domain/api/ai/health

# 3. Telemetry baseline
curl https://your-domain/api/ai/telemetry

# 4. Provider list
curl https://your-domain/api/ai/providers
```

### Monitoring

**Key Metrics to Watch**:
1. Circuit breaker state (should be "closed")
2. Rate limit violations (should be minimal)
3. Error rate per provider (<5%)
4. p99 latency (<3 seconds)
5. Cost per 1M tokens (within budget)

### Production Settings

```env
# Rate Limiting
ORCHESTRATOR_RATE_LIMIT_USER_RPM=100
ORCHESTRATOR_RATE_LIMIT_GLOBAL_RPM=5000

# Circuit Breakers
ORCHESTRATOR_CIRCUIT_BREAKER_THRESHOLD=50
ORCHESTRATOR_CIRCUIT_BREAKER_COOLDOWN_MS=60000

# Security
ORCHESTRATOR_ENABLE_REDACTION=true
ORCHESTRATOR_MAX_INPUT_LENGTH=50000

# Workflow Sandbox
ORCHESTRATOR_MAX_WORKFLOW_STEPS=20
ORCHESTRATOR_MAX_WORKFLOW_COST=1.00
ORCHESTRATOR_MAX_WORKFLOW_RUNTIME_MS=300000
```

---

## Circuit Breaker Diagram

```
[Closed] ──failure rate >50%──> [Open]
    ↑                               │
    │                               │ cooldown (60s)
    │                               ↓
    └──3 successes──── [Half-Open]
                              │
                              └──failure──> [Open]
```

---

## Rate Limiting Flow

```
Request → Check User Limit → Check IP Limit → Check API Key Limit
            ↓ OK                ↓ OK              ↓ OK
        Check Workflow → Check Provider → Check Global
            ↓ OK         ↓ OK               ↓ OK
                    Allow Request
```

---

## Testing Phase D

### Run Test Harness
```bash
ts-node orchestrator/tests/phase-d-tests.ts
```

### Expected Output
```
══════════════════════════════════════
   Phase D Test Harness - Enterprise
══════════════════════════════════════

✓ Rate Limiting: working (95 remaining)
✓ Circuit Breaker Activation: open (100.0% failure rate)
✓ Circuit Breaker Recovery: closed
✓ Telemetry: collecting metrics
✓ Security Redaction: working
✓ Sandbox Safety: recursion detected
✓ Deployment Validation: 3 providers
✓ Full Health Check: healthy

══════════════════════════════════════
   Test Summary: 8/8 passed
══════════════════════════════════════
```

---

## Phase D Metrics

- **Files Added**: 10
- **Enterprise Features**: 6
- **Security Enhancements**: 4
- **API Endpoints**: 2
- **Test Suites**: 8
- **Lines of Code**: ~2,000

---

**Phase D Complete!** 🎉

The orchestrator is now production-ready with enterprise-grade hardening, comprehensive observability, and robust security.

**Production Status**: ✅ Ready for deployment

**Recommended Next Steps**:
1. Deploy to production environment
2. Configure monitoring dashboards
3. Set up alerting (circuit breakers, rate limits)
4. Establish SLAs per provider
5. Begin Phase E (Advanced Features)

---

# Phase E: AI-Driven Cost Intelligence

**Status**: ✅ Complete  
**Features**: Cost Ledger, Analytics Engine, AI Forecasting, Anomaly Detection, Admin Dashboard APIs

---

## Cost Intelligence Features

### 💰 Cost Ledger
**Table**: `ai_cost_ledger`

**Tracks Every AI Operation**:
- Provider & model used
- Token counts (input/output)
- Exact cost in USD
- Workflow association
- Cache hit status
- Fallback usage
- Anomaly flagging (auto-detected)

**Automatic Cost Ingestion**:
- Every generation writes to ledger
- Cost calculated using provider pricing table
- Anomalies detected (>2x historical average)
- Real-time tracking, zero configuration

---

### 📊 Cost Analytics Engine

**Real-Time Queries**:
```typescript
// Total spend for any time range
const summary = await costAnalyticsEngine.getTotalSpend(startDate, endDate);

// Provider cost breakdown
const breakdown = await costAnalyticsEngine.getProviderBreakdown(startDate, endDate);

// Workflow cost stats
const workflows = await costAnalyticsEngine.getWorkflowCostStats(startDate, endDate);

// Cache savings analysis
const savings = await costAnalyticsEngine.getCacheSavings(startDate, endDate);

// Current burn rate
const hourlyBurn = await costAnalyticsEngine.getHourlyBurnRate();
```

**Metrics Provided**:
- Total spend & request count
- Average cost per request
- Provider-level breakdown with percentages
- Workflow-level cost analysis
- Cache hit savings calculation
- Hourly/daily cost curves
- Top cost drivers

---

### 🤖 AI-Driven Forecast Engine

**Intelligent Forecasting**:
- **Linear Regression** - Trend line analysis
- **Exponential Smoothing** - Short-term predictions
- **Anomaly Detection** - Risk scoring (0-100)
- **7-Day Projection** - Near-term cost estimate
- **30-Day Projection** - Monthly budget forecast

**Endpoint**: `GET /api/admin/costs/forecast`

**Sample Response**:
```json
{
  "projected7DayCost": 45.32,
  "projected30DayCost": 189.45,
  "projectedMonthlyRecurring": 189.45,
  "anomalyRiskScore": 15.2,
  "confidenceLevel": 78,
  "trendDirection": "increasing",
  "topCostDrivers": [
    {
      "name": "openai",
      "cost": 12.45,
      "projection": 14.94
    }
  ],
  "recommendedActions": [
    "Cost trend is increasing - review recent provider usage changes",
    "Consider enabling more aggressive caching to reduce costs"
  ],
  "metadata": {
    "dataPoints": 24,
    "forecastMethod": "linear-regression-exponential-smoothing",
    "lastUpdated": "2026-01-13T16:00:00Z"
  }
}
```

**Forecast Methods**:
1. **Trend Analysis**: Linear regression on historical data
2. **Smoothing**: Exponential smoothing (α=0.3)
3. **Projection**: Weighted combination of trend + last value
4. **Confidence**: Based on data quantity + trend stability

---

### 🚨 Cost Alerts & Anomaly Detection

**Automatic Monitoring**:
- **Daily Threshold**: Alert when daily spend >$50
- **Provider Drift**: Alert when provider cost changes >30%
- **Workflow Overrun**: Flag workflows >2x baseline
- **Anomaly Detection**: Auto-flag unusual costs

**Alert Types**:
- `threshold` - Budget limits exceeded
- `anomaly` - Unusual cost spike detected
- `drift` - Provider pricing changed
- `spike` - Sudden cost increase

**Endpoint**: `GET /api/admin/costs/anomalies`

**Sample Alert**:
```json
{
  "alertType": "drift",
  "severity": "warning",
  "provider": "openai",
  "thresholdValue": 0.0015,
  "actualValue": 0.0024,
  "message": "Provider openai cost increased by 60%",
  "metadata": {
    "priorAvg": 0.0015,
    "currentAvg": 0.0024
  }
}
```

---

## Admin Dashboard APIs

### GET /api/admin/costs/summary
Overview of all cost metrics.

**Response**:
```json
{
  "daily": {
    "totalSpend": 12.45,
    "requestCount": 1234,
    "avgCostPerRequest": 0.0101
  },
  "weekly": {
    "totalSpend": 78.32,
    "requestCount": 8456
  },
  "monthly": {
    "totalSpend": 345.67,
    "requestCount": 34567
  },
  "hourlyBurnRate": 0.52,
  "cacheSavings": {
    "cacheHits": 456,
    "cacheMisses": 778,
    "cacheHitRate": 36.9,
    "estimatedSavings": 4.56
  }
}
```

### GET /api/admin/costs/providers
Provider cost breakdown.

### GET /api/admin/costs/workflows
Workflow cost statistics.

### GET /api/admin/costs/forecast
AI-driven cost projections.

### GET /api/admin/costs/anomalies
Recent cost alerts and anomalies.

---

## Provider Pricing Configuration

**File**: `orchestrator/providers/pricing.ts`

**Current Pricing** (as of Jan 2026):

| Provider | Model | Input/1M | Output/1M |
|----------|-------|----------|-----------|
| OpenAI | gpt-4o-mini | $0.150 | $0.600 |
| Anthropic | claude-3-5-haiku | $0.800 | $4.000 |
| Gemini | gemini-1.5-flash | $0.075 | $0.300 |
| Groq | llama-3.3-70b | $0.590 | $0.790 |
| Perplexity | sonar | $1.000 | $1.000 |
| Mistral | mistral-large | $2.000 | $6.000 |
| Together | llama-3.1-70b | $0.880 | $0.880 |
| Cohere | command-r | $0.500 | $1.500 |
| OpenRouter | claude-3.5-sonnet | $3.000 | $15.000 |
| DeepInfra | llama-3.1-70b | $0.350 | $0.400 |

**Cost Calculation**:
```typescript
const cost = calculateCost('openai', 'gpt-4o-mini', tokensIn, tokensOut);
// Returns exact USD cost
```

---

## Cost Optimization Guide

### 1. Enable Aggressive Caching
```typescript
// Workflow with caching
{
  "steps": [
    {
      "id": "step1",
      "cache": true  // Enable step-level caching
    }
  ],
  "settings": {
    "enableCaching": true  // Global caching
  }
}
```

**Savings**: ~100% on cache hits

### 2. Choose Cheaper Providers
**For simple tasks**: Use Gemini ($0.075/$0.3) or DeepInfra ($0.35/$0.4)  
**For quality**: Use Claude Haiku ($0.8/$4) over Claude Sonnet ($3/$15)  
**For speed**: Use Groq ($0.59/$0.79) with fast inference

### 3. Set Cost Limits
```typescript
{
  "settings": {
    "maxTotalCost": 0.50  // Workflow cost cap
  }
}
```

### 4. Monitor Fallback Costs
Fallbacks can be expensive if they use more expensive providers. Review fallback frequency in analytics.

### 5. Optimize Token Usage
- Use concise prompts
- Set appropriate `maxTokens` limits
- Leverage streaming for early termination

---

## Database Schema (Phase E)

### ai_cost_ledger
```sql
CREATE TABLE ai_cost_ledger (
    id UUID PRIMARY KEY,
    timestamp TIMESTAMPTZ,
    provider TEXT,
    model TEXT,
    tokens_in INTEGER,
    tokens_out INTEGER,
    cost_usd NUMERIC(12, 8),
    workflow_id UUID,
    user_id TEXT,
    cache_hit BOOLEAN,
    fallback_used BOOLEAN,
    anomaly_flag BOOLEAN,
    metadata JSONB
);
```

### ai_provider_pricing
```sql
CREATE TABLE ai_provider_pricing (
    provider TEXT,
    model TEXT,
    cost_per_1m_input NUMERIC(10, 4),
    cost_per_1m_output NUMERIC(10, 4),
    effective_date TIMESTAMPTZ
);
```

### ai_cost_alerts
```sql
CREATE TABLE ai_cost_alerts (
    alert_type TEXT,  -- threshold, anomaly, drift, spike
    severity TEXT,     -- info, warning, critical
    provider TEXT,
    threshold_value NUMERIC,
    actual_value NUMERIC,
    message TEXT,
    resolved BOOLEAN
);
```

---

## Testing Phase E

### Run Test Harness
```bash
ts-node orchestrator/tests/phase-e-tests.ts
```

### Expected Output
```
══════════════════════════════════════
   Phase E Test Harness - Cost Intelligence
══════════════════════════════════════

✓ Cost Calculation: accurate ($0.000450 vs $0.000450)
✓ Cost Analytics: $12.3400 total, 3 providers
✓ Forecast Generation: 7-day projection $45.32, confidence 78%
✓ Cost Alerts: 2 active alerts
✓ Ledger Integration: Supabase connected

══════════════════════════════════════
   Test Summary: 5/5 passed
══════════════════════════════════════
```

---

## Phase E Metrics

- **Files Added**: 10+
- **Database Tables**: 3
- **API Endpoints**: 5
- **Test Suites**: 5
- **Lines of Code**: ~2,000
- **AI Features**: Forecasting, anomaly detection, trend analysis

---

**Phase E Complete!** 🎉

The orchestrator now includes complete financial intelligence with AI-driven forecasting, real-time analytics, and comprehensive cost tracking.

**Cost Intelligence Status**: ✅ **READY FOR PRODUCTION**

---

# Phase F: Content Tool Migration

**Status**: ✅ Complete  
**Tools Migrated**: 6 (Presentation Maker, Resume Builder, Ebook Creator, Social Posts, Email Templates, Cover Letter Pro)  
**Integration**: Multi-AI Orchestrator, Cost Intelligence, Asset Vault

---

## Content Tools Overview

All 6 content tools are now unified under the Javari Content Universe at:
```
app/(communities)/(content)/{tool-name}/
```

Each tool integrates with:
- **Multi-AI Orchestrator**: 10 provider routing
- **Cost Intelligence**: Real-time tracking + forecasting
- **Asset Vault**: Templates, uploads, exports
- **Feature Flags**: Granular control
- **Workflow Engine**: Multi-step AI generation

---

## Migrated Tools

### 1. Presentation Maker
**Route**: `/app/(communities)/(content)/presentation-maker/`

**Workflows**:
- Outline Generation (Claude Haiku) - $0.10
- Content Generation (OpenAI GPT-4o-mini) - $0.50
- Image Suggestions (Perplexity) - $0.05
- Theme Application (Local) - $0

**Average Cost**: $0.30 per presentation  
**Cache Savings**: ~40%

---

### 2. Resume Builder
**Route**: `/app/(communities)/(content)/resume-builder/`

**Workflows**:
- Resume Analysis (Claude Haiku) - $0.15
- Section Enhancement (Claude Sonnet) - $0.30/section
- Keyword Optimization (OpenAI) - $0.10
- Cover Letter Generation (Claude Haiku) - $0.20

**Average Cost**: $0.50 per resume  
**Privacy**: No caching of personal data

---

### 3. Ebook Creator
**Route**: `/app/(communities)/(content)/ebook-creator/`

**Workflows**:
- Book Outline (Claude Haiku) - $0.25
- Chapter Writing (Claude Sonnet) - $2.00/chapter
- Research Integration (Gemini Pro) - $0.50
- Cover Design Prompt (Claude Haiku) - $0.05

**Average Cost**: $20 per 10-chapter ebook  
**Max Cost**: $40 with research

---

### 4. Social Posts Generator
**Route**: `/app/(communities)/(content)/social-posts/`

**Workflows**:
- Post Ideas (Groq Llama) - $0.05
- Multi-Platform Content (OpenAI) - $0.15
- Hashtag Research (Perplexity) - $0.10
- Image Prompts (Claude Haiku) - $0.02

**Average Cost**: $0.15 per campaign (10 posts)  
**Cache Savings**: ~50%

---

### 5. Email Templates
**Route**: `/app/(communities)/(content)/email-templates/`

**Workflows**:
- Subject Lines (OpenAI) - $0.05
- Email Body (Claude Haiku) - $0.20
- A/B Variants (Groq) - $0.10
- Personalization (Local) - $0

**Average Cost**: $0.20 per email  
**Cache Savings**: ~40%

---

### 6. Cover Letter Pro
**Route**: `/app/(communities)/(content)/cover-letter/`

**Workflows**:
- Company Research (Perplexity) - $0.30
- Role Analysis (Claude Haiku) - $0.10
- Letter Generation (Claude Sonnet) - $0.50
- Tone Adjustment (OpenAI) - $0.10

**Average Cost**: $0.60 per letter  
**Cache Savings**: ~30%

---

## Feature Flags

**Centralized Management**: `lib/featureFlags/contentTools.ts`

**Flag Structure** (per tool):
```typescript
{
  MASTER: 'CONTENT_{TOOL}_ENABLED',
  AI_ENABLED: 'CONTENT_{TOOL}_AI_ENABLED',
  EXPORT_ENABLED: 'CONTENT_{TOOL}_EXPORT_ENABLED',
  TEMPLATES_ENABLED: 'CONTENT_{TOOL}_TEMPLATES_ENABLED',
}
```

**Total Flags**: 24 (6 tools × 4 flags each)

**Environment Variables**:
```env
NEXT_PUBLIC_CONTENT_PRESENTATION_ENABLED=true
NEXT_PUBLIC_CONTENT_PRESENTATION_AI_ENABLED=true
NEXT_PUBLIC_CONTENT_PRESENTATION_EXPORT_ENABLED=true
NEXT_PUBLIC_CONTENT_PRESENTATION_TEMPLATES_ENABLED=true
# ... (repeat for all 6 tools)
```

---

## Workflow Integration

### Workflow Structure
```typescript
{
  name: 'generate-{tool}',
  version: 1,
  steps: [
    {
      id: 'step1',
      provider: 'anthropic', // or 'openai', 'gemini', etc.
      action: 'generate',
      input: { prompt: '...', maxTokens: 500 },
      onSuccess: 'step2',
      onFailure: 'fallback',
      cache: true,
      retry: { maxAttempts: 2 },
    },
    // ... more steps
  ],
  settings: {
    maxTotalCost: 1.0,
    timeout: 120000,
    enableCaching: true,
  },
}
```

### Provider Selection
- **Fast**: Groq (~400ms)
- **Cheap**: Gemini Flash ($0.075/$0.3)
- **Quality**: Claude Sonnet ($3/$15)
- **Research**: Perplexity Sonar ($1/$1)
- **Balanced**: OpenAI GPT-4o-mini ($0.15/$0.6)

---

## Asset Vault Mapping

### Input Assets
- `raw_content` - User notes, topics, briefs
- `templates` - PPTX, DOCX, HTML templates
- `uploads` - User files (resume, research)
- `images` - Logos, brand assets

### Output Assets
- `exports/{tool}/` - Generated files (PPTX, DOCX, PDF, EPUB, CSV)
- `generated-content/{tool}/` - JSON data from AI
- `images/{tool}/` - Generated images

### Storage Paths
```
/mnt/user-data/
  ├── templates/{tool}/
  ├── uploads/{tool}/
  ├── exports/{tool}/
  ├── generated-content/{tool}/
  └── images/{tool}/
```

---

## Cost Management

### Per-Tool Budgets
```typescript
const TOOL_COST_BUDGETS = {
  'presentation-maker': 0.65,
  'resume-builder': 1.20,
  'ebook-creator': 40.0,
  'social-posts': 0.35,
  'email-templates': 0.35,
  'cover-letter': 1.00,
};
```

### Monthly Projections
- **Low Usage** (100 ops/month): ~$50-100
- **Medium Usage** (500 ops/month): ~$250-500
- **High Usage** (2000 ops/month): ~$1000-2000

### Cost Optimization
1. **Enable Caching**: 30-50% savings
2. **Choose Cheaper Providers**: Use Gemini/DeepInfra
3. **Set Cost Limits**: Prevent overruns
4. **Monitor Trends**: Use `/api/admin/costs/forecast`

---

## Testing

### Test Coverage
- Workflow validation
- Workflow execution
- Cost tracking
- Provider fallback
- Asset vault integration
- Feature flag enforcement

### Run Tests
```bash
# Single tool
ts-node orchestrator/tests/tools/presentation-maker-tests.ts

# All tools
npm run test:content-tools
```

---

## Rollback Procedures

### Quick Disable (Any Tool)
```env
NEXT_PUBLIC_CONTENT_{TOOL}_ENABLED=false
```

### Disable AI Only
```env
NEXT_PUBLIC_CONTENT_{TOOL}_AI_ENABLED=false
```

### Full Rollback
See: `docs/migration/PHASE_F_ROLLBACK.md`

---

## Migration Summary

**Total Files Created**: 60+
- 6 tool directories
- 24 feature flags
- 24 workflows (4 per tool)
- 6 asset maps
- Test suites
- Documentation

**Integration Points**:
- Multi-AI Orchestrator (Phases A-D)
- Cost Intelligence (Phase E)
- Asset Vault (6 types)
- Feature Flags (24 flags)

**Provider Distribution**:
- Claude: 12 workflows
- OpenAI: 5 workflows
- Gemini: 2 workflows
- Groq: 2 workflows
- Perplexity: 3 workflows

---

**Phase F Complete!** 🎉

All 6 content tools migrated to unified Javari Content Universe with full orchestrator integration.

---

# Phase G: Community Engine

**Status**: ✅ Complete  
**Features**: Communities, Neighborhoods, Projects, Activity Feeds, RBAC, Content Integration

---

## Community Model

### Architecture
```
Communities (Top Level)
├── Members (with roles)
├── Neighborhoods (sub-spaces)
├── Projects
├── Activity Feed
└── Content Tools (integrated)
```

### Database Schema

**5 New Tables**:
1. **communities** - Top-level organization
2. **community_members** - Membership with roles
3. **neighborhoods** - Sub-spaces within communities
4. **projects** - Projects scoped to communities/neighborhoods
5. **activity_log** - Complete activity tracking

---

## Roles & Permissions

### Role Hierarchy
```
Owner > Admin > Member > Guest
```

### Permission Matrix

| Permission | Owner | Admin | Member | Guest |
|-----------|-------|-------|--------|-------|
| Create Content | ✅ | ✅ | ✅ | ❌ |
| Run Workflows | ✅ | ✅ | ✅ | ❌ |
| Invite Members | ✅ | ✅ | ❌ | ❌ |
| Manage Settings | ✅ | ✅ | ❌ | ❌ |
| Manage Projects | ✅ | ✅ | ✅ | ❌ |
| Manage Neighborhoods | ✅ | ✅ | ❌ | ❌ |
| View Activity | ✅ | ✅ | ✅ | ✅ |
| Export Content | ✅ | ✅ | ✅ | ❌ |
| Delete Content | ✅ | ✅ | ❌ | ❌ |
| Manage Roles | ✅ | ❌ | ❌ | ❌ |

### RBAC Implementation
**File**: `orchestrator/security/communityRoles.ts`

```typescript
import { canCreateContent, canManageSettings } from '@/orchestrator/security/communityRoles';

// Check permissions
if (!canCreateContent(userRole)) {
  throw new Error('Insufficient permissions');
}
```

---

## Activity Feed

### Tracked Events
- Workflow runs
- Content creation
- Content exports
- Member actions (join, leave, role change)
- Project creation/updates
- Neighborhood creation/updates

### Activity Tracking
**File**: `orchestrator/analytics/activity.ts`

```typescript
import { activityTracker } from '@/orchestrator/analytics/activity';

// Record workflow run
await activityTracker.recordWorkflowRun(
  communityId,
  userId,
  workflowId,
  workflowName,
  cost
);

// Get community activity
const activities = await activityTracker.getActivityForCommunity(communityId, 50);
```

---

## Community Content Tools

### Integration Architecture
All 6 content tools from Phase F are integrated with community context:

**Path Structure**:
```
/communities/{communityId}/content/{tool-name}/
```

**Example**:
```
/communities/abc-123/content/presentation-maker/
```

### Community-Scoped Workflows
Each workflow execution includes:
- `communityId` - Links to community
- `userId` - User who triggered
- Cost tracking per community
- Activity logging
- Community asset vault paths

### Content Tools Available
1. **Presentation Maker**
2. **Resume Builder**
3. **Ebook Creator**
4. **Social Posts Generator**
5. **Email Templates**
6. **Cover Letter Pro**

---

## Neighborhoods

### Purpose
Sub-spaces within communities for organization and content categorization.

### Features
- Scoped to parent community
- Can contain projects
- Optional content organization
- Separate activity tracking

### API
```typescript
// Create neighborhood
POST /api/communities/{id}/neighborhoods/create

// List neighborhoods
GET /api/communities/{id}/neighborhoods

// Update neighborhood
PUT /api/communities/{id}/neighborhoods/{nid}/update
```

---

## Projects

### Structure
```typescript
interface Project {
  id: string;
  communityId: string;
  neighborhoodId?: string; // Optional
  name: string;
  description: string;
  createdBy: string;
  status: 'active' | 'archived' | 'completed';
  metadata: Record<string, any>;
}
```

### API
```typescript
// Create project
POST /api/communities/{id}/projects/create

// List projects
GET /api/communities/{id}/projects

// Update project
PUT /api/communities/{id}/projects/{pid}/update
```

---

## Community Asset Vault

### Path Structure
```
/mnt/user-data/communities/{communityId}/{tool}/{assetType}/{year}/{month}/
```

**Example Paths**:
```
/mnt/user-data/communities/abc-123/presentation-maker/exports/2026/01/
/mnt/user-data/communities/abc-123/resume-builder/templates/
/mnt/user-data/communities/xyz-456/ebook-creator/uploads/
```

### Asset Resolver
**File**: `orchestrator/assets/communityResolver.ts`

```typescript
import { resolveCommunityAssetPath } from '@/orchestrator/assets/communityResolver';

const path = resolveCommunityAssetPath({
  communityId: 'abc-123',
  tool: 'presentation-maker',
  assetType: 'exports',
  year: 2026,
  month: 1,
});
// Returns: /mnt/user-data/communities/abc-123/presentation-maker/exports/2026/01
```

---

## API Routes

### Community Management
- `POST /api/communities/create` - Create community
- `PUT /api/communities/{id}/update` - Update community
- `GET /api/communities/{id}` - Get community details

### Member Management
- `POST /api/communities/{id}/members/add` - Add member
- `POST /api/communities/{id}/members/remove` - Remove member
- `PUT /api/communities/{id}/members/role` - Update member role

### Activity
- `GET /api/communities/{id}/activity` - Get activity feed

### Projects
- `GET /api/communities/{id}/projects` - List projects
- `POST /api/communities/{id}/projects/create` - Create project
- `PUT /api/communities/{id}/projects/{pid}/update` - Update project

---

## UI Routes

### Community Pages
```
/communities/{communityId}/ - Home
/communities/{communityId}/members - Member list
/communities/{communityId}/settings - Settings
/communities/{communityId}/activity - Activity feed
/communities/{communityId}/projects - Projects list
/communities/{communityId}/neighborhoods - Neighborhoods
```

### Content Tools (Community Context)
```
/communities/{communityId}/content/presentation-maker/
/communities/{communityId}/content/resume-builder/
/communities/{communityId}/content/ebook-creator/
/communities/{communityId}/content/social-posts/
/communities/{communityId}/content/email-templates/
/communities/{communityId}/content/cover-letter/
```

---

## Testing

### Test Coverage
- Role permission validation
- Asset path resolution
- Activity tracking
- Community creation
- Member management
- Project creation

### Run Tests
```bash
ts-node orchestrator/tests/phase-g-tests.ts
```

---

## Phase G Metrics

- **Database Tables**: 5
- **API Routes**: 10+
- **UI Pages**: 8+
- **Roles**: 4 (Owner, Admin, Member, Guest)
- **Permissions**: 10 per role
- **Integration Points**: 6 content tools

---

**Phase G Complete!** 🎉

The Community Engine brings together all previous phases into a unified, multi-user collaborative platform.

---

# Phase H: Monetization Layer

**Status**: ✅ Complete  
**Features**: Credits, Plans, Usage Enforcement, Billing Dashboard, Monthly Refill

---

## Credit System

### Overview
- **1 credit = $0.01 USD**
- Credits consumed based on AI usage
- Per-user and per-community balances
- Complete transaction ledger

### Database Tables (4)

1. **credit_balances** - Current balances
2. **credit_ledger** - Transaction history
3. **plans** - Subscription definitions
4. **usage_limits** - Rate limiting data

### Credit Engine
**File**: `orchestrator/credits/creditEngine.ts`

```typescript
import { creditEngine } from '@/orchestrator/credits/creditEngine';

// Get balance
const credits = await creditEngine.getUserCredits('user-123');

// Consume credits
await creditEngine.consumeCredits({
  userId: 'user-123',
  delta: 50,
  reason: 'workflow_execution',
  workflowId: 'wf-abc',
  costUSD: 0.50,
});

// Forecast burn
const forecast = await creditEngine.forecastCreditBurn('user-123', 30);
```

---

## Subscription Plans

### Free Plan
- **Credits**: 100/month
- **Price**: $0
- **Features**: 10 workflows, 1 community
- **Rollover**: No

### Pro Plan
- **Credits**: 1,000/month
- **Price**: $29.99
- **Features**: Unlimited workflows, 10 communities
- **Rollover**: Yes (500 max)

### Enterprise Plan
- **Credits**: 10,000/month
- **Price**: $299.99
- **Features**: Unlimited everything, SLA
- **Rollover**: Yes (5,000 max)

---

## Usage Enforcement

### Credit Guard Middleware
**File**: `orchestrator/middleware/creditGuard.ts`

**Before Workflow Execution**:
1. Convert estimated cost → credits
2. Check user balance
3. Block if insufficient
4. Allow if sufficient

**After Workflow Execution**:
1. Calculate actual cost
2. Convert to credits
3. Consume from balance
4. Log transaction

---

## Admin Billing Dashboard

### API Endpoints
- `GET /api/admin/billing/summary` - Overview stats
- `GET /api/admin/billing/users` - Per-user breakdown
- `GET /api/admin/billing/forecast` - Projections

### Metrics
- Total credits used
- Remaining credits
- Active users
- Top workflows
- Cost trends
- Anomaly alerts

---

## Monthly Refill

**File**: `orchestrator/credits/refillTask.ts`

**Schedule**: 1st of each month (Vercel Cron)

**Process**:
1. Get all active users
2. Check plan credits
3. Handle rollover (if enabled)
4. Add credits
5. Log transaction

---

## Feature Flags

```env
NEXT_PUBLIC_BILLING_ENABLED=true
NEXT_PUBLIC_CREDITS_ENABLED=true
NEXT_PUBLIC_USAGE_LIMITS_ENABLED=true
NEXT_PUBLIC_FREE_TIER_ENABLED=true
```

---

**Phase H Complete!** 🎉

Complete monetization infrastructure ready for production.
