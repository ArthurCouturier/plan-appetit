import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'
import { Analytics } from "@vercel/analytics/react"
import { ThemeProvider } from '@material-tailwind/react'
import { RecipeProvider } from './contexts/RecipeContext.tsx'
import { PostHogProvider } from './contexts/PostHogContext.tsx'
import { STALE_TIME } from './api/queryConfig.ts'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME,
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <meta name="facebook-domain-verification" content="8cwoijjv8z0tzhs29lmydvgv939dos" />
    <QueryClientProvider client={queryClient}>
      <PostHogProvider>
        <RecipeProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </RecipeProvider>
      </PostHogProvider>
    </QueryClientProvider>
    <Analytics />
  </StrictMode>,
)
