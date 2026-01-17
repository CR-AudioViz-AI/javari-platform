# GITHUB-FULL-ACCESS-MAP.md
**Version:** 1.0.0 | **Date:** 2026-01-17

## Current Access
- ✅ Read repository contents
- ✅ Create/update files via API
- ✅ Create commits
- ✅ Push to branches
- ❌ Merge pull requests (can create PRs)
- ❌ Override branch protection
- ❌ Manage webhooks
- ❌ Access Actions secrets

## Repository Graph
```
javari-platform/
├── docs/ (FULL ACCESS)
├── config/ (FULL ACCESS)
├── src/ (CONDITIONAL - tests required)
├── .github/workflows/ (READ ONLY - manual edit)
└── package.json (CONDITIONAL - version validation)
```

## File Classification
- **Canonical Docs:** Full autonomous access
- **Config Files:** Autonomous with validation
- **Source Code:** Autonomous with tests
- **Workflows:** Human approval required
- **Secrets:** No access (GitHub UI only)

## Autonomous Capabilities
- Create/update canonical documents
- Add/modify configuration
- Refactor code (with tests)
- Generate documentation
- Create pull requests
- Tag releases

## Restricted Capabilities
- Merge to protected branches
- Override branch protection
- Modify workflows without review
- Access secrets
- Delete branches/tags
