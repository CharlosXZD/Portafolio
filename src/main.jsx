import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import { LanguageProvider } from './i18n/LanguageContext.jsx'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* reducedMotion="user" swaps transform animations for plain fades when the OS asks for it */}
    <MotionConfig reducedMotion="user">
      <LanguageProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </LanguageProvider>
    </MotionConfig>
  </StrictMode>,
)
