// routes.tsx
import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import Sandbox from "./pages/Sandbox";
import Recipes from "./pages/Recipes";
import RecipeDetail from "./pages/RecipeDetail";
import CollectionDetail from "./pages/CollectionDetail";
import RecipeLocationGeneration from "./pages/RecipeLocationGeneration";
import LoginPage from "./pages/Login";
import ProtectedRoute from "./components/authentication/ProtectedRoute";
import Account from "./pages/Account";
import MyRecipes from "./pages/MyRecipes";
import Layout from "./components/global/Layout";
import BecomePremium from "./pages/BecomePremium";
import InstagramImport from "./pages/InstagramImport";
import { CGUPage, PolitiqueConfidentialitePage, MentionsLegalesPage, CGVPage } from "./pages/legal";

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
                path: "sandbox",
                element: <Sandbox />,
            },
            {
                path: "instagram",
                element: <InstagramImport />,
            },
            {
                path: "login",
                element: <LoginPage />,
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
                path: "legal/cgu",
                element: <CGUPage />,
            },
            {
                path: "legal/cgv",
                element: <CGVPage />,
            },
            {
                path: "legal/politique-de-confidentialite",
                element: <PolitiqueConfidentialitePage />,
            },
            {
                path: "legal/mentions-legales",
                element: <MentionsLegalesPage />,
            },
            {
                element: <ProtectedRoute />,
                children: [
                    {
                        path: "profile",
                        element: <Account />,
                    },
                    {
                        path: "recettes/generer/localisation",
                        element: <RecipeLocationGeneration />,
                    },
                    {
                        path: "recettes/generer/sandbox",
                        element: <Sandbox />,
                    },
                    {
                        path: "myrecipes",
                        element: <MyRecipes />,
                    },
                    {
                        path: "collections/:uuid",
                        element: <CollectionDetail />,
                    },
                    {
                        path: "premium",
                        element: <BecomePremium />
                    }
                ],
            },
        ],
    },
]);

export default router;
