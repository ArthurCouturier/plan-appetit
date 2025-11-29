import { useState } from "react";
import { SparklesIcon, XMarkIcon } from "@heroicons/react/24/solid";
import BackendService from "../../api/services/BackendService";
import RecipeInterface from "../../api/interfaces/recipes/RecipeInterface";

interface RecipeModificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipe: RecipeInterface;
    onModificationComplete: (modifiedRecipe: RecipeInterface) => void;
    onInsufficientCredits: () => void;
}

export default function RecipeModificationModal({
    isOpen,
    onClose,
    recipe,
    onModificationComplete,
    onInsufficientCredits,
}: RecipeModificationModalProps) {
    const [prompt, setPrompt] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const maxLength = 500;
    const remainingChars = maxLength - prompt.length;

    const handleSubmit = async () => {
        if (!prompt.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);

        try {
            const email = localStorage.getItem("email") as string;
            const token = localStorage.getItem("firebaseIdToken") as string;

            const modifiedRecipe = await BackendService.modifyRecipe(
                email,
                token,
                recipe.uuid as string,
                prompt.trim()
            );

            setPrompt("");
            onModificationComplete(modifiedRecipe);
            onClose();
        } catch (err: any) {
            if (err.type === "INSUFFICIENT_MODIFICATION_CREDITS") {
                onInsufficientCredits();
                onClose();
            } else if (err.type === "FORBIDDEN") {
                setError("Vous n'avez pas la permission de modifier cette recette.");
            } else if (err.type === "NOT_FOUND") {
                setError("La recette n'a pas été trouvée.");
            } else {
                setError("Une erreur est survenue lors de la modification.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-primary rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-cout-base to-cout-purple p-6 rounded-t-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <SparklesIcon className="w-6 h-6 text-cout-yellow" />
                        <div>
                            <h2 className="text-xl font-bold text-white">Assistant recette</h2>
                            <p className="text-white/80 text-sm">Modifiez votre recette avec l'IA</p>
                        </div>
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
                <div className="p-6 space-y-4">
                    {/* Credits info */}
                    <div className="bg-secondary rounded-lg p-4 flex items-center justify-between">
                        <span className="text-text-secondary text-sm">Modifications restantes</span>
                        <span className="text-cout-base font-bold text-lg">
                            {recipe.remainingModifications}
                        </span>
                    </div>

                    {/* Prompt input */}
                    <div>
                        <label className="block text-text-primary font-medium mb-2">
                            Décrivez les modifications souhaitées
                        </label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value.slice(0, maxLength))}
                            placeholder="Ex: Remplace le beurre par de l'huile d'olive, ajoute plus de détails sur la cuisson du poulet, adapte la recette pour 6 personnes..."
                            className="w-full h-32 p-4 bg-secondary border border-border-color rounded-lg text-text-primary placeholder-text-secondary/50 resize-none focus:outline-none focus:ring-2 focus:ring-cout-base focus:border-transparent"
                            disabled={isLoading}
                        />
                        <div className="flex justify-between mt-2">
                            <span className={`text-sm ${remainingChars < 50 ? 'text-red-500' : 'text-text-secondary'}`}>
                                {remainingChars} caractères restants
                            </span>
                        </div>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-500 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Examples */}
                    <div className="bg-secondary/50 rounded-lg p-4">
                        <p className="text-text-secondary text-sm font-medium mb-2">Exemples de modifications :</p>
                        <ul className="text-text-secondary text-sm space-y-1">
                            <li>• "Je n'ai pas de crème fraîche, remplace-la par du lait de coco"</li>
                            <li>• "Ajoute plus de détails sur la cuisson à feu doux"</li>
                            <li>• "Adapte les quantités pour 8 personnes"</li>
                            <li>• "Rends cette recette végétarienne"</li>
                        </ul>
                    </div>

                    {/* Submit button */}
                    <button
                        onClick={handleSubmit}
                        disabled={!prompt.trim() || isLoading}
                        className={`w-full py-4 rounded-lg font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 ${
                            !prompt.trim() || isLoading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-cout-base to-cout-purple hover:shadow-lg hover:scale-[1.02]'
                        }`}
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Modification en cours...</span>
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="w-5 h-5" />
                                <span>Appliquer les modifications</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
