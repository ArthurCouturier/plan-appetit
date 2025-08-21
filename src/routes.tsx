// routes.tsx
import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import Planning from "./pages/Planning";
import Recipes from "./pages/Recipes";
import RecipeDetail from "./pages/RecipeDetail";
import RecipeGeneration from "./pages/RecipeGeneration";
import LoginPage from "./pages/Login";
import ProtectedRoute from "./components/authentication/ProtectedRoute";
import Account from "./pages/Account";
import MyRecipes from "./pages/MyRecipes";
import Layout from "./components/global/Layout";
import Premium from "./pages/Premium";
import Complete from "./pages/Complete";
import Cancel from "./pages/Cancel";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                path: "",
                element: <Home />,
            },
            {
                path: "complete",
                element: <Complete />,
            },
            {
                path: "cancel",
                element: <Cancel />,
            },
            {
                path: "login",
                element: <LoginPage />,
            },
            {
                path: "premium",
                element: <Premium />,
            },
            {
                path: "planning",
                element: <Planning />,
            },
            {
                path: "recettes",
                element: <Recipes />,
            },
            {
                path: "recettes/:uuid",
                element: <RecipeDetail />,
            },
            {
                element: <ProtectedRoute />,
                children: [
                    {
                        path: "profile",
                        element: <Account />,
                    },
                    {
                        path: "recettes/generer",
                        element: <RecipeGeneration />,
                    },
                    {
                        path: "mesrecettes",
                        element: <MyRecipes />,
                    },
                ],
            },
        ],
    },
]);

export default router;
