import { useEffect, useState } from 'react'
import { Box, CssBaseline, ThemeProvider, createTheme, responsiveFontSizes } from '@mui/material'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { SiteFooter } from './components/SiteFooter'
import { SiteHeader } from './components/SiteHeader'
import { FaqPage } from './pages/FaqPage'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { WorkspacePage } from './pages/WorkspacePage'

function ScrollToTop() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  return null
}

function AppRoutes({
  darkMode,
  onToggleDarkMode
}: {
  darkMode: boolean
  onToggleDarkMode: () => void
}) {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Box className={`app-shell ${darkMode ? 'theme-dark' : 'theme-light'}`}>
        <SiteHeader darkMode={darkMode} onToggleDarkMode={onToggleDarkMode} />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/workspace" element={<WorkspacePage darkMode={darkMode} onToggleDarkMode={onToggleDarkMode} />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <SiteFooter />
      </Box>
    </BrowserRouter>
  )
}

function App() {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const storedMode = window.localStorage.getItem('backlink-ai-theme')
    if (storedMode === 'dark') {
      setDarkMode(true)
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem('backlink-ai-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  let theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: '#0b1c3d' },
      secondary: { main: '#6c5ce7' },
      info: { main: '#00d4ff' },
      success: { main: '#22c55e' },
      warning: { main: '#f59e0b' },
      error: { main: '#ef4444' },
      background: darkMode
        ? { default: '#07111f', paper: '#101b31' }
        : { default: '#f4f7fb', paper: '#ffffff' }
    },
    shape: { borderRadius: 18 },
    typography: {
      fontFamily: 'Poppins, sans-serif',
      h1: {
        fontSize: '2rem',
        lineHeight: 1.04,
        fontWeight: 700
      },
      h2: {
        fontSize: '1.8rem',
        lineHeight: 1.08,
        fontWeight: 700
      },
      h3: {
        fontSize: '1.65rem',
        lineHeight: 1.1,
        fontWeight: 700
      },
      h4: {
        fontSize: '1.45rem',
        lineHeight: 1.14,
        fontWeight: 700
      },
      h5: {
        fontSize: '1.25rem',
        lineHeight: 1.2,
        fontWeight: 600
      },
      h6: {
        fontSize: '1.1rem',
        lineHeight: 1.28,
        fontWeight: 600
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.7
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.65
      },
      caption: {
        fontSize: '0.75rem',
        lineHeight: 1.5
      }
    }
  })

  theme = responsiveFontSizes(theme, {
    breakpoints: ['sm', 'md', 'lg']
  })

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppRoutes darkMode={darkMode} onToggleDarkMode={() => setDarkMode((current) => !current)} />
    </ThemeProvider>
  )
}

export default App
