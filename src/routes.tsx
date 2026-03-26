// routes.tsx
import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import Onboarding from "./pages/Onboarding";
import Sandbox from "./pages/Sandbox";
import Recipes from "./pages/Recipes";
import RecipeDetail from "./pages/RecipeDetail";
import CollectionDetail from "./pages/CollectionDetail";
import RecipeLocationGeneration from "./pages/RecipeLocationGeneration";
import LoginPage from "./pages/Login";
import ProtectedRoute from "./components/authentication/ProtectedRoute";
import Account from "./pages/Account";
import AccountSettings from "./pages/AccountSettings";
import MyRecipes from "./pages/MyRecipes";
import Layout from "./components/global/Layout";
import BecomePremium from "./pages/BecomePremium";
import InstagramImport from "./pages/InstagramImport";
import { CGUPage, PolitiqueConfidentialitePage, MentionsLegalesPage, CGVPage } from "./pages/legal";
import Admin from "./pages/Admin";
import AdminBatchs from "./pages/AdminBatchs";
import AdminUserRecipes from "./pages/AdminUserRecipes";
import AdminTrackingTest from "./pages/AdminTrackingTest";
import AdminNotifications from "./pages/AdminNotifications";
import AdminNotificationsList from "./pages/AdminNotificationsList";
import AdminSendNotification from "./pages/AdminSendNotification";
import FridgeMode from "./pages/FridgeMode";
import NewRecipePage from "./pages/NewRecipePage";

const router = createBrowserRouter([
    {
        path: "/",
        children: [
            {
                index: true,
                element: <Home />,
            },
            {
                path: "onboarding",
                element: <Onboarding />,
            },
            {
                element: <Layout />,
                children: [
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
                                path: "profile/settings",
                                element: <AccountSettings />,
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
                                path: "frigo",
                                element: <FridgeMode />,
                            },
                            {
                                path: "recettes/nouvelle",
                                element: <NewRecipePage />,
                            },
                            {
                                path: "premium",
                                element: <BecomePremium />
                            },
                            {
                                path: "admin",
                                element: <Admin />
                            },
                            {
                                path: "admin/batchs",
                                element: <AdminBatchs />
                            },
                            {
                                path: "admin/user-recipes",
                                element: <AdminUserRecipes />
                            },
                            {
                                path: "admin/tracking-test",
                                element: <AdminTrackingTest />
                            },
                            {
                                path: "admin/notifications",
                                element: <AdminNotifications />
                            },
                            {
                                path: "admin/notifications/list",
                                element: <AdminNotificationsList />
                            },
                            {
                                path: "admin/notifications/send",
                                element: <AdminSendNotification />
                            }
                        ],
                    },
                ],
            },
        ],
    },
]);

export default router;
