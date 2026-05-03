import { Box, Button, Container, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { SeoHead } from '../lib/seo'

export function NotFoundPage() {
  return (
    <>
      <SeoHead
        title="Page Not Found | BacklinkAI"
        description="The page you requested could not be found. Return to the BacklinkAI homepage or workspace."
      />
      <Box component="main">
        <Container maxWidth="md" className="not-found-shell">
          <Typography variant="overline" className="eyebrow">
            404
          </Typography>
          <Typography variant="h1" className="page-title">
            This page is not available
          </Typography>
          <Typography variant="h6" className="page-subtitle">
            Head back to the homepage or jump into the workspace to generate backlink opportunities.
          </Typography>
          <Box className="hero-actions">
            <Button component={RouterLink} to="/" variant="outlined">
              Go home
            </Button>
            <Button component={RouterLink} to="/workspace" variant="contained" className="hero-primary">
              Open workspace
            </Button>
          </Box>
        </Container>
      </Box>
    </>
  )
}
