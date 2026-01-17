# Javari Token Rotation Procedure

**Version:** 1.0.0  
**Date:** 2026-01-17  
**Classification:** OPERATIONAL PROCEDURE

---

## Overview

This document defines the procedure for rotating API tokens used by the Javari AI Autonomy Engine. Token rotation is a critical security practice that limits the impact of compromised credentials.

**Rotation Schedule:**
- GitHub Token: Every 90 days (recommended)
- Vercel Token: Every 90 days (when implemented)
- Supabase Token: Every 90 days (when implemented)
- Emergency Rotation: Immediately upon suspected compromise

---

## Token Inventory

### Currently Active Tokens

| Token Type | Location | Last Rotated | Next Rotation | Status |
|------------|----------|--------------|---------------|--------|
| GitHub PAT | Direct injection | 2026-01-17 | 2026-04-17 | ✅ Active |
| Vercel Token | Not accessible | N/A | N/A | ❌ Not configured |
| Supabase Key | Not accessible | N/A | N/A | ❌ Not configured |

### Token Permissions

**GitHub Personal Access Token (PAT):**
- Scope: repo (full repository access)
- Expiration: No expiration (classic token)
- Owner: roy-henderson
- Usage: Direct credential injection

---

## Rotation Procedure

### Phase 1: Pre-Rotation Preparation

**Step 1: Schedule Rotation Window**
- [ ] Identify low-traffic time period
- [ ] Notify team of planned rotation
- [ ] Ensure human operator available
- [ ] Prepare rollback plan

**Step 2: Backup Current Configuration**
- [ ] Document current token (last 4 chars only)
- [ ] Export current javari-autonomy.json
- [ ] Create backup of JAVARI-AUTONOMY-ENGINE.md
- [ ] Note current commit SHA

**Step 3: Validate System Health**
- [ ] Verify no operations in progress
- [ ] Check circuit breaker status (all closed)
- [ ] Confirm audit logs accessible
- [ ] Test current token still valid

---

### Phase 2: New Token Generation

**Step 1: Generate New Token in GitHub**

1. Navigate to GitHub → Settings → Developer settings → Personal access tokens
2. Click "Generate new token (classic)"
3. Configure token:
   - Name: `javari-ai-autonomy-engine-{YYYY-MM-DD}`
   - Expiration: 90 days
   - Scopes: `repo` (full control of private repositories)
4. Generate token
5. Copy token immediately (only shown once)
6. Store in secure location temporarily

**Step 2: Validate New Token**

```bash
# Test new token via API call
curl -H "Authorization: token <NEW_TOKEN>" \
     https://api.github.com/user

# Expected: 200 OK with user details
```

---

### Phase 3: Token Rotation Execution

**Step 1: Prepare Javari AI for Token Update**

Initiate conversation with Javari AI:

```
Roy: Javari, we are performing a token rotation. 
The new GitHub token is: <NEW_TOKEN>

Please:
1. Validate the new token
2. Confirm it has required permissions
3. Update your internal reference
4. Test a simple operation
5. Confirm successful rotation
```

**Step 2: Javari AI Validation Steps**

Javari AI will automatically:
1. Receive new token
2. Test via `GET /user` API call
3. Verify response is 200 OK
4. Verify user is `roy-henderson`
5. Update internal token reference
6. Perform test commit operation
7. Confirm all operations successful

**Step 3: Human Verification**

- [ ] Verify Javari AI confirmed token valid
- [ ] Check test commit succeeded
- [ ] Review audit logs for rotation event
- [ ] Confirm no errors in process

---

### Phase 4: Old Token Revocation

**Step 1: Wait Period**
- Wait 24 hours after successful rotation
- Monitor for any issues with new token
- Ensure all systems using new token

**Step 2: Revoke Old Token**
1. Navigate to GitHub → Settings → Developer settings → Personal access tokens
2. Locate old token
3. Click "Delete"
4. Confirm deletion
5. Document revocation in audit log

**Step 3: Verify Revocation**
```bash
# Attempt API call with old token
curl -H "Authorization: token <OLD_TOKEN>" \
     https://api.github.com/user

# Expected: 401 Unauthorized
```

---

### Phase 5: Post-Rotation Verification

**Step 1: System Health Check**
- [ ] Verify Javari AI operational
- [ ] Test all execution paths
- [ ] Review error rates (should be 0%)
- [ ] Check circuit breaker status
- [ ] Verify audit logging functioning

**Step 2: Update Documentation**
- [ ] Update token inventory table
- [ ] Record rotation in changelog
- [ ] Update next rotation date
- [ ] File rotation report

**Step 3: Schedule Next Rotation**
- [ ] Add to calendar (90 days from today)
- [ ] Set reminder (7 days before)
- [ ] Assign rotation owner

---

## Emergency Rotation Procedure

### When to Execute Emergency Rotation

**Immediate rotation required if:**
- Token suspected compromised
- Unauthorized API calls detected
- Token exposed in logs or public repository
- Security incident involving credentials
- Anomalous activity detected

### Emergency Rotation Steps

**Step 1: Immediate Actions (within 5 minutes)**
1. Halt all Javari AI operations
2. Revoke compromised token immediately
3. Generate new token
4. Provide new token to Javari AI
5. Resume operations

**Step 2: Incident Response (within 1 hour)**
1. Review audit logs for unauthorized activity
2. Identify scope of potential compromise
3. Check for unauthorized commits/changes
4. Document incident timeline
5. Notify security team

**Step 3: Post-Incident (within 24 hours)**
1. Complete incident report
2. Review and update security procedures
3. Conduct lessons learned session
4. Implement additional safeguards if needed

---

## Rollback Procedure

If new token fails validation or causes issues:

**Step 1: Halt Operations**
```
Roy: Javari, halt all operations. We are rolling back the token rotation.
```

**Step 2: Restore Old Token (if not yet revoked)**
```
Roy: Javari, revert to the previous token: <OLD_TOKEN>
Validate and confirm operations restored.
```

**Step 3: Investigate Issue**
- Check new token permissions
- Verify token not accidentally revoked
- Test new token manually
- Identify root cause

**Step 4: Retry Rotation**
- Generate new token (if issue with previous)
- Repeat rotation procedure
- Document rollback event

---

## Token Security Best Practices

### Do's
✅ Rotate tokens every 90 days  
✅ Use tokens with minimum required permissions  
✅ Store tokens securely (never in code repositories)  
✅ Validate new tokens before revoking old ones  
✅ Monitor for unauthorized token usage  
✅ Log all token rotation events  
✅ Set token expiration when possible  

### Don'ts
❌ Never commit tokens to Git  
❌ Never share tokens via unsecured channels  
❌ Never use tokens in client-side code  
❌ Never log tokens in plain text  
❌ Never revoke old token before validating new one  
❌ Never skip the validation step  
❌ Never reuse revoked tokens  

---

## Audit Trail

### Rotation Events Log

| Date | Event | Old Token (last 4) | New Token (last 4) | Operator | Status |
|------|-------|-------------------|-------------------|----------|--------|
| 2026-01-17 | Initial Setup | N/A | [REDACTED] | Roy | ✅ Success |
| | | | | | |

### Incident Log

| Date | Incident | Token Affected | Action Taken | Resolution |
|------|----------|----------------|--------------|------------|
| | | | | |

---

## Automation Opportunities (Future)

### Planned Enhancements
- [ ] Automated rotation reminders (7 days before due)
- [ ] Automated token validation script
- [ ] Automated health check post-rotation
- [ ] Integration with secrets manager (AWS Secrets Manager, Vault)
- [ ] Automated token expiration monitoring
- [ ] Self-service rotation via admin dashboard

---

## Troubleshooting

### Issue: New token validation fails

**Symptoms:** API returns 401 Unauthorized  
**Cause:** Token may be invalid or permissions insufficient  
**Resolution:**
1. Verify token copied correctly (no extra spaces)
2. Check token permissions include `repo` scope
3. Ensure token not expired
4. Generate new token if necessary

### Issue: Old token still working after revocation

**Symptoms:** API calls with old token succeed  
**Cause:** Revocation not yet propagated or wrong token revoked  
**Resolution:**
1. Verify correct token was revoked
2. Wait 5 minutes for propagation
3. Re-attempt revocation if needed
4. Contact GitHub support if issue persists

### Issue: Operations failing after rotation

**Symptoms:** Javari AI reports errors with new token  
**Cause:** Token permissions insufficient or network issue  
**Resolution:**
1. Verify token has `repo` scope
2. Test token manually via curl
3. Check network connectivity
4. Rollback to old token if critical
5. Generate new token with correct permissions

---

## Contact Information

**Rotation Owner:** Roy Henderson  
**Escalation Path:** roy-henderson → Security Team → CTO  
**Emergency Contact:** [To be configured]  
**Security Hotline:** [To be configured]  

---

## Appendix A: Token Validation Script

```bash
#!/bin/bash
# validate-github-token.sh

TOKEN=$1

if [ -z "$TOKEN" ]; then
    echo "Usage: ./validate-github-token.sh <TOKEN>"
    exit 1
fi

echo "Validating GitHub token..."

RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: token $TOKEN" \
    https://api.github.com/user)

if [ "$RESPONSE" = "200" ]; then
    echo "✅ Token is valid"
    
    USER=$(curl -s -H "Authorization: token $TOKEN" \
        https://api.github.com/user | jq -r '.login')
    
    echo "   Authenticated as: $USER"
    exit 0
else
    echo "❌ Token is invalid (HTTP $RESPONSE)"
    exit 1
fi
```

---

## Appendix B: Rotation Checklist (Quick Reference)

**Pre-Rotation:**
- [ ] Schedule rotation window
- [ ] Backup current config
- [ ] Validate system health

**Rotation:**
- [ ] Generate new token in GitHub
- [ ] Validate new token via API
- [ ] Provide new token to Javari AI
- [ ] Javari validates and updates
- [ ] Test operation with new token
- [ ] Confirm success

**Post-Rotation:**
- [ ] Wait 24 hours
- [ ] Revoke old token
- [ ] Verify revocation
- [ ] Update documentation
- [ ] Schedule next rotation (90 days)

---

**Document Owner:** Javari AI Autonomy Team  
**Last Reviewed:** 2026-01-17  
**Next Review:** 2026-04-17  
**Version:** 1.0.0
