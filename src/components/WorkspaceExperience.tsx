import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  Divider,
  FormControlLabel,
  Grid,
  InputAdornment,
  MenuItem,
  Slider,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography
} from '@mui/material'
import type { AlertColor } from '@mui/material'
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import ClearAllRoundedIcon from '@mui/icons-material/ClearAllRounded'
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import type {
  Difficulty,
  FormState,
  GeneratedReport,
  Priority,
  WebsiteAnalysis
} from '../types/backlink'
import { countryOptions } from '../data/countries'

const industryOptions = ['SaaS', 'E-commerce', 'Local Business', 'Agency', 'Marketing Blog', 'B2B Services']
const backlinkScopes = ['Same niche', 'Related niche', 'Broader authority mix']
const contentTypes = ['Blog', 'SaaS', 'eCommerce', 'Local business', 'Marketplace']
const seoGoals = ['Traffic growth', 'Authority building', 'Lead generation']
const tones = ['Professional', 'Friendly', 'Direct']

const defaultForm: FormState = {
  url: '',
  industry: 'SaaS',
  backlinkScope: 'Related niche',
  country: 'India',
  goal: 'Authority building',
  contentType: 'SaaS',
  targetAudience: '',
  daRange: [40, 80]
}

function formatTraffic(value: number) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`
  }

  return `${value}`
}

function normaliseUrl(url: string) {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

function getPriorityColor(priority: Priority) {
  if (priority === 'Easy win') {
    return 'success'
  }

  return 'secondary'
}

function getDifficultyColor(difficulty: Difficulty) {
  if (difficulty === 'Easy') {
    return 'success'
  }

  if (difficulty === 'Medium') {
    return 'warning'
  }

  return 'error'
}

interface AnalyzeResponse {
  analysis: WebsiteAnalysis
}

interface WorkspaceExperienceProps {
  darkMode: boolean
  onToggleDarkMode: () => void
}

export function WorkspaceExperience({ darkMode, onToggleDarkMode }: WorkspaceExperienceProps) {
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [outreachOpen, setOutreachOpen] = useState(false)
  const [form, setForm] = useState<FormState>(defaultForm)
  const [trafficFloor, setTrafficFloor] = useState<number[]>([5000])
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'All'>('All')
  const [countryFilter, setCountryFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [outreachTone, setOutreachTone] = useState('Professional')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [activeOpportunityId, setActiveOpportunityId] = useState<number | null>(null)
  const [generatedReport, setGeneratedReport] = useState<GeneratedReport | null>(null)
  const [websiteAnalysis, setWebsiteAnalysis] = useState<WebsiteAnalysis | null>(null)
  const [lastAnalyzedUrl, setLastAnalyzedUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [audienceDirty, setAudienceDirty] = useState(false)
  const [pageAlert, setPageAlert] = useState<{ severity: AlertColor; text: string } | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [toast, setToast] = useState<{ open: boolean; severity: AlertColor; text: string }>({
    open: false,
    severity: 'success',
    text: ''
  })

  const isValidWebsiteUrl = (value: string) => {
    try {
      const parsed = new URL(value.startsWith('http') ? value : `https://${value}`)
      return Boolean(parsed.hostname && parsed.hostname.includes('.'))
    } catch {
      return false
    }
  }

  const validateForm = (mode: 'analyze' | 'generate') => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {}

    if (!form.url.trim()) {
      nextErrors.url = 'Website URL is required.'
    } else if (!isValidWebsiteUrl(form.url.trim())) {
      nextErrors.url = 'Enter a valid website URL like https://example.com.'
    }

    if (mode === 'generate') {
      if (!form.industry.trim()) {
        nextErrors.industry = 'Select an industry.'
      }

      if (!form.contentType.trim()) {
        nextErrors.contentType = 'Select a content type.'
      }

      if (!form.backlinkScope.trim()) {
        nextErrors.backlinkScope = 'Choose a backlink niche scope.'
      }

      if (!form.country.trim()) {
        nextErrors.country = 'Choose a target country.'
      }

      if (!form.goal.trim()) {
        nextErrors.goal = 'Select an SEO goal.'
      }

      if (!form.targetAudience.trim()) {
        nextErrors.targetAudience = 'Target audience is required for generation.'
      } else if (form.targetAudience.trim().length < 4) {
        nextErrors.targetAudience = 'Target audience should be more specific.'
      }
    }

    setFormErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const filteredOpportunities = useMemo(() => {
    return (generatedReport?.opportunities ?? []).filter((item) => {
      const matchesDa = item.da >= form.daRange[0] && item.da <= form.daRange[1]
      const matchesTraffic = item.traffic >= trafficFloor[0]
      const matchesDifficulty = difficultyFilter === 'All' || item.difficulty === difficultyFilter
      const matchesCountry = countryFilter === 'All' || item.country === countryFilter
      const query = searchQuery.trim().toLowerCase()
      const matchesQuery =
        query.length === 0 ||
        item.site.toLowerCase().includes(query) ||
        item.linkType.toLowerCase().includes(query) ||
        item.keywords.some((keyword) => keyword.toLowerCase().includes(query))

      return matchesDa && matchesTraffic && matchesDifficulty && matchesCountry && matchesQuery
    })
  }, [countryFilter, difficultyFilter, form.daRange, generatedReport?.opportunities, searchQuery, trafficFloor])

  useEffect(() => {
    if (filteredOpportunities.length === 0) {
      setActiveOpportunityId(null)
      return
    }

    if (activeOpportunityId === null || !filteredOpportunities.some((item) => item.id === activeOpportunityId)) {
      setActiveOpportunityId(filteredOpportunities[0].id)
    }
  }, [activeOpportunityId, filteredOpportunities])

  const activeOpportunity =
    filteredOpportunities.find((item) => item.id === activeOpportunityId) ??
    generatedReport?.opportunities.find((item) => item.id === activeOpportunityId) ??
    null

  const selectedOpportunities = (generatedReport?.opportunities ?? []).filter((item) => selectedIds.includes(item.id))
  const pitchUrl = normaliseUrl(form.url || 'yourwebsite.com')

  const handleFieldChange = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((current) => ({
      ...current,
      [field]: value
    }))
    setFormErrors((current) => {
      if (!current[field]) {
        return current
      }

      const next = { ...current }
      delete next[field]
      return next
    })
  }

  const handleAnalyzeWebsite = async () => {
    if (!validateForm('analyze')) {
      setErrorMessage('Fix the highlighted form fields before running site analysis.')
      return
    }

    if (lastAnalyzedUrl === form.url && websiteAnalysis) {
      return
    }

    setIsAnalyzing(true)
    setErrorMessage('')

    try {
      const response = await fetch('/api/analyze-website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: form.url })
      })

      const payload = (await response.json()) as AnalyzeResponse | { error: string }
      if (!response.ok || 'error' in payload) {
        throw new Error('error' in payload ? payload.error : 'Unable to analyze the website right now.')
      }

      setWebsiteAnalysis(payload.analysis)
      setLastAnalyzedUrl(form.url)
      setPageAlert({
        severity: payload.analysis.provider === 'openai' ? 'success' : 'info',
        text: 'Website analysis completed. Keywords and target audiences have been refreshed.'
      })

      if (!audienceDirty || !form.targetAudience.trim()) {
        handleFieldChange('targetAudience', payload.analysis.targetAudiences.slice(0, 2).join(' and '))
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong while analyzing the website.'
      setErrorMessage(message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleGenerate = async () => {
    if (!validateForm('generate')) {
      setErrorMessage('Fix the highlighted form fields before generating backlink opportunities.')
      setPageAlert(null)
      return
    }

    setIsLoading(true)
    setErrorMessage('')
    setPageAlert(null)

    try {
      const response = await fetch('/api/generate-backlinks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      })

      const payload = (await response.json()) as GeneratedReport | { error: string }

      if (!response.ok || 'error' in payload) {
        throw new Error('error' in payload ? payload.error : 'Unable to generate backlink opportunities right now.')
      }

      setGeneratedReport(payload)
      setWebsiteAnalysis(payload.websiteAnalysis)
      setLastAnalyzedUrl(form.url)
      setSelectedIds(payload.opportunities.slice(0, 2).map((item) => item.id))
      setActiveOpportunityId(payload.opportunities[0]?.id ?? null)
      setToast({
        open: true,
        severity: 'success',
        text: 'Results successfully produced. Your backlink opportunities are ready below.'
      })
      setPageAlert(
        payload.provider === 'fallback'
          ? {
              severity: 'warning',
              text: payload.validationNote
            }
          : null
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong while generating opportunities.'
      setErrorMessage(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetFilters = () => {
    setTrafficFloor([5000])
    setDifficultyFilter('All')
    setCountryFilter('All')
    setSearchQuery('')
    setPageAlert({
      severity: 'info',
      text: 'Filters reset to their default values.'
    })
  }

  const handleClear = () => {
    setForm(defaultForm)
    setTrafficFloor([5000])
    setDifficultyFilter('All')
    setCountryFilter('All')
    setSearchQuery('')
    setSelectedIds([])
    setActiveOpportunityId(null)
    setGeneratedReport(null)
    setWebsiteAnalysis(null)
    setLastAnalyzedUrl('')
    setAudienceDirty(false)
    setErrorMessage('')
    setFormErrors({})
    setPageAlert({
      severity: 'info',
      text: 'Cleared the form, filters, and generated output.'
    })
  }

  const handleSelect = (id: number) => {
    setSelectedIds((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id)
      }

      return [...current, id]
    })

    setActiveOpportunityId(id)
  }

  const handleExportCsv = () => {
    if (selectedOpportunities.length === 0) {
      setToast({
        open: true,
        severity: 'warning',
        text: 'Select at least one opportunity before exporting.'
      })
      return
    }

    const rows = [
      ['Website', 'Country', 'DA', 'Traffic', 'Link Type', 'Contact', 'Priority', 'Next Step'],
      ...selectedOpportunities.map((item) => [
        item.site,
        item.country,
        `${item.da}`,
        `${item.traffic}`,
        item.linkType,
        item.contact,
        item.priority,
        item.nextStep
      ])
    ]

    const csv = rows
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const downloadUrl = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = downloadUrl
    anchor.download = 'backlink-opportunities.csv'
    anchor.click()
    URL.revokeObjectURL(downloadUrl)

    setToast({
      open: true,
      severity: 'success',
      text: `Exported ${selectedOpportunities.length} selected opportunities to CSV.`
    })
  }

  const averageRelevance =
    generatedReport?.overview.averageRelevance ??
    (filteredOpportunities.length > 0
      ? Math.round(filteredOpportunities.reduce((sum, item) => sum + item.relevance, 0) / filteredOpportunities.length)
      : 0)

  return (
    <Box className="workspace-shell">
      <section className="workspace-hero ai-hero-card">
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} lg={7}>
            <Box className="hero-copy fade-rise">
              <Chip
                icon={<PsychologyRoundedIcon />}
                label="AI-guided backlink strategy with website analysis"
                className="hero-chip"
              />
              <Typography variant="h1" className="hero-title">
                Build a backlink plan that feels clear, relevant, and ready to execute
              </Typography>
              <Typography variant="h5" className="hero-subtitle">
                The workspace analyzes your website, suggests audiences and keywords, then turns that context into outreach-ready backlink opportunities.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} className="hero-actions">
                <Button variant="contained" size="large" className="hero-primary" onClick={handleGenerate}>
                  Generate backlink opportunities
                </Button>
                <Button variant="outlined" size="large" className="hero-secondary" onClick={handleAnalyzeWebsite}>
                  {isAnalyzing ? 'Analyzing website...' : 'Analyze my website'}
                </Button>
              </Stack>
              <Grid container spacing={2} className="hero-stats">
                <Grid item xs={12} sm={4}>
                  <Card className="metric-card">
                    <CardContent>
                      <Typography variant="h4">{generatedReport ? generatedReport.opportunities.length : 6}</Typography>
                      <Typography variant="body2">Generated opportunity briefs</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Card className="metric-card">
                    <CardContent>
                      <Typography variant="h4">{generatedReport ? `${averageRelevance}%` : 'High fit'}</Typography>
                      <Typography variant="body2">Average relevance for the current plan</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Card className="metric-card">
                    <CardContent>
                      <Typography variant="h4">
                        {websiteAnalysis ? websiteAnalysis.targetAudiences.length : 3}
                      </Typography>
                      <Typography variant="body2">Suggested audiences from site analysis</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          <Grid item xs={12} lg={5}>
            <Card className="control-card hero-glass-card fade-rise delay-1">
              <CardContent>
                <Box className="card-header">
                  <Box>
                    <Typography variant="h5">Backlink Opportunity Finder</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Use the URL as the source of truth, then tune the country, goal, niche scope, and authority range.
                    </Typography>
                  </Box>
                  <Chip label={generatedReport ? generatedReport.provider.toUpperCase() : 'READY'} color="secondary" />
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Website URL"
                      value={form.url}
                      onBlur={handleAnalyzeWebsite}
                      onChange={(event) => handleFieldChange('url', event.target.value)}
                      error={Boolean(formErrors.url)}
                      helperText={formErrors.url ?? 'We analyze your website server-side so the OpenAI key never reaches the browser.'}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      label="Industry"
                      value={form.industry}
                      onChange={(event) => handleFieldChange('industry', event.target.value)}
                      error={Boolean(formErrors.industry)}
                      helperText={formErrors.industry}
                    >
                      {industryOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      label="Content type"
                      value={form.contentType}
                      onChange={(event) => handleFieldChange('contentType', event.target.value)}
                      error={Boolean(formErrors.contentType)}
                      helperText={formErrors.contentType}
                    >
                      {contentTypes.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Target audience"
                      value={form.targetAudience}
                      onChange={(event) => {
                        setAudienceDirty(true)
                        handleFieldChange('targetAudience', event.target.value)
                      }}
                      error={Boolean(formErrors.targetAudience)}
                      helperText={formErrors.targetAudience ?? 'The field is auto-suggested from the website analysis, but you can refine it.'}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      label="Backlink niche"
                      value={form.backlinkScope}
                      onChange={(event) => handleFieldChange('backlinkScope', event.target.value)}
                      error={Boolean(formErrors.backlinkScope)}
                      helperText={formErrors.backlinkScope}
                    >
                      {backlinkScopes.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      label="Target country"
                      value={form.country}
                      onChange={(event) => handleFieldChange('country', event.target.value)}
                      error={Boolean(formErrors.country)}
                      helperText={formErrors.country}
                    >
                      {countryOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      select
                      label="SEO goal"
                      value={form.goal}
                      onChange={(event) => handleFieldChange('goal', event.target.value)}
                      error={Boolean(formErrors.goal)}
                      helperText={formErrors.goal}
                    >
                      {seoGoals.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Domain authority target
                    </Typography>
                    <Slider
                      value={form.daRange}
                      onChange={(_, value) => handleFieldChange('daRange', value as number[])}
                      valueLabelDisplay="auto"
                      min={10}
                      max={90}
                    />
                  </Grid>
                </Grid>

                {websiteAnalysis ? (
                  <Box className="analysis-panel">
                    <Typography variant="subtitle2">Website analysis</Typography>
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      {websiteAnalysis.summary}
                    </Typography>
                    <Box className="analysis-group">
                      <Typography variant="caption" className="analysis-label">
                        Suggested keywords
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mt={1}>
                        {websiteAnalysis.keywords.map((keyword) => (
                          <Chip key={keyword} label={keyword} variant="outlined" />
                        ))}
                      </Stack>
                    </Box>
                    <Box className="analysis-group">
                      <Typography variant="caption" className="analysis-label">
                        Suggested target audiences
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mt={1}>
                        {websiteAnalysis.targetAudiences.map((audience) => (
                          <Chip
                            key={audience}
                            label={audience}
                            onClick={() => {
                              setAudienceDirty(true)
                              handleFieldChange('targetAudience', audience)
                            }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  </Box>
                ) : null}

                <Box className="button-row">
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    className="generate-button"
                    onClick={handleGenerate}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Box className="button-loading">
                        <CircularProgress size={18} color="inherit" />
                        <span>Generating</span>
                      </Box>
                    ) : (
                      'Generate backlink opportunities'
                    )}
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="large"
                    startIcon={<ClearAllRoundedIcon />}
                    onClick={handleClear}
                    disabled={isLoading}
                  >
                    Clear
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </section>

      {pageAlert ? (
        <Alert severity={pageAlert.severity} className="status-alert">
          {pageAlert.text}
        </Alert>
      ) : null}

      {errorMessage ? (
        <Alert severity="error" className="status-alert">
          {errorMessage}
        </Alert>
      ) : null}

      {!generatedReport && !isLoading ? (
        <Card className="dashboard-card empty-state">
          <CardContent>
            <Typography variant="h5">Analyze the site and produce your backlink plan</Typography>
            <Typography color="text.secondary" mt={1}>
              Once the report runs, you will see AI-picked opportunities, filter controls, export actions, outreach drafts, and a tracker preview.
            </Typography>
          </CardContent>
        </Card>
      ) : null}

      {isLoading ? (
        <Card className="dashboard-card loading-state">
          <CardContent>
            <CircularProgress />
            <Typography variant="h6" mt={2}>
              Producing backlink results
            </Typography>
            <Typography color="text.secondary" mt={1}>
              The app is combining the website analysis, AI plan, and selected SEO inputs into an action-ready output.
            </Typography>
          </CardContent>
        </Card>
      ) : null}

      {generatedReport ? (
        <>
          <Grid container spacing={2} className="summary-strip">
            <Grid item xs={12} md={4}>
              <Card className="summary-card">
                <CardContent>
                  <Typography variant="overline" className="eyebrow">
                    Headline
                  </Typography>
                  <Typography variant="h6">{generatedReport.overview.headline}</Typography>
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    {generatedReport.overview.summary}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card className="summary-card">
                <CardContent>
                  <Typography variant="overline" className="eyebrow">
                    Website fit
                  </Typography>
                  <Typography variant="h6">{generatedReport.websiteAnalysis.title || pitchUrl}</Typography>
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    {generatedReport.websiteAnalysis.targetAudiences.slice(0, 2).join(' | ')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card className="summary-card">
                <CardContent>
                  <Typography variant="overline" className="eyebrow">
                    First priority
                  </Typography>
                  <Typography variant="h6">{generatedReport.overview.firstPriority}</Typography>
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    Generated {new Date(generatedReport.generatedAt).toLocaleString()}.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={3} alignItems="stretch">
            <Grid item xs={12} lg={3}>
              <Card className="dashboard-card filter-card">
                <CardContent>
                  <Typography variant="h6">Smart filters</Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Refine the generated list without clearing the campaign.
                  </Typography>

                  <Typography variant="subtitle2" gutterBottom>
                    Domain authority
                  </Typography>
                  <Slider
                    value={form.daRange}
                    onChange={(_, value) => handleFieldChange('daRange', value as number[])}
                    valueLabelDisplay="auto"
                    min={10}
                    max={90}
                  />

                  <Typography variant="subtitle2" gutterBottom mt={3}>
                    Monthly traffic floor
                  </Typography>
                  <Slider
                    value={trafficFloor}
                    onChange={(_, value) => setTrafficFloor(value as number[])}
                    valueLabelDisplay="auto"
                    min={1000}
                    max={30000}
                    step={1000}
                  />

                  <TextField
                    fullWidth
                    select
                    label="Difficulty"
                    margin="normal"
                    value={difficultyFilter}
                    onChange={(event) => setDifficultyFilter(event.target.value as Difficulty | 'All')}
                  >
                    {['All', 'Easy', 'Medium', 'Hard'].map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    fullWidth
                    select
                    label="Country"
                    margin="normal"
                    value={countryFilter}
                    onChange={(event) => setCountryFilter(event.target.value)}
                  >
                    {['All', ...countryOptions].map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    fullWidth
                    size="small"
                    label="Search opportunities"
                    margin="normal"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchRoundedIcon fontSize="small" />
                        </InputAdornment>
                      )
                    }}
                  />

                  <Box className="filter-tags">
                    <Chip label={form.industry} />
                    <Chip label={form.backlinkScope} />
                    <Chip label={form.contentType} />
                  </Box>

                  <Button variant="outlined" className="filter-reset-button" onClick={handleResetFilters}>
                    Reset filters
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} lg={5}>
              <Box className="results-column">
                <Box className="results-header">
                  <Box>
                    <Typography variant="h5">Backlink opportunities</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {filteredOpportunities.length} matching websites for {normaliseUrl(form.url)}
                    </Typography>
                  </Box>
                  <Chip icon={<StarRoundedIcon />} label={`${selectedOpportunities.length} selected`} color="secondary" />
                </Box>

                <Stack spacing={2}>
                  {filteredOpportunities.map((item) => {
                    const isSelected = selectedIds.includes(item.id)
                    const isActive = activeOpportunity?.id === item.id

                    return (
                      <Card key={item.id} className={`dashboard-card opportunity-card ${isActive ? 'is-active' : ''}`}>
                        <CardContent>
                          <Box className="opportunity-topline">
                            <Box className="opportunity-checkbox-wrap">
                              <Checkbox checked={isSelected} onChange={() => handleSelect(item.id)} color="secondary" />
                            </Box>
                            <Box flex={1}>
                              <Box className="opportunity-header">
                                <Box>
                                  <Typography variant="h6">{item.site}</Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {item.contact}
                                  </Typography>
                                </Box>
                                <Chip label={item.priority} color={getPriorityColor(item.priority)} />
                              </Box>
                            </Box>
                          </Box>

                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap className="opportunity-tags">
                            <Chip label={`DA ${item.da}`} />
                            <Chip label={`Traffic ${formatTraffic(item.traffic)}`} variant="outlined" />
                            <Chip label={item.linkType} variant="outlined" />
                            <Chip label={item.difficulty} color={getDifficultyColor(item.difficulty)} variant="outlined" />
                          </Stack>

                          <Typography variant="body2" className="opportunity-reason">
                            {item.reason}
                          </Typography>

                          <Divider sx={{ my: 2 }} />

                          <Box className="opportunity-footer">
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Relevance score
                              </Typography>
                              <Typography variant="h6">{item.relevance}%</Typography>
                            </Box>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                              <Button variant="outlined" onClick={() => setActiveOpportunityId(item.id)}>
                                View details
                              </Button>
                              <Button
                                variant="contained"
                                onClick={() => {
                                  setActiveOpportunityId(item.id)
                                  setOutreachOpen(true)
                                }}
                              >
                                Generate outreach
                              </Button>
                            </Stack>
                          </Box>
                        </CardContent>
                      </Card>
                    )
                  })}

                  {filteredOpportunities.length === 0 ? (
                    <Card className="dashboard-card empty-state">
                      <CardContent>
                        <Typography variant="h6">No matches under the current filters</Typography>
                        <Typography color="text.secondary">
                          Loosen the DA or traffic filters, or clear the search box to bring more opportunities back into view.
                        </Typography>
                      </CardContent>
                    </Card>
                  ) : null}
                </Stack>
              </Box>
            </Grid>

            <Grid item xs={12} lg={4}>
              <Card className="dashboard-card insight-card">
                <CardContent>
                  <Box className="card-header">
                    <Box>
                      <Typography variant="h6">AI insights panel</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Why the current target matters and what to do next.
                      </Typography>
                    </Box>
                    <AutoAwesomeRoundedIcon color="secondary" />
                  </Box>

                  {activeOpportunity ? (
                    <>
                      <Box className="insight-hero">
                        <Typography variant="overline" className="eyebrow">
                          Active opportunity
                        </Typography>
                        <Typography variant="h5">{activeOpportunity.site}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {activeOpportunity.country} | {activeOpportunity.linkType} | {activeOpportunity.submission}
                        </Typography>
                      </Box>

                      <Box className="insight-section">
                        <Typography variant="subtitle1">Why it fits</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {activeOpportunity.reason}
                        </Typography>
                      </Box>

                      <Box className="insight-section">
                        <Typography variant="subtitle1">Keyword and anchor strategy</Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mt={1.5}>
                          {activeOpportunity.keywords.map((keyword) => (
                            <Chip key={keyword} label={keyword} variant="outlined" />
                          ))}
                        </Stack>
                        <Typography variant="body2" color="text.secondary" mt={1.5}>
                          Anchors: {activeOpportunity.anchors.join(', ')}
                        </Typography>
                      </Box>

                      <Box className="insight-section">
                        <Typography variant="subtitle1">Content angle</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {activeOpportunity.contentIdea}
                        </Typography>
                      </Box>

                      <Box className="insight-section">
                        <Typography variant="subtitle1">Do's and don'ts</Typography>
                        <Stack spacing={1.25} mt={1.5}>
                          {activeOpportunity.risks.map((risk) => (
                            <Box key={risk} className="bullet-line">
                              <ChevronRightRoundedIcon fontSize="small" color="secondary" />
                              <Typography variant="body2" color="text.secondary">
                                {risk}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      </Box>

                      <Alert severity="success" icon={<CheckCircleRoundedIcon fontSize="inherit" />}>
                        Next step: {activeOpportunity.nextStep}
                      </Alert>
                    </>
                  ) : (
                    <Typography color="text.secondary">
                      Select an opportunity to see the AI justification, anchor suggestions, and outreach angle.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card className="sticky-action-bar">
            <CardContent className="sticky-action-content">
              <Box>
                <Typography variant="subtitle1">Execution bar</Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedOpportunities.length} shortlisted opportunities ready for export or outreach.
                </Typography>
              </Box>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
                <Button variant="outlined" onClick={handleExportCsv}>
                  Export CSV
                </Button>
                <Button variant="outlined" onClick={() => setAssistantOpen(true)}>
                  View next steps
                </Button>
                <Button variant="outlined" onClick={handleClear}>
                  Clear all
                </Button>
                <Button variant="contained" onClick={() => setOutreachOpen(true)}>
                  Generate outreach
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </>
      ) : null}

      <section className="tracker-section">
        <Box className="section-heading">
          <Box>
            <Typography variant="overline" className="eyebrow">
              Tracker preview
            </Typography>
            <Typography variant="h3">Execution tracker</Typography>
          </Box>
        </Box>

        <Grid container spacing={2}>
          {(generatedReport?.trackerPreview ?? [
            { status: 'Applied', site: 'Generate a report first', note: 'Tracker rows will populate after the first completed run.' },
            { status: 'Approved', site: 'Suggested audience map', note: 'Website analysis suggestions flow into future execution tracking.' },
            { status: 'Follow-up due', site: 'Outreach cadence', note: 'Future work can evolve this into a full CRM-style flow.' }
          ]).map((item) => (
            <Grid item xs={12} md={4} key={`${item.status}-${item.site}`}>
              <Card className="dashboard-card tracker-card">
                <CardContent>
                  <Chip
                    label={item.status}
                    color={item.status === 'Approved' ? 'success' : item.status === 'Applied' ? 'secondary' : 'warning'}
                  />
                  <Typography variant="h6" mt={2}>
                    {item.site}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    {item.note}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </section>

      <Tooltip title="Assist AI" placement="left">
        <Fab className="assistant-fab" color="secondary" aria-label="Assist AI" onClick={() => setAssistantOpen(true)}>
          <SmartToyRoundedIcon />
        </Fab>
      </Tooltip>

      <Dialog open={assistantOpen} onClose={() => setAssistantOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>AssistAI</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            {(generatedReport?.nextSteps ?? [
              'Start with the website analysis so the plan matches your positioning.',
              'Shortlist the easiest wins before moving into the most competitive authority targets.',
              'Use the outreach modal only after the content angle feels strong enough to pitch.'
            ]).map((item, index) => (
              <Alert key={`${item}-${index}`} severity={index === 1 ? 'success' : index === 2 ? 'warning' : 'info'}>
                {item}
              </Alert>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssistantOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={outreachOpen} onClose={() => setOutreachOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>AI outreach generator</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                select
                label="Tone"
                value={outreachTone}
                onChange={(event) => setOutreachTone(event.target.value)}
              >
                {tones.map((tone) => (
                  <MenuItem key={tone} value={tone}>
                    {tone}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Subject line"
                value={
                  activeOpportunity ? `${outreachTone} collaboration idea for ${activeOpportunity.site}` : 'Personalized backlink pitch'
                }
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={10}
                label="Email body"
                value={
                  activeOpportunity
                    ? `Hi ${activeOpportunity.site} team,\n\nI am reaching out from ${pitchUrl}. We help ${form.targetAudience.toLowerCase() || 'growth teams'} with ${form.goal.toLowerCase()}, and I think your ${activeOpportunity.linkType.toLowerCase()} audience would respond well to a practical resource on ${activeOpportunity.keywords[0]}.\n\nA strong angle could be: ${activeOpportunity.contentIdea}\n\nWhy this fits your readers:\n- ${activeOpportunity.reason}\n- We can tailor the examples to ${form.industry.toLowerCase()} teams\n- We will keep the piece actionable, non-promotional, and editor-friendly\n\nIf this sounds useful, I can send a short outline with two headline options.\n\nBest,\n${pitchUrl}`
                    : ''
                }
                InputProps={{ readOnly: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <FormControlLabel control={<Switch checked={darkMode} onChange={onToggleDarkMode} />} label="Dark mode" />
          <Button onClick={() => setOutreachOpen(false)}>Close</Button>
          <Button variant="contained" onClick={() => setOutreachOpen(false)}>
            Copy and use
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast((current) => ({ ...current, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setToast((current) => ({ ...current, open: false }))} severity={toast.severity} variant="filled">
          {toast.text}
        </Alert>
      </Snackbar>
    </Box>
  )
}
