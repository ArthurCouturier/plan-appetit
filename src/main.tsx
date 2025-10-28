import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Analytics } from "@vercel/analytics/react"
import { ThemeProvider } from '@material-tailwind/react'
import { RecipeProvider } from './contexts/RecipeContext.tsx'
import { PostHogProvider } from './contexts/PostHogContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PostHogProvider>
      <RecipeProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </RecipeProvider>
    </PostHogProvider>
    <Analytics />
  </StrictMode>,
)
