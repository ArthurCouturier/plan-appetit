import { RouterProvider } from 'react-router-dom';
import './App.css';
import router from './routes';
import { useState, useEffect } from 'react';
import DarkModeButton from './components/buttons/DarkModeButton';
import Monitor from './components/three/Monitor';
import { AuthProvider } from './components/authentication/AuthProvider';

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'theme1';
  });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove('theme1', 'theme2');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const changeTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'theme1' ? 'theme2' : 'theme1'));
  };

  return (
    <div className={`${theme}`}>
      {!isMobile && <DarkModeButton mode={theme} changeMode={changeTheme} />}
      <AuthProvider>
        {isMobile ? <Monitor /> : <RouterProvider router={router} />}
      </AuthProvider>
    </div>
  );
}

export default App;
