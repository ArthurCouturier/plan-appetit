// App.tsx
import './App.css';
import { RouterProvider } from 'react-router-dom';
import router from './routes';
import { AuthProvider } from './components/authentication/AuthProvider';
import CookieConsentBanner from './components/global/CookieConsentBanner';
import { DailyRecipeProvider } from './contexts/DailyRecipeContext';

function App() {
  return (
    <AuthProvider>
      <DailyRecipeProvider>
        <RouterProvider router={router} />
        <CookieConsentBanner />
      </DailyRecipeProvider>
    </AuthProvider>
  );
}

export default App;
