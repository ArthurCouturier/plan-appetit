import { Navigate } from "react-router-dom";
import useAuth from "../api/hooks/useAuth";

export default function Home() {
  const { user } = useAuth();

  // Attendre que le statut d'authentification soit déterminé
  if (user === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-color">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cout-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cout-purple font-semibold">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur est NON connecté, rediriger vers /sandbox
  if (user === null) {
    return <Navigate to="/sandbox" replace />;
  }

  // Si connecté, rediriger vers ses recettes
  return <Navigate to="/recettes" replace />;
}
