export type Difficulty = 'Easy' | 'Medium' | 'Hard'
export type LinkType = 'Guest post' | 'Directory' | 'Forum' | 'PR'
export type Priority = 'Easy win' | 'High authority' | 'Quick approval'

export interface Opportunity {
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

export interface TrackerItem {
  status: string
  site: string
  note: string
}

export interface WebsiteAnalysis {
  provider: 'openai' | 'fallback'
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

export interface GeneratedReport {
  provider: 'openai' | 'fallback'
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
  trackerPreview: TrackerItem[]
  websiteAnalysis: WebsiteAnalysis
}

export interface FormState {
  url: string
  industry: string
  backlinkScope: string
  country: string
  goal: string
  contentType: string
  targetAudience: string
  daRange: number[]
}
