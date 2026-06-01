import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CameraIcon, SparklesIcon, ArrowPathIcon, ExclamationTriangleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import CreditPaywallModal from "../components/modals/CreditPaywallModal";
import RecipeGenerationLoadingModal from "../components/modals/RecipeGenerationLoadingModal";
import PhotoImportService from "../api/services/PhotoImportService";
import CameraPickerService, { CameraPickerError } from "../api/services/CameraPickerService";
import { TrackingService } from "../api/tracking/TrackingService";
import { SKAdNetworkService } from "../api/tracking/skadnetwork/SKAdNetworkService";
import { SKAdNetworkConversionValue } from "../api/tracking/skadnetwork/SKAdNetworkConversionValue";
import SandboxService from "../api/services/SandboxService";
import useAuth from "../api/hooks/useAuth";
import { useInvalidateCollections } from "../api/hooks/useCollectionMutations";
import { QuotaInfo } from "../api/interfaces/sandbox/QuotaInfo";

const PROMPT_HEADER = "Photo de la recette";

/**
 * Page « Import Photo ». L'utilisateur prend (ou choisit) une photo d'un plat ou d'une
 * recette ; l'image est analysée pour reproduire la recette. Deux issues, comme l'import
 * Instagram : « Récupérer la recette exacte » ou « Remasteriser » (flow de questions dédié).
 */
export default function PhotoImport() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const invalidateCollections = useInvalidateCollections();

    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [quotaInfo, setQuotaInfo] = useState<QuotaInfo | null>(null);
    const [showPaywall, setShowPaywall] = useState(false);

    useEffect(() => {
        if (user) {
            SandboxService.getQuotaStatus().then(setQuotaInfo).catch(() => { });
        }
    }, [user]);

    const handlePickPhoto = async () => {
        setError(null);
        try {
            const base64 = await CameraPickerService.captureAndCompress({ promptHeader: PROMPT_HEADER });
            setImageBase64(base64);
        } catch (e) {
            if (e instanceof CameraPickerError) {
                // Annulation utilisateur → silencieux.
                if (e.code === "invalid_image" && (e.message === "Action annulée." || /cancel/i.test(e.message))) {
                    return;
                }
                setError(e.message);
                return;
            }
            setError("Impossible de récupérer la photo.");
        }
    };

    const hasNoCredits = !!quotaInfo && !quotaInfo.isSubscriber && quotaInfo.remainingFree <= 0;

    const handleGenerateRecipe = async () => {
        if (!user) { navigate("/login"); return; }
        if (!imageBase64) return;
        if (hasNoCredits) { setShowPaywall(true); return; }

        const token = user.token || localStorage.getItem("firebaseIdToken");
        if (!token) { setError("Vous devez être connecté pour générer une recette"); return; }

        setIsGenerating(true);
        setError(null);
        TrackingService.logRecipeGenerationInitiated("photo");

        try {
            const response = await PhotoImportService.generateRecipeFromPhoto(imageBase64, user.email, token);
            SandboxService.getQuotaStatus().then(setQuotaInfo).catch(() => { });

            if (response.recipe?.uuid) {
                TrackingService.logRecipeGenerated("photo");
                SKAdNetworkService.updateConversionValue(SKAdNetworkConversionValue.ONE_RECIPE_GENERATED);
                invalidateCollections();
                navigate(`/recipes-v2/${response.recipe.uuid}`);
            } else {
                setError("Recette générée mais impossible de récupérer son identifiant");
            }
        } catch (err: any) {
            if (err.type === "QUOTA_EXCEEDED" || err.status === 402) {
                SKAdNetworkService.updateConversionValue(SKAdNetworkConversionValue.QUOTA_REACHED);
                setShowPaywall(true);
                SandboxService.getQuotaStatus().then(setQuotaInfo).catch(() => { });
            } else {
                setError(err.message || "Erreur lors de la génération de la recette");
            }
        } finally {
            setIsGenerating(false);
        }
    };

    /**
     * « Remasteriser » : navigue vers /photo-import/twist qui héberge le flow turn-by-turn.
     * On passe l'image via location.state pour éviter de re-déclencher le picker.
     */
    const handleStartTwist = () => {
        if (!user) { navigate("/login"); return; }
        if (!imageBase64) return;
        if (hasNoCredits) { setShowPaywall(true); return; }
        navigate("/photo-import/twist", { state: { imageBase64 } });
    };

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-cout-purple via-cout-base to-cout-purple">
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
                <div className="absolute top-20 left-10 w-64 h-64 bg-cout-yellow rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-10 right-20 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
            </div>

            <div className="flex-grow relative z-10 flex flex-col pb-16" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 48px)" }}>
                <div className="max-w-2xl mx-auto px-4 w-full flex flex-col flex-grow min-h-0">

                    {/* Title */}
                    <div className="text-center mb-10 shrink-0">
                        <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 leading-tight">
                            Import Photo
                        </h1>
                        <p className="text-base md:text-lg text-white/80 max-w-md mx-auto">
                            Prends une photo d'un plat ou d'une recette: on l'analyse pour reproduire la recette.
                        </p>
                        {user && quotaInfo && !quotaInfo.isSubscriber && (
                            <p className="text-sm text-cout-yellow font-semibold mt-2">
                                {quotaInfo.remainingFree} credit{quotaInfo.remainingFree > 1 ? "s" : ""} restant{quotaInfo.remainingFree > 1 ? "s" : ""}
                            </p>
                        )}
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-4 flex items-start gap-3 mb-6">
                            <ExclamationTriangleIcon className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
                            <p className="text-red-200 text-sm flex-1">{error}</p>
                            <button onClick={() => setError(null)} className="text-red-300 hover:text-white">
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Zone scrollable : centre le carré quand il y a la place,
                        bascule en haut + scroll quand le contenu déborde (my-auto). */}
                    <div className="flex-grow min-h-0 overflow-y-auto flex flex-col">
                      <div className="my-auto w-full py-2">

                    {/* Étape 1 : gros bouton photo centré */}
                    {!imageBase64 && (
                        <div className="flex justify-center">
                            <button
                                onClick={handlePickPhoto}
                                className="group flex flex-col items-center justify-center gap-4 w-56 h-56 md:w-64 md:h-64 rounded-3xl bg-cout-yellow text-cout-purple font-bold shadow-2xl hover:bg-yellow-400 transform hover:scale-105 transition-all duration-300"
                                aria-label="Prendre ou choisir une photo"
                            >
                                <CameraIcon className="w-20 h-20 md:w-24 md:h-24" />
                                <span className="text-lg">Prendre une photo</span>
                            </button>
                        </div>
                    )}

                    {/* Étape 2 : photo affichée + actions */}
                    {imageBase64 && (
                        <div className="space-y-6">
                            <div className="flex justify-center">
                                <button
                                    onClick={handlePickPhoto}
                                    disabled={isGenerating}
                                    className="relative w-56 h-56 md:w-64 md:h-64 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 disabled:opacity-60 group"
                                    aria-label="Changer la photo"
                                >
                                    <img
                                        src={`data:image/jpeg;base64,${imageBase64}`}
                                        alt="Photo à analyser"
                                        draggable={false}
                                        className="w-full h-full object-cover select-none"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <span className="flex items-center gap-2 text-white font-semibold text-sm">
                                            <CameraIcon className="w-5 h-5" /> Changer
                                        </span>
                                    </div>
                                </button>
                            </div>

                            {/* Action buttons : récupérer fidèlement OU remasteriser à sa sauce */}
                            <div className="space-y-3">
                                <button
                                    onClick={handleGenerateRecipe}
                                    disabled={isGenerating}
                                    className="w-full px-6 py-4 bg-cout-yellow text-cout-purple font-bold rounded-xl shadow-lg hover:bg-yellow-400 transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                                >
                                    {isGenerating ? (
                                        <><ArrowPathIcon className="w-6 h-6 animate-spin" /> Démarrage...</>
                                    ) : (
                                        <><SparklesIcon className="w-6 h-6" />Récupérer la recette exacte</>
                                    )}
                                </button>
                                <button
                                    onClick={handleStartTwist}
                                    disabled={isGenerating}
                                    className="w-full px-6 py-3 bg-transparent text-white font-semibold rounded-xl border-2 border-white/40 hover:border-white/80 hover:bg-white/5 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <SparklesIcon className="w-5 h-5" />Remasteriser cette recette
                                </button>
                            </div>
                        </div>
                    )}
                      </div>
                    </div>
                </div>
            </div>

            <RecipeGenerationLoadingModal isOpen={isGenerating} progress={null} />

            {showPaywall && <CreditPaywallModal onClose={() => setShowPaywall(false)} />}
        </div>
    );
}
