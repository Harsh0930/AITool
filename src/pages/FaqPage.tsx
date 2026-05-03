import { Accordion, AccordionDetails, AccordionSummary, Box, Container, Typography } from '@mui/material'
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import { buildFaqSchema, faqItems } from '../data/faqs'
import { SeoHead } from '../lib/seo'

export function FaqPage() {
  return (
    <>
      <SeoHead
        title="BacklinkAI FAQ | AI Backlink Tool Questions"
        description="Common questions about how BacklinkAI analyzes websites, suggests backlink opportunities, and supports outreach workflows."
        schema={buildFaqSchema()}
      />
      <Box component="main">
        <Container maxWidth="xl" className="main-container">
          <section className="faq-page-hero ai-hero-card">
            <Box className="faq-hero-grid">
              <Box>
                <Typography variant="overline" className="eyebrow">
                  FAQ
                </Typography>
                <Typography variant="h1" className="page-title">
                  Frequently asked questions about AI backlink planning
                </Typography>
                <Typography variant="h5" className="page-subtitle">
                  Clear answers for marketers, agencies, and founders evaluating how this workflow fits into real SEO execution.
                </Typography>
              </Box>
              <Box className="faq-orbit-panel">
                <Box className="faq-orbit-card">
                  <AutoAwesomeRoundedIcon color="secondary" />
                  <Typography variant="h6">FAQ Schema included</Typography>
                  <Typography variant="body2" color="text.secondary">
                    The page ships with structured FAQ data for answer-engine visibility.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </section>

          <Box className="faq-accordion-list">
            {faqItems.map((item, index) => (
              <Accordion key={item.question} defaultExpanded={index === 0} className="faq-accordion">
                <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                  <Typography variant="h6">{item.question}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body1" color="text.secondary">
                    {item.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Container>
      </Box>
    </>
  )
}
