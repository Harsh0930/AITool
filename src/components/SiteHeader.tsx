import { useState } from 'react'
import { AppBar, Box, Button, Drawer, IconButton, Toolbar, Typography } from '@mui/material'
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded'
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import { Link as RouterLink, NavLink } from 'react-router-dom'

interface SiteHeaderProps {
  darkMode: boolean
  onToggleDarkMode: () => void
}

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Workspace', to: '/workspace' },
  { label: 'FAQ', to: '/faq' }
]

export function SiteHeader({ darkMode, onToggleDarkMode }: SiteHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <AppBar position="sticky" color="transparent" elevation={0} className="topbar">
        <Toolbar className="toolbar">
          <Box component={RouterLink} to="/" className="brand-block brand-link">
            <Box className="brand-mark">
              <AutoAwesomeRoundedIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="subtitle1" className="brand-name">
                BacklinkAI
              </Typography>
              <Typography variant="caption" className="brand-tagline">
                AI backlink strategy and outreach assistant
              </Typography>
            </Box>
          </Box>

          <Box className="nav-links desktop-only">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
          </Box>

          <Box className="topbar-actions">
            <IconButton aria-label="toggle theme" className="theme-toggle" onClick={onToggleDarkMode}>
              {darkMode ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
            </IconButton>
            <Button component={RouterLink} to="/workspace" variant="outlined" className="desktop-only nav-button">
              Open Workspace
            </Button>
            <Button component={RouterLink} to="/workspace" variant="contained" className="desktop-only nav-button primary-nav-button">
              Generate Backlinks
            </Button>
            <IconButton aria-label="open navigation" className="mobile-only" onClick={() => setMobileOpen(true)}>
              <MenuRoundedIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer anchor="right" open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <Box className="mobile-drawer">
          <Typography variant="h6" mb={2}>
            Navigation
          </Typography>
          {navItems.map((item) => (
            <Button key={item.to} component={RouterLink} to={item.to} onClick={() => setMobileOpen(false)}>
              {item.label}
            </Button>
          ))}
          <Button component={RouterLink} to="/workspace" variant="contained" sx={{ mt: 2 }} onClick={() => setMobileOpen(false)}>
            Open Workspace
          </Button>
        </Box>
      </Drawer>
    </>
  )
}
