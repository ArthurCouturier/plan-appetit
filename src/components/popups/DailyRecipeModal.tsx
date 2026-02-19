import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";
import DailyRecipeService, { DailyRecipeDTO } from "../../api/services/DailyRecipeService";

interface DailyRecipeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function DailyRecipeModal({ isOpen, onClose }: DailyRecipeModalProps) {
    const navigate = useNavigate();
    const [data, setData] = useState<DailyRecipeDTO | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        setLoading(true);
        setError(false);

        DailyRecipeService.getDailyRecipes()
            .then((result) => {
                setData(result);
                if (!result) setError(true);
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, [isOpen]);

    const handleRecipeClick = (uuid: string) => {
        onClose();
        navigate(`/recettes/${uuid}?share`);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Recettes du jour" size="lg">
            {loading && (
                <div className="flex justify-center items-center py-12">
                    <div className="w-8 h-8 border-4 border-border-color border-t-cout-purple rounded-full animate-spin" />
                </div>
            )}

            {error && !loading && (
                <p className="text-center text-text-secondary py-8">
                    Aucune recette du jour disponible pour le moment.
                </p>
            )}

            {data && !loading && (
                <div className="flex flex-col gap-4">
                    <RecipeChoice
                        label="Recette simple"
                        name={data.quickRecipe.name}
                        imageData={data.quickRecipe.imageData}
                        onClick={() => handleRecipeClick(data.quickRecipe.uuid)}
                    />
                    <RecipeChoice
                        label="Recette experte"
                        name={data.expertRecipe.name}
                        imageData={data.expertRecipe.imageData}
                        onClick={() => handleRecipeClick(data.expertRecipe.uuid)}
                    />
                </div>
            )}
        </Modal>
    );
}

function RecipeChoice({
    label,
    name,
    imageData,
    onClick,
}: {
    label: string;
    name: string;
    imageData: string | null;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-4 w-full p-3 rounded-xl border border-border-color bg-secondary hover:bg-tertiary transition-all duration-200 hover:shadow-md active:scale-[0.98] text-left"
        >
            <div className="w-20 h-20 min-w-[5rem] rounded-lg overflow-hidden bg-border-color">
                {imageData ? (
                    <img
                        src={`data:image/png;base64,${imageData}`}
                        alt={name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                        🍽️
                    </div>
                )}
            </div>
            <div className="flex flex-col gap-1 min-w-0">
                <span className="text-xs font-semibold text-cout-purple uppercase tracking-wide">
                    {label}
                </span>
                <span className="text-base font-medium text-text-primary truncate">
                    {name}
                </span>
            </div>
        </button>
    );
}
