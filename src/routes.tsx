import { createBrowserRouter } from "react-router-dom";
import Planning from "./pages/Planning";
import Home from "./pages/Home";
import Recipes from "./pages/Recipes";

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
]);

export default router;
