import { RouterProvider } from 'react-router-dom'
import './App.css'
import router from './routes'
import { useState } from 'react';

function App() {
  const [theme, setTheme] = useState('theme1');
  return (
    <div className={`${theme}`}>
      <button className='bg-bgColor' onClick={() => setTheme(theme === 'theme1' ? 'theme2' : 'theme1')}>{theme}</button>
      <RouterProvider router={router} />
    </div>
  )
}

export default App
