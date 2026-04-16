import { useState } from "react";
import { XMarkIcon, SparklesIcon, CreditCardIcon } from "@heroicons/react/24/solid";
import BackendService from "../../api/services/BackendService";
import RecipeInterface from "../../api/interfaces/recipes/RecipeInterface";

interface PurchaseModificationCreditsModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipe: RecipeInterface;
    userCredits: number;
    onPurchaseComplete: (updatedRecipe: RecipeInterface) => void;
    onInsufficientCredits: () => void;
}

export default function PurchaseModificationCreditsModal({
    isOpen,
    onClose,
    recipe,
    userCredits,
    onPurchaseComplete,
    onInsufficientCredits,
}: PurchaseModificationCreditsModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePurchase = async () => {
        if (isLoading) return;

        setIsLoading(true);
        setError(null);

        try {
            const email = localStorage.getItem("email") as string;
            const token = localStorage.getItem("firebaseIdToken") as string;

            const updatedRecipe = await BackendService.purchaseModificationCredits(
                email,
                token,
                recipe.uuid as string
            );

            onPurchaseComplete(updatedRecipe);
            onClose();
        } catch (err: any) {
            if (err.type === "INSUFFICIENT_CREDITS") {
                onInsufficientCredits();
                onClose();
            } else {
                setError("Une erreur est survenue lors de l'achat.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const hasEnoughCredits = userCredits > 0;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-primary rounded-2xl shadow-2xl max-w-md w-full">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-cout-base to-cout-purple p-6 rounded-t-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <CreditCardIcon className="w-6 h-6 text-cout-yellow" />
                        <h2 className="text-xl font-bold text-white">Crédits de modification épuisés</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        disabled={isLoading}
                    >
                        <XMarkIcon className="w-6 h-6 text-white" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <p className="text-text-secondary text-center">
                        Vous avez utilisé toutes vos modifications gratuites pour cette recette.
                    </p>

                    {/* Exchange card */}
                    <div className="bg-secondary border-2 border-border-color rounded-xl p-6">
                        <div className="flex items-center justify-center gap-4 mb-4">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-cout-base">1</div>
                                <div className="text-sm text-text-secondary">crédit recette</div>
                            </div>
                            <div className="text-2xl text-text-secondary">=</div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-cout-purple">3</div>
                                <div className="text-sm text-text-secondary">modifications</div>
                            </div>
                        </div>

                        <div className="bg-primary rounded-lg p-3 flex items-center justify-between mb-4">
                            <span className="text-text-secondary text-sm">Vos crédits recette</span>
                            <span className={`font-bold text-lg ${hasEnoughCredits ? 'text-cout-base' : 'text-red-500'}`}>
                                {userCredits}
                            </span>
                        </div>

                        {hasEnoughCredits ? (
                            <div className="space-y-3">
                                <div className="flex items-start gap-2 text-sm text-text-secondary">
                                    <SparklesIcon className="w-5 h-5 text-cout-yellow flex-shrink-0 mt-0.5" />
                                    <span>
                                        Échangez 1 crédit pour obtenir 3 modifications supplémentaires pour cette recette.
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-500 text-sm text-center">
                                Vous n'avez pas assez de crédits. Achetez des crédits pour continuer.
                            </div>
                        )}
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-500 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="space-y-3">
                        {hasEnoughCredits ? (
                            <button
                                onClick={handlePurchase}
                                disabled={isLoading}
                                className={`w-full py-4 rounded-lg font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 ${
                                    isLoading
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-cout-base to-cout-purple hover:shadow-lg hover:scale-[1.02]'
                                }`}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Échange en cours...</span>
                                    </>
                                ) : (
                                    <>
                                        <SparklesIcon className="w-5 h-5" />
                                        <span>Échanger 1 crédit pour 3 modifications</span>
                                    </>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={onInsufficientCredits}
                                className="w-full py-4 rounded-lg font-bold text-white bg-gradient-to-r from-cout-base to-cout-purple hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                            >
                                Acheter des crédits
                            </button>
                        )}

                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="w-full py-3 rounded-lg font-medium text-text-secondary hover:bg-secondary transition-colors"
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
