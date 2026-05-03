import type { IncomingMessage, ServerResponse } from 'node:http'
import process from 'node:process'

type Difficulty = 'Easy' | 'Medium' | 'Hard'
type LinkType = 'Guest post' | 'Directory' | 'Forum' | 'PR'
type Priority = 'Easy win' | 'High authority' | 'Quick approval'

interface Opportunity {
  id: number
  site: string
  da: number
  traffic: number
  relevance: number
  difficulty: Difficulty
  country: string
  linkType: LinkType
  contact: string
  submission: string
  priority: Priority
  reason: string
  contentIdea: string
  keywords: string[]
  anchors: string[]
  risks: string[]
  nextStep: string
}

interface GenerateBacklinksPayload {
  url: string
  industry: string
  backlinkScope: string
  country: string
  goal: string
  contentType: string
  targetAudience: string
  daRange: number[]
}

interface WebsiteAnalysis {
  provider: 'openai' | 'fallback' | 'anthropic'
  sourceUrl: string
  title: string
  description: string
  summary: string
  industryHint: string
  contentTypeHint: string
  keywords: string[]
  targetAudiences: string[]
  notes: string[]
}

interface GeneratedReport {
  provider: 'openai' | 'fallback' | 'anthropic'
  model: string
  generatedAt: string
  validationNote: string
  overview: {
    headline: string
    summary: string
    averageRelevance: number
    firstPriority: string
  }
  aiSuggestions: string[]
  nextSteps: string[]
  opportunities: Opportunity[]
  trackerPreview: Array<{
    status: string
    site: string
    note: string
  }>
  websiteAnalysis: WebsiteAnalysis
}

interface WebsiteSnapshot {
  sourceUrl: string
  title: string
  description: string
  headings: string[]
  text: string
}

const websiteAnalysisSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['summary', 'industryHint', 'contentTypeHint', 'keywords', 'targetAudiences', 'notes'],
  properties: {
    summary: { type: 'string' },
    industryHint: { type: 'string' },
    contentTypeHint: { type: 'string' },
    keywords: {
      type: 'array',
      minItems: 4,
      maxItems: 6,
      items: { type: 'string' }
    },
    targetAudiences: {
      type: 'array',
      minItems: 3,
      maxItems: 5,
      items: { type: 'string' }
    },
    notes: {
      type: 'array',
      minItems: 2,
      maxItems: 4,
      items: { type: 'string' }
    }
  }
} as const

const reportCoreSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['validationNote', 'overview', 'aiSuggestions', 'nextSteps', 'opportunities', 'trackerPreview'],
  properties: {
    validationNote: { type: 'string' },
    overview: {
      type: 'object',
      additionalProperties: false,
      required: ['headline', 'summary', 'averageRelevance', 'firstPriority'],
      properties: {
        headline: { type: 'string' },
        summary: { type: 'string' },
        averageRelevance: { type: 'number' },
        firstPriority: { type: 'string' }
      }
    },
    aiSuggestions: {
      type: 'array',
      minItems: 3,
      maxItems: 4,
      items: { type: 'string' }
    },
    nextSteps: {
      type: 'array',
      minItems: 3,
      maxItems: 4,
      items: { type: 'string' }
    },
    opportunities: {
      type: 'array',
      minItems: 5,
      maxItems: 6,
      items: {
        type: 'object',
        additionalProperties: false,
        required: [
          'id',
          'site',
          'da',
          'traffic',
          'relevance',
          'difficulty',
          'country',
          'linkType',
          'contact',
          'submission',
          'priority',
          'reason',
          'contentIdea',
          'keywords',
          'anchors',
          'risks',
          'nextStep'
        ],
        properties: {
          id: { type: 'number' },
          site: { type: 'string' },
          da: { type: 'number' },
          traffic: { type: 'number' },
          relevance: { type: 'number' },
          difficulty: { type: 'string', enum: ['Easy', 'Medium', 'Hard'] },
          country: { type: 'string' },
          linkType: { type: 'string', enum: ['Guest post', 'Directory', 'Forum', 'PR'] },
          contact: { type: 'string' },
          submission: { type: 'string' },
          priority: { type: 'string', enum: ['Easy win', 'High authority', 'Quick approval'] },
          reason: { type: 'string' },
          contentIdea: { type: 'string' },
          keywords: {
            type: 'array',
            minItems: 3,
            maxItems: 3,
            items: { type: 'string' }
          },
          anchors: {
            type: 'array',
            minItems: 3,
            maxItems: 3,
            items: { type: 'string' }
          },
          risks: {
            type: 'array',
            minItems: 2,
            maxItems: 3,
            items: { type: 'string' }
          },
          nextStep: { type: 'string' }
        }
      }
    },
    trackerPreview: {
      type: 'array',
      minItems: 3,
      maxItems: 3,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['status', 'site', 'note'],
        properties: {
          status: { type: 'string' },
          site: { type: 'string' },
          note: { type: 'string' }
        }
      }
    }
  }
} as const

const baseSeeds = [
  {
    site: 'GrowthStack Journal',
    linkType: 'Guest post' as const,
    difficulty: 'Medium' as const,
    priority: 'High authority' as const,
    country: 'Global',
    daBase: 76,
    trafficBase: 42000
  },
  {
    site: 'LocalRank Spotlight',
    linkType: 'Directory' as const,
    difficulty: 'Easy' as const,
    priority: 'Easy win' as const,
    country: 'India',
    daBase: 48,
    trafficBase: 11800
  },
  {
    site: 'Founder Pipeline Weekly',
    linkType: 'PR' as const,
    difficulty: 'Easy' as const,
    priority: 'Quick approval' as const,
    country: 'United States',
    daBase: 60,
    trafficBase: 19600
  },
  {
    site: 'MarTech Bridge',
    linkType: 'Guest post' as const,
    difficulty: 'Medium' as const,
    priority: 'High authority' as const,
    country: 'United Kingdom',
    daBase: 68,
    trafficBase: 25500
  },
  {
    site: 'Operator Forum',
    linkType: 'Forum' as const,
    difficulty: 'Easy' as const,
    priority: 'Quick approval' as const,
    country: 'Canada',
    daBase: 44,
    trafficBase: 8700
  },
  {
    site: 'Commerce Authority Review',
    linkType: 'PR' as const,
    difficulty: 'Hard' as const,
    priority: 'High authority' as const,
    country: 'Global',
    daBase: 74,
    trafficBase: 33800
  }
]

const stopWords = new Set([
  'about',
  'after',
  'also',
  'among',
  'another',
  'because',
  'being',
  'between',
  'build',
  'could',
  'first',
  'from',
  'have',
  'into',
  'more',
  'most',
  'only',
  'other',
  'over',
  'such',
  'that',
  'their',
  'there',
  'these',
  'this',
  'through',
  'using',
  'with',
  'your'
])


function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function normaliseUrl(url: string) {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

function ensureAbsoluteUrl(url: string) {
  if (/^https?:\/\//i.test(url)) {
    return url
  }

  return `https://${url}`
}

function toSlug(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function sendJson(res: ServerResponse, statusCode: number, payload: unknown) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

async function readJsonBody<T>(req: IncomingMessage) {
  const chunks: Uint8Array[] = []

  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }

  const raw = Buffer.concat(chunks).toString('utf8')
  return raw ? (JSON.parse(raw) as T) : ({} as T)
}

function isValidPayload(payload: Partial<GenerateBacklinksPayload>): payload is GenerateBacklinksPayload {
  return Boolean(
    payload &&
      typeof payload.url === 'string' &&
      typeof payload.industry === 'string' &&
      typeof payload.backlinkScope === 'string' &&
      typeof payload.country === 'string' &&
      typeof payload.goal === 'string' &&
      typeof payload.contentType === 'string' &&
      typeof payload.targetAudience === 'string' &&
      Array.isArray(payload.daRange) &&
      payload.daRange.length === 2
  )
}

function extractMatch(html: string, pattern: RegExp) {
  const match = html.match(pattern)
  return match?.[1]?.trim() ?? ''
}

function sanitizeText(input: string) {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function extractKeywords(text: string, fallbackDomain: string) {
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 3 && !stopWords.has(token))

  const frequency = new Map<string, number>()

  for (const token of tokens) {
    frequency.set(token, (frequency.get(token) ?? 0) + 1)
  }

  const sorted = [...frequency.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 6)
    .map(([token]) => token)

  if (sorted.length >= 4) {
    return sorted
  }

  const domainParts = fallbackDomain
    .replace(/\.[a-z.]+$/i, '')
    .split(/[-.]/)
    .filter((part) => part.length > 2)

  return [...new Set([...sorted, ...domainParts, 'backlink strategy', 'seo workflow'])].slice(0, 6)
}

function guessAudiences(industryHint: string, keywords: string[]) {
  const lowerIndustry = industryHint.toLowerCase()
  const baseAudiences = ['SEO managers', 'Content marketers', 'Growth teams']

  if (lowerIndustry.includes('saas') || keywords.some((keyword) => keyword.includes('software'))) {
    return ['SaaS founders', 'Growth marketers', 'Demand generation teams', 'RevOps leaders']
  }

  if (lowerIndustry.includes('local') || keywords.some((keyword) => keyword.includes('local'))) {
    return ['Local business owners', 'Regional marketing teams', 'Franchise operators', 'Service-area businesses']
  }

  if (lowerIndustry.includes('agency')) {
    return ['Agency owners', 'SEO strategists', 'Account managers', 'Client delivery teams']
  }

  return baseAudiences
}

async function fetchWebsiteSnapshot(url: string): Promise<WebsiteSnapshot> {
  const absoluteUrl = ensureAbsoluteUrl(url)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)

  try {
    const response = await fetch(absoluteUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'BacklinkAI/1.0'
      }
    })

    const html = await response.text()
    const title = extractMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i)
    const description = extractMatch(html, /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
    const headings = [...html.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi)]
      .map((match) => sanitizeText(match[1]))
      .filter(Boolean)
      .slice(0, 8)
    const text = sanitizeText(html).slice(0, 5000)

    return {
      sourceUrl: absoluteUrl,
      title,
      description,
      headings,
      text
    }
  } catch {
    const domain = normaliseUrl(absoluteUrl)
    return {
      sourceUrl: absoluteUrl,
      title: domain,
      description: '',
      headings: [domain],
      text: domain.replace(/[.-]/g, ' ')
    }
  } finally {
    clearTimeout(timeout)
  }
}

function buildFallbackAnalysis(snapshot: WebsiteSnapshot, reason?: string): WebsiteAnalysis {
  const sourceText = `${snapshot.title} ${snapshot.description} ${snapshot.headings.join(' ')} ${snapshot.text}`
  const keywords = extractKeywords(sourceText, normaliseUrl(snapshot.sourceUrl))
  const firstKeyword = keywords[0] ?? 'digital growth'
  const industryHint = snapshot.title || firstKeyword
  const targetAudiences = guessAudiences(industryHint, keywords)

  return {
    provider: 'fallback',
    sourceUrl: snapshot.sourceUrl,
    title: snapshot.title || normaliseUrl(snapshot.sourceUrl),
    description: snapshot.description || `AI-derived summary for ${normaliseUrl(snapshot.sourceUrl)}`,
    summary: `The website appears centered on ${firstKeyword} themes, so backlink outreach should speak to audiences who care about visibility, authority, and practical growth outcomes.`,
    industryHint,
    contentTypeHint: snapshot.text.includes('blog') ? 'Blog' : 'SaaS',
    keywords: keywords.slice(0, 6),
    targetAudiences,
    notes: [
      'Keyword and audience suggestions were derived from available page text and URL signals.',
      'Validate the site positioning manually if the homepage is thin or hard to crawl.',
      ...(reason ? [`Fallback reason: ${reason}`] : [])
    ]
  }
}

// Deprecated OpenAI client placeholder. Not used in Anthropic implementation.
function getOpenAIClient(): never {
  throw new Error('OpenAI client is not available. Use Anthropic API.')
}

async function analyzeWebsite(url: string): Promise<WebsiteAnalysis> {
  const snapshot = await fetchWebsiteSnapshot(url)

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return buildFallbackAnalysis(snapshot);
  }

  const prompt = `You are an SEO analyst. Provide a concise JSON analysis of the website for backlink strategy.

Source URL: ${snapshot.sourceUrl}
Title: ${snapshot.title}
Meta description: ${snapshot.description}
Headings: ${snapshot.headings.join(' | ')}
Extracted text: ${snapshot.text}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Anthropic error:', data);
      return buildFallbackAnalysis(snapshot, 'Anthropic API error');
    }
    let raw: string;
    try {
      raw = data.content[0].text;
    } catch {
      return buildFallbackAnalysis(snapshot, 'Unexpected Anthropic response format');
    }
    const parsed = JSON.parse(raw) as Omit<WebsiteAnalysis, 'provider' | 'sourceUrl' | 'title' | 'description'>;
    return {
      provider: 'anthropic',
      sourceUrl: snapshot.sourceUrl,
      title: snapshot.title || normaliseUrl(snapshot.sourceUrl),
      description: snapshot.description || `Website analysis for ${normaliseUrl(snapshot.sourceUrl)}`,
      summary: parsed.summary,
      industryHint: parsed.industryHint,
      contentTypeHint: parsed.contentTypeHint,
      keywords: parsed.keywords,
      targetAudiences: parsed.targetAudiences,
      notes: parsed.notes
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Live website analysis was unavailable.';
    return buildFallbackAnalysis(snapshot, message);
  }
}

function buildFallbackReport(payload: GenerateBacklinksPayload, analysis: WebsiteAnalysis, reason?: string): GeneratedReport {
  const primaryKeyword = analysis.keywords[0] ?? `${payload.industry.toLowerCase()} backlinks`
  const secondaryKeyword = analysis.keywords[1] ?? `${payload.goal.toLowerCase()} seo`
  const opportunities: Opportunity[] = baseSeeds.map((seed, index) => {
    const chosenCountry =
      payload.country === 'Global'
        ? seed.country
        : seed.country === 'Global' || index === 1
          ? payload.country
          : seed.country
    const domainSuffix = payload.country === 'India' ? 'in' : payload.country === 'United Kingdom' ? 'co.uk' : 'com'
    const domain = `${toSlug(seed.site)}.${domainSuffix}`
    const da = clamp(seed.daBase + (payload.goal === 'Authority building' ? 4 : 0) - (index % 2 === 0 ? 0 : 3), payload.daRange[0], Math.max(payload.daRange[1], payload.daRange[0] + 4))
    const relevanceBase = analysis.provider === 'openai' ? 84 : 80
    const relevance = clamp(
      relevanceBase +
        (payload.backlinkScope === 'Same niche' ? 7 : payload.backlinkScope === 'Related niche' ? 4 : 1) +
        (chosenCountry === payload.country || chosenCountry === 'Global' ? 4 : 0) -
        index,
      76,
      96
    )

    return {
      id: index + 1,
      site: seed.site,
      da,
      traffic: seed.trafficBase + index * 1200 + (chosenCountry === payload.country ? 1500 : 0),
      relevance,
      difficulty: seed.difficulty,
      country: chosenCountry,
      linkType: seed.linkType,
      contact: `${seed.linkType === 'Directory' ? 'submissions' : 'editorial'}@${domain}`,
      submission: `${domain}/${seed.linkType === 'Directory' ? 'submit-business' : seed.linkType === 'Forum' ? 'community' : 'contribute'}`,
      priority: seed.priority,
      reason: `This target fits ${payload.industry.toLowerCase()} growth because it aligns with ${analysis.targetAudiences[0]?.toLowerCase() ?? payload.targetAudience.toLowerCase()} and supports ${payload.backlinkScope.toLowerCase()} link building.`,
      contentIdea: `Create a ${payload.contentType.toLowerCase()} asset around ${primaryKeyword} and ${secondaryKeyword}, then pitch it with a ${payload.country.toLowerCase()} angle.`,
      keywords: [primaryKeyword, secondaryKeyword, analysis.keywords[2] ?? `${payload.goal.toLowerCase()} workflow`],
      anchors: ['Branded anchor', 'Natural supporting phrase', `${payload.industry} guide`],
      risks: [
        'Validate authority metrics and contact routes before sending outreach.',
        'Keep anchor diversity high and avoid exact-match repetition.',
        'Lead with a specific content angle instead of a generic promotional pitch.'
      ],
      nextStep: `Prepare a concise pitch for ${seed.site} and connect it to one concrete asset on ${normaliseUrl(payload.url)}.`
    }
  })

  const averageRelevance = Math.round(opportunities.reduce((sum, item) => sum + item.relevance, 0) / opportunities.length)

  return {
    provider: 'fallback',
    model: 'local-planner',
    generatedAt: new Date().toISOString(),
    validationNote: reason
      ? `This report uses local fallback logic because live OpenAI generation was unavailable: ${reason}`
      : 'This report uses local fallback logic or partial crawl signals. Validate site metrics, contact details, and editorial fit before outreach.',
    overview: {
      headline: `${payload.industry} backlink plan for ${normaliseUrl(payload.url)}`,
      summary: `This shortlist balances ${payload.goal.toLowerCase()}, ${payload.backlinkScope.toLowerCase()} targets, and ${payload.country.toLowerCase()} relevance while staying aligned to the analyzed website themes.`,
      averageRelevance,
      firstPriority: opportunities[0].priority
    },
    aiSuggestions: [
      `Lead with ${analysis.keywords[0] ?? 'your primary theme'} so the outreach stays tied to the website analysis.`,
      `Use content framed for ${analysis.targetAudiences.slice(0, 2).join(' and ').toLowerCase()}.`,
      'Treat generated contacts and traffic estimates as planning guidance until you verify them.'
    ],
    nextSteps: [
      'Start with 2 easier wins and 1 authority play so the first outreach batch has mixed difficulty.',
      'Map one content angle to each selected opportunity before drafting outreach.',
      'Export the shortlist and track first outreach, follow-up, and approval status.'
    ],
    opportunities,
    trackerPreview: [
      { status: 'Applied', site: opportunities[0].site, note: 'Draft outreach after selecting the first target asset.' },
      { status: 'Approved', site: opportunities[1].site, note: 'Use quick approvals to build early momentum.' },
      { status: 'Follow-up due', site: opportunities[3].site, note: 'Editorial targets usually need a stronger second touch.' }
    ],
    websiteAnalysis: analysis
  }
}

async function generateWithAnthropic(payload: GenerateBacklinksPayload, analysis: WebsiteAnalysis): Promise<GeneratedReport> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('Missing ANTHROPIC_API_KEY');
  }
  const model = 'claude-3-5-sonnet-20241022';
  const prompt = `You are an SEO strategist building a backlink planning report. Return concise, realistic strategy guidance in JSON only. Do not claim that contacts or metrics were verified live. Generate plausible planning data, not factual guarantees.

Build a backlink opportunity report for this website.
Website URL: ${payload.url}
Industry: ${payload.industry}
Backlink Scope: ${payload.backlinkScope}
Country: ${payload.country}
Goal: ${payload.goal}
Content Type: ${payload.contentType}
Target Audience: ${payload.targetAudience}
DA Range: ${payload.daRange[0]}-${payload.daRange[1]}

Website analysis summary: ${analysis.summary}
Keywords: ${analysis.keywords.join(', ')}
Target Audiences: ${analysis.targetAudiences.join(', ')}
Notes: ${analysis.notes.join(' | ')}

Generate exactly 6 opportunities with fields matching the reportCoreSchema (provider, model, generatedAt, validationNote, overview, aiSuggestions, nextSteps, opportunities, trackerPreview, websiteAnalysis).`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('Anthropic error:', data);
    throw new Error('Anthropic generation failed');
  }
  let raw: string;
  try {
    raw = data.content[0].text;
  } catch {
    throw new Error('Unexpected Anthropic response format');
  }
  const core = JSON.parse(raw) as Omit<GeneratedReport, 'provider' | 'model' | 'generatedAt' | 'websiteAnalysis'>;
  return {
    provider: 'anthropic',
    model,
    generatedAt: new Date().toISOString(),
    validationNote: core.validationNote,
    overview: core.overview,
    aiSuggestions: core.aiSuggestions,
    nextSteps: core.nextSteps,
    opportunities: core.opportunities,
    trackerPreview: core.trackerPreview,
    websiteAnalysis: analysis
  };
}

export async function handleBacklinkApi(req: IncomingMessage, res: ServerResponse) {
  const requestUrl = req.url ?? ''

  if (requestUrl === '/api/health') {
    sendJson(res, 200, {
      ok: true,
      anthropicConfigured: Boolean(process.env.ANTHROPIC_API_KEY),
      model: process.env.OPENAI_MODEL || 'gpt-5.5'
    })
    return
  }

  if (requestUrl === '/api/analyze-website') {
    if (req.method !== 'POST') {
      sendJson(res, 405, { error: 'Method not allowed.' })
      return
    }

    try {
      const payload = await readJsonBody<{ url?: string }>(req)
      if (!payload.url) {
        sendJson(res, 400, { error: 'Website URL is required.' })
        return
      }

      const analysis = await analyzeWebsite(payload.url)
      sendJson(res, 200, { analysis })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected server error.'
      sendJson(res, 500, { error: message })
    }
    return
  }

  if (requestUrl !== '/api/generate-backlinks') {
    sendJson(res, 404, { error: 'Not found.' })
    return
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed.' })
    return
  }

  try {
    const payload = await readJsonBody<GenerateBacklinksPayload>(req)

    if (!isValidPayload(payload)) {
      sendJson(res, 400, { error: 'Invalid request payload.' })
      return
    }

    const analysis = await analyzeWebsite(payload.url)

    if (!process.env.ANTHROPIC_API_KEY) {
      sendJson(res, 200, buildFallbackReport(payload, analysis))
      return
    }

    try {
      const report = await generateWithAnthropic(payload, analysis)
      sendJson(res, 200, report)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Live Anthropic generation was unavailable.'
      sendJson(res, 200, buildFallbackReport(payload, analysis, message))
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error.'
    sendJson(res, 500, { error: message })
  }
}
