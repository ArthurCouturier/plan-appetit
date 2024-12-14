import { createBrowserRouter } from "react-router-dom";
import Planning from "./pages/Planning";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Planning />,
    },
]);

export default router;
