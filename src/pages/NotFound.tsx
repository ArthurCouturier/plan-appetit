import { useNavigate } from "react-router-dom";
import { HomeIcon } from "@heroicons/react/24/solid";

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen min-h-dvh bg-bg-color flex flex-col items-center justify-center px-6 text-center gap-6">
            <button
                onClick={() => navigate("/")}
            >
                <img src="/logo/actual/logo.svg" alt="Plan Appetit" className="w-30" />
            </button>
            <div>
                <h1 className="text-6xl font-bold text-cout-base">404</h1>
                <p className="text-text-primary font-semibold mt-2 text-lg">Page introuvable</p>
                <p className="text-text-secondary text-sm mt-1">
                    Cette page n'existe pas ou a ete deplacee.
                </p>
            </div>
            <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cout-purple text-white font-semibold shadow-md hover:opacity-90 transition-opacity"
            >
                <HomeIcon className="w-5 h-5" />
                Retourner a l'accueil
            </button>
        </div>
    );
}
