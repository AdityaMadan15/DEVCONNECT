import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar       from './Sidebar'
import Navbar        from './Navbar'
import NetworkCanvas from './NetworkCanvas'

// Map routes → readable page titles
const PAGE_TITLES = {
  '/dashboard':     'Dashboard',
  '/projects':      'Projects',
  '/projects/create': 'Create Project',
  '/teams':         'Teams',
  '/messages':      'Messages',
  '/resources':     'Resources',
  '/notifications': 'Notifications',
  '/settings':      'Settings',
}

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { pathname } = useLocation()

  // Handle dynamic routes
  let pageTitle = PAGE_TITLES[pathname]
  if (!pageTitle && pathname.startsWith('/projects/') && pathname !== '/projects/create') {
    pageTitle = 'Project Details'
  }
  if (!pageTitle) {
    pageTitle = 'DevConnect'
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Background animation */}
      <NetworkCanvas />

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main shell — pushed right on lg screens */}
      <div className="relative z-10 flex flex-col min-h-screen lg:pl-64">

        {/* Sticky top navbar */}
        <Navbar
          pageTitle={pageTitle}
          onMenuToggle={() => setSidebarOpen(v => !v)}
        />

        {/* Scrollable page content */}
        <main className="flex-1 pt-16">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t border-surface-border py-4 px-6 text-center">
          <p className="text-xs text-slate-700 font-mono">
            DevConnect © {new Date().getFullYear()} &nbsp;·&nbsp; Student Developer Collaboration Platform
          </p>
        </footer>
      </div>
    </div>
  )
}
