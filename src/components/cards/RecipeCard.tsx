import { useNavigate } from "react-router-dom";
import RecipeInterface from "../../api/interfaces/recipes/RecipeInterface";
import { ChevronRightIcon, UserGroupIcon, CurrencyEuroIcon, ClockIcon } from "@heroicons/react/24/solid";

export default function RecipeCard({
    recipe,
    isMobile
}: {
    recipe: RecipeInterface;
    isMobile?: boolean;
}) {

    return (
        isMobile ? <RecipeCardMobile recipe={recipe} /> : <RecipeCardDesktop recipe={recipe} />
    );
}

function RecipeCardMobile({
    recipe
}: {
    recipe: RecipeInterface
}) {

    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate(`/recettes/${recipe.uuid}`)}
            className="w-full bg-primary rounded-xl shadow-md border border-border-color p-4 hover:shadow-lg hover:border-cout-base transition-all duration-200 active:scale-[0.98]"
        >
            <div className="flex items-center justify-between">
                <div className="flex-1 text-left">
                    <h3 className="text-lg font-bold text-text-primary mb-2 line-clamp-1">
                        {recipe.name}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
                        <div className="flex items-center gap-1">
                            <UserGroupIcon className="w-4 h-4 text-cout-base" />
                            <span>{recipe.covers} pers</span>
                        </div>

                        <div className="flex items-center gap-1">
                            <ClockIcon className="w-4 h-4 text-cout-base" />
                            <span>{recipe.steps.length} étape{recipe.steps.length > 1 ? 's' : ''}</span>
                        </div>

                        {recipe.buyPrice > 0 &&
                            <div className="flex items-center gap-1">
                                <CurrencyEuroIcon className="w-4 h-4 text-cout-yellow" />
                                <span>{recipe.buyPrice.toFixed(2)}€/pers</span>
                            </div>
                        }

                    </div>
                </div>

                <ChevronRightIcon className="w-6 h-6 text-cout-base flex-shrink-0 ml-2" />
            </div>
        </button>
    )
}

function RecipeCardDesktop({
    recipe
}: {
    recipe: RecipeInterface
}) {

    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate(`/recettes/${recipe.uuid}`)}
            className="group bg-gradient-to-br from-primary to-secondary rounded-xl shadow-lg border-2 border-border-color hover:border-cout-base p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 text-left h-full flex flex-col"
        >
            {/* Header avec badge */}
            <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-text-primary group-hover:text-cout-base transition-colors line-clamp-2 flex-1">
                    {recipe.name}
                </h3>
                <div className="ml-2 px-2 py-1 bg-cout-purple/20 rounded-lg flex-shrink-0">
                    <span className="text-xs font-bold text-cout-base">{recipe.steps.length}</span>
                </div>
            </div>

            {/* Info section */}
            <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2 text-text-secondary">
                    <UserGroupIcon className="w-5 h-5 text-cout-base" />
                    <span className="text-sm font-medium">{recipe.covers} personne{recipe.covers > 1 ? 's' : ''}</span>
                </div>

                <div className="flex items-center gap-2 text-text-secondary">
                    <ClockIcon className="w-5 h-5 text-cout-base" />
                    <span className="text-sm font-medium">{recipe.steps.length} étape{recipe.steps.length > 1 ? 's' : ''}</span>
                </div>

                <div className="flex items-center gap-2 text-text-secondary">
                    <CurrencyEuroIcon className="w-5 h-5 text-cout-yellow" />
                    <span className="text-sm font-medium">{recipe.buyPrice.toFixed(2)}€ par personne</span>
                </div>
            </div>

            {/* Footer badge */}
            <div className="mt-4 pt-4 border-t border-border-color">
                <div className="flex items-center justify-center gap-2 px-3 py-2 bg-cout-yellow/20 rounded-lg">
                    <CurrencyEuroIcon className="w-4 h-4 text-cout-base" />
                    <span className="text-sm font-bold text-cout-base">
                        {(recipe.buyPrice * recipe.covers).toFixed(2)}€ total
                    </span>
                </div>
            </div>
        </button>
    )
}
