import { useNavigate } from "react-router-dom";
import RecipeInterface from "../../api/interfaces/recipes/RecipeInterface";
import RecipeSummaryInterface from "../../api/interfaces/recipes/RecipeSummaryInterface";
import { useRecipeImage } from "../../api/hooks/useRecipeImage";

type RecipeCardProps = {
    recipe: RecipeInterface | RecipeSummaryInterface;
};

export default function RecipeCard({ recipe }: RecipeCardProps) {
    const navigate = useNavigate();
    const { data: imageData, isLoading } = useRecipeImage(String(recipe.uuid));

    return (
        <button
            onClick={() => navigate(`/recettes/${recipe.uuid}`)}
            className="bg-primary border border-border-color rounded-xl shadow-[0px_4px_6px_rgba(0,0,0,0.1),0px_2px_4px_rgba(0,0,0,0.1)] w-full flex flex-col pt-px px-0.5 hover:border-cout-base transition-all duration-200 active:scale-[0.98]"
        >
            <div className="h-9 flex items-center justify-center overflow-hidden px-1">
                <span className="text-sora text-xs leading-5 text-text-primary text-center line-clamp-1">
                    {recipe.name}
                </span>
            </div>

            <div className="px-[5px] pb-[5px]">
                <div className="w-full aspect-square rounded-tl-[3px] rounded-tr-[3px] rounded-bl-[9px] rounded-br-[9px] overflow-hidden">
                    {isLoading ? (
                        <div className="w-full h-full bg-gradient-to-r from-border-color via-secondary to-border-color animate-shimmer bg-[length:200%_100%]" />
                    ) : imageData ? (
                        <img
                            src={`data:image/png;base64,${imageData}`}
                            alt={recipe.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-border-color flex items-center justify-center">
                            <span className="text-2xl">🍽️</span>
                        </div>
                    )}
                </div>
            </div>
        </button>
    );
}
