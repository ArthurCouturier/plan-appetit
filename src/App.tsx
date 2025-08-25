// App.tsx
import './App.css';
import { RouterProvider } from 'react-router-dom';
import router from './routes';
import { AuthProvider } from './components/authentication/AuthProvider';
import { useGLTF } from '@react-three/drei';
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

const publicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY as string;
const stripePromise = loadStripe("pk_test_51Rt9TILO5WTDaXvxYuAPwcvI4CWPYec7HwwGCpGElx05tVOKCt9AflSr06gP4hbh4B1C7gB7Nzt4DCCoPBweVqJO007xvnmpwk");

function App() {
  return (
    <AuthProvider>
      <Elements stripe={stripePromise}>
        <RouterProvider router={router} />
      </Elements>
    </AuthProvider>
  );
}

// Préchargement des modèles 3D
useGLTF.preload("/models/business-plan-lower.glb");
useGLTF.preload("/models/Monitor.glb");
useGLTF.preload("/models/Recipes.glb");

export default App;
