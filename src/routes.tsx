// routes.tsx
import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import Planning from "./pages/Planning";
import Recipes from "./pages/Recipes";
import RecipeDetail from "./pages/RecipeDetail";
import RecipeGeneration from "./pages/RecipeGeneration";
import Login from "./components/authentication/Login";
import ProtectedRoute from "./components/authentication/ProtectedRoute";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Home />,
    },
    {
        path: "/login",
        element: <Login />,
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                path: "/planning",
                element: <Planning />,
            },
            {
                path: "/recettes/generer",
                element: <RecipeGeneration />,
            },
        ],
    },
    {
        path: "/recettes",
        element: <Recipes />,
    },
    {
        path: "/recettes/:uuid",
        element: <RecipeDetail />,
    },
]);

export default router;
