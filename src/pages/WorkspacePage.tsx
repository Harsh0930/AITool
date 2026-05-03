import { Container } from '@mui/material'
import { WorkspaceExperience } from '../components/WorkspaceExperience'
import { SeoHead } from '../lib/seo'

interface WorkspacePageProps {
  darkMode: boolean
  onToggleDarkMode: () => void
}

export function WorkspacePage({ darkMode, onToggleDarkMode }: WorkspacePageProps) {
  return (
    <>
      <SeoHead
        title="BacklinkAI Workspace | Generate Backlink Opportunities"
        description="Analyze your website, fetch keyword and audience suggestions, and generate AI-guided backlink opportunities in the BacklinkAI workspace."
      />
      <Container maxWidth="xl" className="main-container">
        <WorkspaceExperience darkMode={darkMode} onToggleDarkMode={onToggleDarkMode} />
      </Container>
    </>
  )
}
