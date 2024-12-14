import { RouterProvider } from 'react-router-dom';
import './App.css';
import router from './routes';
import { useState, useEffect } from 'react';
import DarkModeButton from './components/DarkModeButton';

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'theme1';
  });

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
      <DarkModeButton mode={theme} changeMode={changeTheme} />
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
