import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'
import { Analytics } from "@vercel/analytics/react"
import { ThemeProvider } from '@material-tailwind/react'
import { RecipeProvider } from './contexts/RecipeContext.tsx'
import { PostHogProvider } from './contexts/PostHogContext.tsx'
import { STALE_TIME, GC_TIME } from './api/queryConfig.ts'
import { Capacitor } from '@capacitor/core'
import { WatchBridge } from './api/plugins/WatchBridge'
import { initAppVersionHeaders } from './api/utils/appVersionHeaders'

initAppVersionHeaders();

if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios') {
  console.log('[WatchSync][boot] iOS detected, pinging WatchBridge plugin at startup');
  ;(WatchBridge as unknown as { ping: () => Promise<unknown> })
    .ping()
    .then((res) => console.log('[WatchSync][boot] ping OK', res))
    .catch((err) => console.warn('[WatchSync][boot] ping FAILED', err));
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME,
      gcTime: GC_TIME,
      refetchOnWindowFocus: false,
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
