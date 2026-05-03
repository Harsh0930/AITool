import { Box, Button, Container, Stack, TextField, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

export function SiteFooter() {
  return (
    <Box component="footer" className="site-footer">
      <Container maxWidth="xl" className="footer-shell">
        <Box className="footer-feature">
          <Typography variant="overline" className="eyebrow">
            BacklinkAI
          </Typography>
          <Typography variant="h4" className="footer-title">
            Turn backlink research into an execution-ready growth system.
          </Typography>
          <Typography variant="body1" color="text.secondary" className="footer-copy">
            Analyze your site, shortlist opportunities, build outreach drafts, and move from SEO theory to practical action in one workspace.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} className="footer-cta-row">
            <Button component={RouterLink} to="/workspace" variant="contained" className="footer-primary-button">
              Launch Workspace
            </Button>
            <Button component={RouterLink} to="/faq" variant="outlined">
              Read FAQs
            </Button>
          </Stack>
        </Box>

        <Box className="footer-grid">
          <Box>
            <Typography variant="subtitle1" className="footer-heading">
              Product
            </Typography>
            <Box className="footer-links">
              <RouterLink to="/workspace">Opportunity finder</RouterLink>
              <RouterLink to="/workspace">Outreach generator</RouterLink>
              <RouterLink to="/workspace">Execution tracker</RouterLink>
            </Box>
          </Box>
          <Box>
            <Typography variant="subtitle1" className="footer-heading">
              Company
            </Typography>
            <Box className="footer-links">
              <RouterLink to="/">Home</RouterLink>
              <RouterLink to="/faq">FAQ</RouterLink>
              <a href="mailto:team@backlinkai.local">Contact</a>
            </Box>
          </Box>
          <Box>
            <Typography variant="subtitle1" className="footer-heading">
              Resources
            </Typography>
            <Box className="footer-links">
              <a href="#seo-principles">SEO principles</a>
              <a href="#conversion-proof">Conversion proof</a>
              <RouterLink to="/faq">AI workflow guide</RouterLink>
            </Box>
          </Box>
          <Box>
            <Typography variant="subtitle1" className="footer-heading">
              Newsletter
            </Typography>
            <Typography variant="body2" color="text.secondary" className="footer-copy footer-copy-tight">
              Get AI SEO workflow updates and launch notes.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} mt={1.5}>
              <TextField size="small" placeholder="Email address" className="footer-input" />
              <Button variant="contained" className="footer-secondary-button">
                Join
              </Button>
            </Stack>
          </Box>
        </Box>

        <Box className="footer-meta">
          <Typography variant="body2" color="text.secondary">
            Copyright 2026 BacklinkAI. Built for backlink strategy, outreach, and execution clarity.
          </Typography>
          <Box className="footer-mini-links">
            <a href="/">Privacy</a>
            <a href="/">Terms</a>
            <RouterLink to="/faq">FAQ Schema</RouterLink>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}
