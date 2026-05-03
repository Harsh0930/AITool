import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Stack,
  Typography
} from '@mui/material'
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded'
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded'
import { Link as RouterLink } from 'react-router-dom'
import { faqItems, buildFaqSchema } from '../data/faqs'
import { SeoHead } from '../lib/seo'

const proofCards = [
  {
    title: 'Website-led AI analysis',
    body: 'The workflow starts with the URL, not a blank prompt, so the strategy is grounded in the site you actually want to grow.'
  },
  {
    title: 'Actionable backlink scoring',
    body: 'Every suggestion includes context, link type, authority range, keyword angle, and the next move instead of raw lists.'
  },
  {
    title: 'Execution-friendly output',
    body: 'The workspace moves directly into filtering, export, outreach drafting, and tracker-ready execution.'
  }
]

const processSteps = [
  'Analyze the website to extract positioning signals, likely keyword themes, and target audiences.',
  'Generate backlink opportunities tailored to your niche scope, SEO goal, authority range, and target country.',
  'Shortlist the best opportunities, export them, and move into outreach with AI guidance.'
]

export function HomePage() {
  return (
    <>
      <SeoHead
        title="BacklinkAI | AI Backlink Strategy and Outreach Workspace"
        description="Analyze your website, find relevant backlink opportunities, and move into outreach with an AI-guided SEO workflow."
        schema={buildFaqSchema()}
      />

      <Box component="main">
        <Container maxWidth="xl" className="main-container">
          <section className="home-hero">
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} lg={7}>
                <Chip icon={<AutoAwesomeRoundedIcon />} label="AI backlink workflow for marketers, agencies, and founders" className="hero-chip" />
                <Typography variant="h1" className="hero-title">
                  Find, prioritize, and pitch better backlinks without the usual SEO chaos
                </Typography>
                <Typography variant="h5" className="hero-subtitle">
                  BacklinkAI combines website analysis, keyword guidance, opportunity scoring, and outreach prep in one conversion-focused workspace.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} className="hero-actions">
                  <Button component={RouterLink} to="/workspace" variant="contained" size="large" className="hero-primary">
                    Generate backlink opportunities
                  </Button>
                  <Button component={RouterLink} to="/faq" variant="outlined" size="large" className="hero-secondary">
                    Explore FAQs
                  </Button>
                </Stack>
                <Box className="trust-strip">
                  <Chip label="AI website analysis" />
                  <Chip label="Backlink scoring" />
                  <Chip label="Outreach workflow" />
                  <Chip label="Export ready" />
                </Box>
              </Grid>

              <Grid item xs={12} lg={5}>
                <Box className="hero-visual-stage fade-rise">
                  <Card className="control-card landing-proof-card hero-glass-card">
                    <CardContent>
                      <Typography variant="overline" className="eyebrow">
                        Why teams convert here
                      </Typography>
                      <Typography variant="h4" className="landing-proof-title">
                        Strategy clarity beats backlink overload
                      </Typography>
                      <Typography variant="body1" color="text.secondary" mt={1.5}>
                        Instead of dumping directories and random prospects, the platform explains why each target matters and what to do next.
                      </Typography>
                      <Stack spacing={2} mt={3}>
                        <Box className="landing-proof-row">
                          <PsychologyRoundedIcon color="secondary" />
                          <Typography variant="body2">Suggests audiences and keywords from the submitted website.</Typography>
                        </Box>
                        <Box className="landing-proof-row">
                          <CampaignRoundedIcon color="secondary" />
                          <Typography variant="body2">Prepares outreach-friendly opportunity notes and content angles.</Typography>
                        </Box>
                        <Box className="landing-proof-row">
                          <TrackChangesRoundedIcon color="secondary" />
                          <Typography variant="body2">Keeps the workflow moving with export, filtering, and tracker-ready structure.</Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>
              </Grid>
            </Grid>
          </section>

          <section id="conversion-proof" className="feature-strip">
            {proofCards.map((item) => (
              <Card key={item.title} className="feature-card">
                <CardContent>
                  <Typography variant="h6">{item.title}</Typography>
                  <Typography color="text.secondary" mt={1}>
                    {item.body}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </section>

          <section id="seo-principles" className="section-block">
            <Box className="section-heading">
              <Box>
                <Typography variant="overline" className="eyebrow">
                  Process
                </Typography>
                <Typography variant="h3">A faster path from SEO intent to execution</Typography>
              </Box>
            </Box>
            <Grid container spacing={3}>
              {processSteps.map((item, index) => (
                <Grid item xs={12} md={4} key={item}>
                  <Card className="dashboard-card process-card">
                    <CardContent>
                      <Typography variant="h2" className="process-number">
                        0{index + 1}
                      </Typography>
                      <Typography variant="h6" mt={2}>
                        {item}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </section>

          <section className="faq-section">
            <Box className="section-heading">
              <Box>
                <Typography variant="overline" className="eyebrow">
                  FAQ preview
                </Typography>
                <Typography variant="h3">Answers for teams evaluating AI backlink tools</Typography>
              </Box>
            </Box>
            <Box className="faq-accordion-list">
              {faqItems.slice(0, 4).map((item, index) => (
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
            <Box className="cta-band">
              <Typography variant="h4">Ready to turn your website into a backlink plan?</Typography>
              <Typography variant="body1" color="text.secondary">
                Open the workspace, analyze the site, and produce a tailored opportunity set in a single flow.
              </Typography>
              <Button component={RouterLink} to="/workspace" variant="contained" size="large" className="hero-primary">
                Open the workspace
              </Button>
            </Box>
          </section>
        </Container>
      </Box>
    </>
  )
}
