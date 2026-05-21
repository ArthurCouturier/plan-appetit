// App.tsx
import './App.css';
import { RouterProvider } from 'react-router-dom';
import router from './routes';
import { AuthProvider } from './components/authentication/AuthProvider';
import CookieConsentBanner from './components/global/CookieConsentBanner';
import { DailyRecipeProvider } from './contexts/DailyRecipeContext';
import { FeedbackProvider } from './contexts/FeedbackContext';
import { OfflineFallbackProvider } from './contexts/OfflineFallbackContext';
import FeedbackEventBridge from './components/feedbacks/FeedbackEventBridge';
import ReferralBootstrap from './components/referral/ReferralBootstrap';

function App() {
  return (
    <AuthProvider>
      <DailyRecipeProvider>
        <FeedbackProvider>
          <OfflineFallbackProvider>
            <FeedbackEventBridge />
            <ReferralBootstrap />
            <RouterProvider router={router} />
            <CookieConsentBanner />
          </OfflineFallbackProvider>
        </FeedbackProvider>
      </DailyRecipeProvider>
    </AuthProvider>
  );
}

export default App;
