import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext'
import { TimeTrackingProvider } from './contexts/TimeTrackingContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <TimeTrackingProvider>
          <App />
        </TimeTrackingProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
