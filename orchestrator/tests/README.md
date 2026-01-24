# Orchestrator Test Harness

Comprehensive test suite for validating the CRAudioVizAI Orchestrator system end-to-end.

---

## Test Files

### 1. `test_orchestrator_payload.json`
**Purpose:** Tests task creation via `/api/orchestrator` endpoint

**What it tests:**
- JSON payload validation
- Task insertion into `ai_tasks` table
- Event logging to `ai_events` table
- Agent assignment logic

**Usage:**
```bash
curl -X POST http://localhost:3000/api/orchestrator \
  -H "Content-Type: application/json" \
  -d @tests/test_orchestrator_payload.json
```

**Expected Result:**
```json
{
  "success": true,
  "task_id": "uuid-here",
  "assigned_agent": "claude",
  "status": "pending"
}
```

**Verify in Supabase:**
```sql
SELECT * FROM ai_tasks ORDER BY created_at DESC LIMIT 1;
SELECT * FROM ai_events WHERE event_type = 'task_created' ORDER BY timestamp DESC LIMIT 1;
```

---

### 2. `test_claude_relay.json`
**Purpose:** Tests Claude task processing via `processClaudeTask` Edge Function

**What it tests:**
- Reading pending tasks from database
- Calling Claude API (Anthropic)
- Committing results to GitHub
- Updating task status to completed
- Logging commit events

**Usage:**
```bash
# First create a task
curl -X POST http://localhost:3000/api/orchestrator \
  -H "Content-Type: application/json" \
  -d @tests/test_orchestrator_payload.json

# Then trigger processing
curl -X POST https://your-project.supabase.co/functions/v1/processClaudeTask \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

**Expected Result:**
```json
{
  "success": true,
  "taskId": "uuid-here",
  "commit_sha": "abc123...",
  "github_url": "https://github.com/..."
}
```

**Verify in Supabase:**
```sql
SELECT id, status, completed_at, result->'github_url' 
FROM ai_tasks WHERE id = 'task_id_here';

SELECT * FROM ai_events 
WHERE event_type = 'commit' AND task_id = 'task_id_here';
```

---

### 3. `test_github_commit.json`
**Purpose:** Tests GitHub webhook event processing via `/api/github-webhook`

**What it tests:**
- GitHub push event parsing
- Main event logging (github_push)
- Individual commit event logging
- File change tracking
- Documentation detection

**Usage:**
```bash
curl -X POST http://localhost:3000/api/github-webhook \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: push" \
  -d @tests/test_github_commit.json
```

**Expected Result:**
```json
{
  "success": true,
  "event": "push",
  "processed": true,
  "commits_logged": 2
}
```

**Verify in Supabase:**
```sql
SELECT * FROM ai_events WHERE event_type = 'github_push' 
ORDER BY timestamp DESC LIMIT 1;

SELECT event_type, event_data->>'commit_id', event_data->>'commit_message' 
FROM ai_events WHERE event_type = 'commit' 
ORDER BY timestamp DESC LIMIT 5;
```

---

## Automated Test Runner

### `run_tests.sh`
Automated script that runs all tests in sequence and validates results.

**Prerequisites:**
- `curl` installed
- `jq` installed (for JSON parsing)
- Vercel development server running (or production URL)
- Supabase project configured

**Install jq:**
```bash
# macOS
brew install jq

# Ubuntu/Debian
sudo apt-get install jq

# Windows (WSL)
sudo apt-get install jq
```

**Basic Usage:**
```bash
# Local development
cd orchestrator
./tests/run_tests.sh

# Production testing
VERCEL_URL=https://your-app.vercel.app \
SUPABASE_URL=https://your-project.supabase.co \
SUPABASE_ANON_KEY=your-anon-key \
./tests/run_tests.sh
```

**Advanced Usage:**
```bash
# Test specific endpoint
./tests/run_tests.sh --help

# Custom URLs
./tests/run_tests.sh \
  --vercel-url https://staging.vercel.app \
  --supabase-url https://staging.supabase.co \
  --anon-key your-key
```

**What it tests:**
1. ✅ Orchestrator API task creation
2. ✅ GitHub webhook event processing
3. ✅ Claude task execution (if Supabase configured)
4. ✅ Knowledge base updates (if Supabase configured)

---

## Manual Testing Workflow

### Full End-to-End Test

**Step 1: Create a Task**
```bash
curl -X POST http://localhost:3000/api/orchestrator \
  -H "Content-Type: application/json" \
  -d '{
    "taskType": "documentation",
    "priority": "high",
    "payload": {
      "description": "Create a test document",
      "context": {
        "repository": "CR-AudioViz-AI/crav-docs",
        "filePath": "docs/test.md",
        "branch": "main"
      }
    }
  }'
```

**Step 2: Note the task_id from response**
```json
{
  "success": true,
  "task_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "assigned_agent": "claude",
  "status": "pending"
}
```

**Step 3: Verify task in database**
```sql
SELECT * FROM ai_tasks WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
```

**Step 4: Process the task**
```bash
curl -X POST https://your-project.supabase.co/functions/v1/processClaudeTask \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

**Step 5: Verify completion**
```sql
SELECT status, completed_at, result->'github_url' 
FROM ai_tasks 
WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
```

**Step 6: Check GitHub**
- Navigate to repository: `CR-AudioViz-AI/crav-docs`
- Check file: `docs/test.md`
- Verify commit message includes task_id

---

## Test Variations

### Testing Different Task Types

**Code Generation:**
```json
{
  "taskType": "code_generation",
  "priority": "high",
  "payload": {
    "description": "Generate TypeScript types for user model"
  }
}
```

**Analysis:**
```json
{
  "taskType": "analysis",
  "priority": "medium",
  "payload": {
    "description": "Analyze user engagement patterns"
  }
}
```

### Testing Different Priorities

**Critical:**
```json
{
  "taskType": "documentation",
  "priority": "critical",
  "payload": { ... }
}
```

**Low:**
```json
{
  "taskType": "documentation",
  "priority": "low",
  "payload": { ... }
}
```

### Testing Validation Errors

**Missing description:**
```json
{
  "taskType": "documentation",
  "priority": "high",
  "payload": {}
}
```
Expected: 400 error

**Invalid taskType:**
```json
{
  "taskType": "invalid_type",
  "priority": "high",
  "payload": { "description": "test" }
}
```
Expected: 400 error

---

## Troubleshooting

### "No pending tasks found"
**Cause:** processClaudeTask has no tasks to process  
**Solution:** Create a task first using test_orchestrator_payload.json

### "Claude API error: 401"
**Cause:** Invalid or missing ANTHROPIC_API_KEY  
**Solution:** Set key in Supabase Edge Function secrets

### "GitHub commit failed: 404"
**Cause:** Repository doesn't exist or token lacks access  
**Solution:** Verify repository name and GitHub token permissions

### "Connection refused"
**Cause:** Vercel development server not running  
**Solution:** Start server with `npm run dev`

### "jq: command not found"
**Cause:** jq not installed  
**Solution:** Install jq (see Prerequisites above)

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Test Orchestrator

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Install dependencies
        run: |
          sudo apt-get update
          sudo apt-get install -y jq curl
      
      - name: Run orchestrator tests
        env:
          VERCEL_URL: ${{ secrets.VERCEL_URL }}
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
        run: |
          cd orchestrator
          ./tests/run_tests.sh
```

---

## Additional Resources

- [Orchestrator README](../README.md) - Full deployment guide
- [Implementation Summary](../IMPLEMENTATION_SUMMARY.md) - Technical details
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)

---

**Last Updated:** January 23, 2026  
**Test Suite Version:** 1.0
