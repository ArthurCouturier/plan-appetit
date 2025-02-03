import { createBrowserRouter } from "react-router-dom";
import Planning from "./pages/Planning";
import Home from "./pages/Home";
import Recipes from "./pages/Recipes";
import RecipeDetail from "./pages/RecipeDetail";
import RecipeGeneration from "./pages/RecipeGeneration";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Home />,
    },
    {
        path: "/planning",
        element: <Planning />,
    },
    {
        path: "/recettes",
        element: <Recipes />,
    },
    {
        path: "/recettes/:uuid",
        element: <RecipeDetail />,
    },
    {
        path: "/recettes/generer",
        element: <RecipeGeneration />,
    },
]);

export default router;
