// App.tsx
import './App.css';
import { RouterProvider } from 'react-router-dom';
import router from './routes';
import { AuthProvider } from './components/authentication/AuthProvider';
import { useGLTF } from '@react-three/drei';

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

// Préchargement des modèles 3D
useGLTF.preload("/models/business-plan-lower.glb");
useGLTF.preload("/models/Monitor.glb");
useGLTF.preload("/models/Recipes.glb");

export default App;
