import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SparklesIcon } from "@heroicons/react/24/solid";
import CreditIcon from "../icons/CreditIcon";
import SampleRecipeShowcase from "./SampleRecipeShowcase";
import BackendService from "../../api/services/BackendService";

export default function EmptyCollectionCTA() {
    const navigate = useNavigate();
    const [credits, setCredits] = useState<number | null>(null);

    useEffect(() => {
        const email = localStorage.getItem('email');
        const token = localStorage.getItem('firebaseIdToken');
        if (!email || !token) return;

        BackendService.getAccountInfo(email, token)
            .then((info) => setCredits(info.credits))
            .catch(() => { });
    }, []);

    const showCredits = credits !== null && credits > 0;

    return (
        <div className="flex flex-col items-center text-center px-2">
            <div
                className="w-full md:w-fit rounded-[16px] p-6 flex flex-col items-center gap-4"
                style={{
                    background: 'linear-gradient(145deg, var(--cout-base), var(--cout-purple))',
                }}
            >
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <img src="/icons/IconStars.svg" alt="" className="w-9 h-9" />
                </div>

                <div>
                    <h3 className="text-[20px] font-extrabold text-white leading-[28px] text-sora">
                        Génère ta première recette!
                    </h3>
                    <p className="text-[14px] text-white/80 mt-1 leading-[20px]">
                        Sur mesure en quelques secondes seulement.
                    </p>
                </div>

                {showCredits && (
                    <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1">
                        <CreditIcon className="w-4 h-4 text-cout-yellow" />
                        <span className="text-[13px] font-bold text-white">
                            {credits} credit{credits > 1 ? 's' : ''} offert{credits > 1 ? 's' : ''}
                        </span>
                    </div>
                )}

                <button
                    onClick={() => navigate("/recettes/nouvelle")}
                    className="w-full max-w-[240px] py-3 bg-white rounded-[12px] font-bold text-[16px] text-cout-purple flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200 shadow-lg"
                >
                    <SparklesIcon className="w-5 h-5" />
                    Ma première recette
                </button>

                <SampleRecipeShowcase />
            </div>
        </div>
    );
}
