// App.tsx
import './App.css';
import { RouterProvider } from 'react-router-dom';
import router from './routes';
import { AuthProvider } from './components/authentication/AuthProvider';
import CookieConsentBanner from './components/global/CookieConsentBanner';

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <CookieConsentBanner />
    </AuthProvider>
  );
}

export default App;
