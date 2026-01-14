# Phase F: Acceptance Criteria

**All 6 content tools must meet these criteria before production deployment.**

---

## Global Criteria (All Tools)

### ✅ Integration Requirements
- [ ] Multi-AI Orchestrator workflows defined
- [ ] Feature flags implemented (master + 3 sub-flags)
- [ ] Asset Vault mappings complete
- [ ] Cost tracking active (Phase E integration)
- [ ] Caching enabled with appropriate TTL
- [ ] Circuit breakers configured
- [ ] Rate limiting applied

### ✅ Workflow Validation
- [ ] All workflow steps execute successfully
- [ ] Provider fallback logic works
- [ ] Retry logic handles failures
- [ ] Cost limits respected (<$1.00 per operation)
- [ ] Timeout handling (no infinite loops)
- [ ] Sandbox limits enforced

### ✅ UI/UX Requirements
- [ ] Loading states for all AI operations
- [ ] Error handling with user-friendly messages
- [ ] Cost display before generation
- [ ] Progress indicators for multi-step workflows
- [ ] Preview mode before export
- [ ] Mobile-responsive design

### ✅ Performance Expectations
- [ ] Initial load: <3 seconds
- [ ] Workflow execution: <2 minutes
- [ ] Export generation: <30 seconds
- [ ] Cache hit latency: <100ms
- [ ] No memory leaks

---

## Tool-Specific Criteria

### 1. Presentation Maker
**Accuracy**:
- [ ] Outline matches topic and audience
- [ ] Slide count is correct
- [ ] Content is relevant and professional
- [ ] Image suggestions are appropriate

**Outputs**:
- [ ] PPTX file renders correctly in PowerPoint
- [ ] PDF export matches PPTX layout
- [ ] JSON contains all slide data

**Cost**:
- [ ] Average: $0.30 per presentation
- [ ] Max: $0.65 with retries

---

### 2. Resume Builder
**Accuracy**:
- [ ] Resume analysis identifies all sections
- [ ] Enhancement maintains original voice
- [ ] ATS optimization improves keyword score
- [ ] Formatting is clean and professional

**Outputs**:
- [ ] DOCX file renders in Word
- [ ] PDF is ATS-friendly
- [ ] Plain text version is readable

**Privacy**:
- [ ] No caching of personal data
- [ ] PII redaction in logs
- [ ] Secure file storage

**Cost**:
- [ ] Average: $0.50 per resume
- [ ] Max: $1.20 for full enhancement

---

### 3. Ebook Creator
**Accuracy**:
- [ ] Outline is comprehensive and logical
- [ ] Chapters maintain consistent style
- [ ] Research is factual and cited
- [ ] Word count targets are met (2000-5000 per chapter)

**Outputs**:
- [ ] EPUB renders on Kindle
- [ ] PDF is properly formatted
- [ ] MOBI compatible with older devices
- [ ] Markdown is properly structured

**Cost**:
- [ ] Average: $20 per 10-chapter ebook
- [ ] Max: $40 with full research

---

### 4. Social Posts Generator
**Accuracy**:
- [ ] Post ideas are creative and on-brand
- [ ] Platform-specific formatting is correct
- [ ] Hashtags are relevant and trending
- [ ] Character limits respected

**Outputs**:
- [ ] CSV contains all platforms
- [ ] JSON is properly structured
- [ ] Images match post themes

**Cost**:
- [ ] Average: $0.15 per campaign (10 posts)
- [ ] Max: $0.35 with images

---

### 5. Email Templates
**Accuracy**:
- [ ] Subject lines are compelling
- [ ] Body content matches purpose
- [ ] CTAs are clear and actionable
- [ ] A/B variants are meaningfully different

**Outputs**:
- [ ] HTML renders in email clients
- [ ] Plain text fallback is readable
- [ ] Personalization tokens work

**Cost**:
- [ ] Average: $0.20 per email
- [ ] Max: $0.35 with A/B testing

---

### 6. Cover Letter Pro
**Accuracy**:
- [ ] Company research is current and accurate
- [ ] Role analysis identifies key requirements
- [ ] Letter is tailored to company and role
- [ ] Tone matches company culture

**Outputs**:
- [ ] DOCX renders in Word
- [ ] PDF is professional quality
- [ ] Research data is saved in JSON

**Cost**:
- [ ] Average: $0.60 per letter
- [ ] Max: $1.00 with full research

---

## Rollback Conditions

### Automatic Rollback Triggers
- Cost exceeds 2x expected average
- Error rate >10% over 1 hour
- Workflow timeout rate >5%
- User complaints >3 in 24 hours
- Circuit breaker opens for primary provider

### Manual Rollback Triggers
- Critical bug discovered
- Data privacy concern
- Legal/compliance issue
- Performance degradation affecting other tools

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing (unit + integration)
- [ ] Code review complete
- [ ] Documentation updated
- [ ] Feature flags configured (default: disabled)
- [ ] Cost budgets set
- [ ] Monitoring dashboards created

### Deployment
- [ ] Deploy to staging
- [ ] Run smoke tests
- [ ] Enable feature flags for internal testing
- [ ] Monitor for 24 hours
- [ ] Gradual rollout (10% → 50% → 100%)

### Post-Deployment
- [ ] Monitor cost trends
- [ ] Monitor error rates
- [ ] Collect user feedback
- [ ] Track conversion metrics
- [ ] Optimize based on data

---

**Acceptance**: All criteria must be met before tool is considered production-ready.
