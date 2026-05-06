// routes.tsx
import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import Onboarding from "./pages/Onboarding";
import Sandbox from "./pages/Sandbox";
import GuidedSandbox from "./pages/GuidedSandbox";
import Recipes from "./pages/Recipes";
import RecipeDetail from "./pages/RecipeDetail";

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
import Admin from "./pages/admin/Admin";
import AdminBatchs from "./pages/admin/AdminBatchs";
import AdminUserRecipes from "./pages/admin/AdminUserRecipes";
import AdminTrackingTest from "./pages/admin/AdminTrackingTest";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminNotificationsList from "./pages/admin/AdminNotificationsList";
import AdminSendNotification from "./pages/admin/AdminSendNotification";
import AdminFeedback from "./pages/admin/AdminFeedback";
import AdminHaptics from "./pages/admin/AdminHaptics";
import AdminModals from "./pages/admin/AdminModals";
import AdminIngredientsReview from "./pages/admin/AdminIngredientsReview";
import AdminIngredientsCleanup from "./pages/admin/AdminIngredientsCleanup";
import FridgeMode from "./pages/FridgeMode";
import InstagramTwistMode from "./pages/InstagramTwistMode";
import BatchCookingMode from "./pages/BatchCookingMode";
import BatchCookingDetail from "./pages/BatchCookingDetail";
import NotFound from "./pages/NotFound";
import NewRecipePage from "./pages/NewRecipePage";
import RecipeDetailV2 from "./pages/RecipeDetailV2";

const router = createBrowserRouter([
    {
        path: "/",
        errorElement: <NotFound />,
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
                        path: "recipes-v2/:uuid",
                        element: <RecipeDetailV2 />,
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
                                element: <GuidedSandbox />,
                            },
                            {
                                path: "recettes/generer/sandbox-v1",
                                element: <Sandbox />,
                            },
                            {
                                path: "myrecipes",
                                element: <MyRecipes />,
                            },
                            {
                                path: "collections/:uuid",
                                element: null,
                            },
                            {
                                path: "frigo",
                                element: <FridgeMode />,
                            },
                            {
                                path: "instagram/twist",
                                element: <InstagramTwistMode />,
                            },
                            {
                                path: "batch-cooking",
                                element: <BatchCookingMode />,
                            },
                            {
                                path: "batch-cooking/:uuid",
                                element: <BatchCookingDetail />,
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
                            },
                            {
                                path: "admin/feedback",
                                element: <AdminFeedback />
                            },
                            {
                                path: "admin/haptics",
                                element: <AdminHaptics />
                            },
                            {
                                path: "admin/modals",
                                element: <AdminModals />
                            },
                            {
                                path: "admin/ingredients-review",
                                element: <AdminIngredientsReview />
                            },
                            {
                                path: "admin/ingredients-cleanup",
                                element: <AdminIngredientsCleanup />
                            }
                        ],
                    },
                ],
            },
        ],
    },
]);

export default router;
