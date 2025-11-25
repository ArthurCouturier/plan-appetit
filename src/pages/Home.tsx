import { Navigate } from "react-router-dom";
import useAuth from "../api/hooks/useAuth";

export default function Home() {
  const { user } = useAuth();

  // Si l'utilisateur est NON connecté, rediriger vers /sandbox
  if (!user) {
    return <Navigate to="/sandbox" replace />;
  }

  // Si connecté, rediriger vers ses recettes
  return <Navigate to="/recettes" replace />;
}
