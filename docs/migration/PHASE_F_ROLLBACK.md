# Phase F: Rollback Strategy

**Emergency procedures for disabling content tools**

---

## Quick Rollback (Immediate)

### Step 1: Disable Feature Flags
```bash
# In Vercel dashboard or .env
NEXT_PUBLIC_CONTENT_PRESENTATION_ENABLED=false
NEXT_PUBLIC_CONTENT_RESUME_ENABLED=false
NEXT_PUBLIC_CONTENT_EBOOK_ENABLED=false
NEXT_PUBLIC_CONTENT_SOCIAL_ENABLED=false
NEXT_PUBLIC_CONTENT_EMAIL_ENABLED=false
NEXT_PUBLIC_CONTENT_COVER_LETTER_ENABLED=false
```

**Effect**: Tools hidden from UI, API calls rejected  
**Downtime**: None (flag check is instant)  
**Rollback Time**: <1 minute

---

## Partial Rollback (Specific Tool)

### Disable Single Tool
```bash
# Example: Disable Presentation Maker only
NEXT_PUBLIC_CONTENT_PRESENTATION_ENABLED=false
NEXT_PUBLIC_CONTENT_PRESENTATION_AI_ENABLED=false
```

**Effect**: Only specified tool disabled  
**Other Tools**: Continue operating normally

---

## Sub-Feature Rollback

### Disable AI Features Only
```bash
# Keep tool UI but disable AI generation
NEXT_PUBLIC_CONTENT_{TOOL}_AI_ENABLED=false
```

**Effect**: Manual editing still works, AI generation disabled

### Disable Exports Only
```bash
# Keep AI generation but disable exports
NEXT_PUBLIC_CONTENT_{TOOL}_EXPORT_ENABLED=false
```

**Effect**: Users can generate but not download

---

## Database Rollback

### Cost Ledger
```sql
-- Mark tool migrations as rolled back
UPDATE ai_cost_ledger
SET metadata = metadata || '{"rollback": true}'::jsonb
WHERE metadata->>'tool' IN ('presentation', 'resume', 'ebook', 'social', 'email', 'cover-letter');
```

### Workflow Runs
```sql
-- Cancel running workflows for specific tool
UPDATE ai_workflow_runs
SET status = 'cancelled'
WHERE workflow_name LIKE 'generate-presentation%'
AND status = 'running';
```

---

## Workflow Rollback

### Disable Specific Workflows
```typescript
// In orchestrator/workflows/content-tools/{tool}.workflow.ts
export const {toolWorkflow}: WorkflowDefinition = {
  // ... existing config
  settings: {
    enabled: false, // <-- Add this
    // ... rest of settings
  },
};
```

---

## Asset Vault Cleanup

### Remove Generated Assets
```bash
# Move to quarantine instead of delete
mv /mnt/user-data/outputs/exports/{tool}/ /mnt/user-data/quarantine/{tool}/
```

### Preserve User Uploads
```bash
# Never delete user uploads
# Keep in /mnt/user-data/uploads/{tool}/
```

---

## Monitoring During Rollback

### Check Cost Impact
```bash
curl https://your-domain/api/admin/costs/summary
```

### Check Active Workflows
```bash
curl https://your-domain/api/workflows/runs?status=running
```

### Check Circuit Breakers
```bash
curl https://your-domain/api/ai/telemetry | jq '.circuitBreakers'
```

---

## Rollback Decision Matrix

| Issue | Severity | Action | Rollback Type |
|-------|----------|--------|---------------|
| Cost spike >2x | Critical | Immediate | Full tool disable |
| Error rate >10% | High | Within 1hr | Disable AI features |
| Workflow timeout | Medium | Monitor | Adjust settings |
| User complaints | Low | Investigate | None (fix bug) |
| Circuit breaker open | High | Within 15min | Provider fallback |
| Data privacy leak | Critical | Immediate | Full tool disable + audit |

---

## Communication Plan

### Internal
1. Notify team via Slack
2. Update status page
3. Document incident
4. Schedule post-mortem

### External (if needed)
1. Display maintenance banner
2. Send email to affected users
3. Update social media
4. Provide ETA for resolution

---

## Recovery Procedures

### After Rollback
1. Identify root cause
2. Fix issue in development
3. Deploy fix to staging
4. Test thoroughly
5. Gradual re-enable (10% → 50% → 100%)
6. Monitor closely for 48 hours

---

**Rollback Authority**: Product Owner, Engineering Lead, or on-call engineer can initiate rollback.
