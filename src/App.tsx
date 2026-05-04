// App.tsx
import './App.css';
import { RouterProvider } from 'react-router-dom';
import router from './routes';
import { AuthProvider } from './components/authentication/AuthProvider';
import CookieConsentBanner from './components/global/CookieConsentBanner';
import { DailyRecipeProvider } from './contexts/DailyRecipeContext';
import { FeedbackProvider } from './contexts/FeedbackContext';
import FeedbackEventBridge from './components/feedbacks/FeedbackEventBridge';
import ReferralBootstrap from './components/referral/ReferralBootstrap';

function App() {
  return (
    <AuthProvider>
      <DailyRecipeProvider>
        <FeedbackProvider>
          <FeedbackEventBridge />
          <ReferralBootstrap />
          <RouterProvider router={router} />
          <CookieConsentBanner />
        </FeedbackProvider>
      </DailyRecipeProvider>
    </AuthProvider>
  );
}

export default App;
