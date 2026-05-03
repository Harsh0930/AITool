export interface FaqItem {
  question: string
  answer: string
}

export const faqItems: FaqItem[] = [
  {
    question: 'How does BacklinkAI choose backlink opportunities?',
    answer:
      'It combines your website brief, target country, niche scope, SEO goal, and website analysis to prioritize outreach targets that look realistic for your current strategy.'
  },
  {
    question: 'Are the contact details and authority metrics verified live?',
    answer:
      'Not by default. The app generates planning guidance and suggests likely outreach routes, but you should verify contacts, authority metrics, and editorial policies before sending emails.'
  },
  {
    question: 'Can the tool analyze my website before creating a backlink plan?',
    answer:
      'Yes. The website analysis flow extracts page signals, suggests likely keywords, and recommends target audiences so the backlink plan is anchored in your actual site positioning.'
  },
  {
    question: 'What is the difference between easy wins, quick approvals, and high authority?',
    answer:
      'Easy wins are lower-friction placements, quick approvals are targets that often accept practical pitches faster, and high authority opportunities are stronger SEO plays that usually require more editorial quality.'
  },
  {
    question: 'Why does anchor strategy matter in AI backlink planning?',
    answer:
      'A healthy backlink profile needs variation. The tool recommends branded, generic, and contextual anchors so users avoid over-optimizing around exact-match phrases.'
  },
  {
    question: 'Can I export the results and use them in outreach workflows?',
    answer:
      'Yes. You can export shortlisted opportunities to CSV today, and the UI is prepared for deeper workflow handoff like Sheets sync and tracker-based execution.'
  },
  {
    question: 'What happens if no OpenAI API key is configured?',
    answer:
      'The app still works with a local fallback planner so you can test the workflow end to end, but the results will use deterministic heuristics instead of live model reasoning.'
  },
  {
    question: 'Is this a replacement for professional SEO APIs?',
    answer:
      'No. It is best understood as an AI strategy layer and workflow assistant. For production-grade metrics, you would still pair it with SEO data providers or custom crawling.'
  }
]

export function buildFaqSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  }
}
