# Phase F: Content Tool Migration Matrix

**Migration Date**: 2026-01-13  
**Target Branch**: `orchestrator-phase-a`  
**Orchestrator Integration**: Multi-AI with cost intelligence

---

## Migration Overview

Consolidating 6 external content tools into unified Javari Content Universe under:
```
app/(communities)/(content)/{tool-name}/
```

Each tool integrates with:
- Multi-AI Orchestrator (10 providers)
- Cost Intelligence (Phase E)
- Asset Vault (6 asset types)
- Feature Flags (granular control)
- Workflow Engine (multi-step AI)

---

## Tool 1: Presentation Maker

### Source Information
- **Original Repo**: External presentation tool
- **Architecture**: Slide-based content generator
- **Core Features**: Templates, themes, AI content, image integration

### Target Integration
- **Route**: `/app/(communities)/(content)/presentation-maker/`
- **Primary Workflow**: `generate-presentation.workflow.ts`
- **Orchestrator Providers**: OpenAI (structure), DALL-E (images), Claude (content)

### Required Workflows
1. **Outline Generation** (Provider: Claude Haiku)
   - Input: Topic, audience, slide count
   - Output: Structured outline with slide titles
   - Cost limit: $0.10
   - Cache: 24hr

2. **Content Generation** (Provider: OpenAI GPT-4o-mini)
   - Input: Outline + slide specs
   - Output: Slide content (title, bullets, notes)
   - Cost limit: $0.50
   - Fallback: Gemini Flash

3. **Image Suggestions** (Provider: Perplexity)
   - Input: Slide content
   - Output: Image search terms
   - Cost limit: $0.05
   - Cache: 7 days

4. **Theme Application** (Local processing)
   - Input: Content + theme selection
   - Output: Styled presentation
   - No AI cost

### Asset Vault Mapping
**Input Assets**:
- `raw_content` - User topic/notes
- `templates` - Presentation templates (PPTX)
- `images` - Logo, brand images

**Output Assets**:
- `exports` - PPTX file
- `exports` - PDF file
- `generated_content` - Slide text (JSON)

### User Flow
1. User selects template → Asset Vault (`templates`)
2. User provides topic → Workflow: Outline Generation
3. AI generates outline → Preview
4. User approves → Workflow: Content Generation
5. AI generates slides → Preview with images
6. User customizes → Local edits
7. User exports → Asset Vault (`exports/presentations/`)

### Cost Expectations
- Average: $0.30 per presentation
- Max: $0.65 with retries
- Cache savings: ~40% on similar topics

---

## Tool 2: Resume Builder

### Source Information
- **Original Repo**: External resume builder
- **Architecture**: Section-based resume generator
- **Core Features**: Templates, ATS optimization, AI enhancement

### Target Integration
- **Route**: `/app/(communities)/(content)/resume-builder/`
- **Primary Workflow**: `enhance-resume.workflow.ts`
- **Orchestrator Providers**: Claude (writing), OpenAI (formatting)

### Required Workflows
1. **Resume Analysis** (Provider: Claude Haiku)
   - Input: Raw resume text/upload
   - Output: Structured sections + improvement suggestions
   - Cost limit: $0.15
   - Cache: Never (personal data)

2. **Section Enhancement** (Provider: Claude Sonnet)
   - Input: Section text + job description
   - Output: Enhanced, ATS-optimized text
   - Cost limit: $0.30 per section
   - Fallback: OpenAI GPT-4o

3. **Keyword Optimization** (Provider: OpenAI GPT-4o-mini)
   - Input: Resume + target job description
   - Output: Keyword analysis + suggestions
   - Cost limit: $0.10
   - Cache: 1hr (same job description)

4. **Cover Letter Generation** (Provider: Claude Haiku)
   - Input: Resume + job description + company
   - Output: Tailored cover letter
   - Cost limit: $0.20
   - Cache: Never

### Asset Vault Mapping
**Input Assets**:
- `raw_content` - User resume text
- `uploads` - PDF/DOCX resume uploads
- `templates` - Resume templates (DOCX)

**Output Assets**:
- `exports` - DOCX resume
- `exports` - PDF resume
- `exports` - Plain text (ATS-friendly)
- `generated_content` - Enhanced sections (JSON)

### User Flow
1. User uploads resume → Asset Vault (`uploads`)
2. AI analyzes → Workflow: Resume Analysis
3. User selects sections to enhance → Workflow: Section Enhancement
4. AI enhances each section → Preview
5. User edits → Local changes
6. User selects template → Asset Vault (`templates`)
7. User exports → Asset Vault (`exports/resumes/`)

### Cost Expectations
- Average: $0.50 per resume
- Max: $1.20 for full enhancement
- Cache savings: Minimal (personal content)

---

## Tool 3: Ebook Creator

### Source Information
- **Original Repo**: External ebook authoring tool
- **Architecture**: Chapter-based book generator
- **Core Features**: Outlines, chapters, formatting, cover design

### Target Integration
- **Route**: `/app/(communities)/(content)/ebook-creator/`
- **Primary Workflow**: `generate-ebook.workflow.ts`
- **Orchestrator Providers**: Claude (writing), Gemini (research), DALL-E (covers)

### Required Workflows
1. **Book Outline Generation** (Provider: Claude Haiku)
   - Input: Topic, target audience, chapter count
   - Output: Detailed chapter-by-chapter outline
   - Cost limit: $0.25
   - Cache: 24hr

2. **Chapter Writing** (Provider: Claude Sonnet)
   - Input: Chapter outline + context
   - Output: Full chapter content (2000-5000 words)
   - Cost limit: $2.00 per chapter
   - Fallback: OpenAI GPT-4o

3. **Research Integration** (Provider: Gemini Pro)
   - Input: Topic + chapter context
   - Output: Factual research + citations
   - Cost limit: $0.50
   - Cache: 7 days

4. **Cover Design Prompt** (Provider: Claude Haiku)
   - Input: Book title, genre, audience
   - Output: DALL-E prompt for cover
   - Cost limit: $0.05
   - Cache: Never

### Asset Vault Mapping
**Input Assets**:
- `raw_content` - User notes, research
- `templates` - Ebook templates (EPUB/MOBI)
- `uploads` - Reference materials

**Output Assets**:
- `exports` - EPUB file
- `exports` - PDF file
- `exports` - MOBI file
- `generated_content` - Chapters (Markdown)
- `images` - Cover image

### User Flow
1. User provides topic → Workflow: Book Outline
2. AI generates outline → User reviews/edits
3. User triggers chapter generation → Workflow: Chapter Writing (per chapter)
4. AI writes chapters → User edits each chapter
5. User requests research → Workflow: Research Integration
6. User finalizes → Formatting + export
7. User exports → Asset Vault (`exports/ebooks/`)

### Cost Expectations
- Average: $15-25 per ebook (10 chapters)
- Max: $40 with full research + retries
- Cache savings: ~30% on similar topics

---

## Tool 4: Social Posts Generator

### Source Information
- **Original Repo**: External social media tool
- **Architecture**: Multi-platform post creator
- **Core Features**: Templates, hashtags, image suggestions, scheduling

### Target Integration
- **Route**: `/app/(communities)/(content)/social-posts/`
- **Primary Workflow**: `generate-social-posts.workflow.ts`
- **Orchestrator Providers**: OpenAI (content), Claude (tone), Groq (speed)

### Required Workflows
1. **Post Idea Generation** (Provider: Groq Llama)
   - Input: Topic, platform, audience
   - Output: 10 post ideas with hooks
   - Cost limit: $0.05
   - Cache: 6hr

2. **Multi-Platform Content** (Provider: OpenAI GPT-4o-mini)
   - Input: Core message + platforms (Twitter, LinkedIn, Instagram)
   - Output: Platform-optimized versions
   - Cost limit: $0.15
   - Cache: 1hr

3. **Hashtag Research** (Provider: Perplexity Sonar)
   - Input: Topic, platform
   - Output: Trending hashtags + analytics
   - Cost limit: $0.10
   - Cache: 24hr

4. **Image Prompt Generation** (Provider: Claude Haiku)
   - Input: Post content
   - Output: DALL-E prompt for image
   - Cost limit: $0.02
   - Cache: Never

### Asset Vault Mapping
**Input Assets**:
- `raw_content` - Campaign brief, brand voice
- `templates` - Post templates per platform
- `images` - Brand images, logos

**Output Assets**:
- `exports` - CSV with all posts
- `generated_content` - Individual posts (JSON)
- `images` - Generated social images

### User Flow
1. User provides topic → Workflow: Post Idea Generation
2. AI generates ideas → User selects favorites
3. User triggers multi-platform → Workflow: Multi-Platform Content
4. AI creates platform versions → User edits
5. User requests hashtags → Workflow: Hashtag Research
6. User exports → Asset Vault (`exports/social-posts/`)

### Cost Expectations
- Average: $0.15 per campaign (10 posts)
- Max: $0.35 with image generation
- Cache savings: ~50% on brand campaigns

---

## Tool 5: Email Templates

### Source Information
- **Original Repo**: External email marketing tool
- **Architecture**: Template-based email generator
- **Core Features**: Subject lines, body content, CTAs, A/B testing

### Target Integration
- **Route**: `/app/(communities)/(content)/email-templates/`
- **Primary Workflow**: `generate-email.workflow.ts`
- **Orchestrator Providers**: Claude (writing), OpenAI (subject lines)

### Required Workflows
1. **Subject Line Generation** (Provider: OpenAI GPT-4o-mini)
   - Input: Email purpose, audience, tone
   - Output: 10 subject line variations
   - Cost limit: $0.05
   - Cache: 1hr

2. **Email Body Writing** (Provider: Claude Haiku)
   - Input: Purpose, key points, CTA
   - Output: Full email HTML + plain text
   - Cost limit: $0.20
   - Fallback: Gemini Flash

3. **A/B Test Variants** (Provider: Groq Llama)
   - Input: Original email
   - Output: 3 variations for testing
   - Cost limit: $0.10
   - Cache: Never

4. **Personalization Tokens** (Local processing)
   - Input: Email template
   - Output: Token-inserted version
   - No AI cost

### Asset Vault Mapping
**Input Assets**:
- `templates` - Email templates (HTML)
- `raw_content` - Campaign briefs
- `uploads` - Contact lists (CSV)

**Output Assets**:
- `exports` - HTML email files
- `exports` - Plain text versions
- `generated_content` - Subject lines (JSON)

### User Flow
1. User selects template → Asset Vault (`templates`)
2. User provides brief → Workflow: Subject Line Generation
3. AI generates subjects → User selects
4. User triggers body → Workflow: Email Body Writing
5. AI generates email → User previews
6. User requests A/B variants → Workflow: A/B Test Variants
7. User exports → Asset Vault (`exports/emails/`)

### Cost Expectations
- Average: $0.20 per email
- Max: $0.35 with A/B testing
- Cache savings: ~40% on similar campaigns

---

## Tool 6: Cover Letter Pro

### Source Information
- **Original Repo**: External cover letter tool
- **Architecture**: Job-specific letter generator
- **Core Features**: Company research, role analysis, tone matching

### Target Integration
- **Route**: `/app/(communities)/(content)/cover-letter/`
- **Primary Workflow**: `generate-cover-letter.workflow.ts`
- **Orchestrator Providers**: Claude (writing), Perplexity (research)

### Required Workflows
1. **Company Research** (Provider: Perplexity Sonar)
   - Input: Company name, job posting URL
   - Output: Company info, culture, recent news
   - Cost limit: $0.30
   - Cache: 7 days

2. **Role Analysis** (Provider: Claude Haiku)
   - Input: Job description
   - Output: Key requirements, desired skills
   - Cost limit: $0.10
   - Cache: 24hr

3. **Letter Generation** (Provider: Claude Sonnet)
   - Input: Resume summary + company research + role analysis
   - Output: Tailored cover letter
   - Cost limit: $0.50
   - Fallback: OpenAI GPT-4o

4. **Tone Adjustment** (Provider: OpenAI GPT-4o-mini)
   - Input: Letter + desired tone (formal/casual)
   - Output: Tone-adjusted version
   - Cost limit: $0.10
   - Cache: Never

### Asset Vault Mapping
**Input Assets**:
- `raw_content` - Resume summary
- `uploads` - Resume file
- `templates` - Cover letter templates (DOCX)

**Output Assets**:
- `exports` - DOCX cover letter
- `exports` - PDF cover letter
- `generated_content` - Research data (JSON)

### User Flow
1. User provides job URL → Workflow: Company Research
2. AI researches company → Display insights
3. User provides job description → Workflow: Role Analysis
4. AI analyzes role → Display requirements
5. User triggers generation → Workflow: Letter Generation
6. AI writes letter → User previews
7. User adjusts tone → Workflow: Tone Adjustment
8. User exports → Asset Vault (`exports/cover-letters/`)

### Cost Expectations
- Average: $0.60 per cover letter
- Max: $1.00 with full research + retries
- Cache savings: ~30% on company research

---

## Migration Summary

### Total Workflows: 24
- Presentation Maker: 4 workflows
- Resume Builder: 4 workflows
- Ebook Creator: 4 workflows
- Social Posts: 4 workflows
- Email Templates: 4 workflows
- Cover Letter Pro: 4 workflows

### Provider Distribution
- **Claude Haiku** (9 workflows) - Fast, cost-effective
- **Claude Sonnet** (3 workflows) - Quality writing
- **OpenAI GPT-4o-mini** (5 workflows) - Balanced
- **Gemini Flash/Pro** (2 workflows) - Research
- **Groq Llama** (2 workflows) - Speed
- **Perplexity Sonar** (3 workflows) - Web research

### Cost Projections
- **Low**: $0.15 per operation (social posts, emails)
- **Medium**: $0.50 per operation (resumes, cover letters)
- **High**: $2.00 per chapter (ebooks)
- **Monthly Budget**: $500-1000 for moderate usage

### Asset Vault Usage
- **Templates**: 30+ across all tools
- **Exports**: 6 categories (presentations, resumes, ebooks, social, emails, letters)
- **Generated Content**: JSON storage for all AI outputs
- **Uploads**: User-provided files

### Feature Flags
- 6 master flags (CONTENT_{TOOL}_ENABLED)
- 18 sub-flags (AI, Export, Templates per tool)
- Granular control for rollout/rollback

---

**Migration Matrix Complete**  
**Ready for Phase F Implementation**
