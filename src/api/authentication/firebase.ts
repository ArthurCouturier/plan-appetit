import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Votre configuration Firebase, récupérée via les variables d'environnement
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string,
};

// Initialisation de l'application Firebase
const app = initializeApp(firebaseConfig);

// Initialisation de Firebase Analytics (selon la compatibilité de votre environnement)
const analytics = getAnalytics(app);

// Initialisation de Firebase Auth
const auth = getAuth(app);

// Exportez les objets pour les utiliser dans vos composants
export { app, analytics, auth };