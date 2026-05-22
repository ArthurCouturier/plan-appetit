import { Navigate } from "react-router-dom";
import useAuth from "../api/hooks/useAuth";
import PageLoader from "../components/global/PageLoader";

export default function Home() {
  const { user } = useAuth();

  if (user === undefined) {
    return <PageLoader />;
  }

  if (user === null) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Navigate to="/recettes" replace />;
}
