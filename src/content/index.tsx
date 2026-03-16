import React from 'react'
import { createRoot } from 'react-dom/client'
import Sidebar from './Sidebar'
import { TierProvider } from './TierContext'
import './index.css'

const ROOT_ID = 'prl-root'

function mount() {
  if (document.getElementById(ROOT_ID)) return

  const container = document.createElement('div')
  container.id = ROOT_ID
  document.body.appendChild(container)

  const root = createRoot(container)
  root.render(
    <React.StrictMode>
      <TierProvider>
        <Sidebar />
      </TierProvider>
    </React.StrictMode>
  )
}

// Wait for body to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount)
} else {
  mount()
}
