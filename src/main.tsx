import App from './App.tsx'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// case is main url redirect to random url
if (window.location.search === '') {
  const rand = Math.random().toString(36).substring(2, 10)
  const url = window.location.toString() + `?${rand}`
  window.location.assign(url)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
