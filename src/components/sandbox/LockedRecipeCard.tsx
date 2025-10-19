import { ClockIcon, UserGroupIcon, SparklesIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { SandboxRecipe } from "../../api/interfaces/sandbox/SandboxRecipe";
import { useNavigate } from "react-router-dom";

interface LockedRecipeCardProps {
  recipe: SandboxRecipe;
}

export default function LockedRecipeCard({ recipe }: LockedRecipeCardProps) {
  const navigate = useNavigate();

  const getDietBadgeColor = (diet: string) => {
    const dietLower = diet.toLowerCase();
    if (dietLower.includes('vegan') || dietLower.includes('végétalien')) return 'bg-green-500';
    if (dietLower.includes('végétarien')) return 'bg-lime-500';
    if (dietLower.includes('sans gluten')) return 'bg-amber-500';
    if (dietLower.includes('sans lactose')) return 'bg-blue-500';
    return 'bg-cout-base';
  };

  const visibleSteps = recipe.steps.slice(0, 2);
  const lockedSteps = recipe.steps.slice(2);

  return (
    <div className="bg-primary rounded-xl border-2 border-border-color hover:border-cout-base hover:shadow-xl transition-all duration-300 overflow-hidden group">
      {/* Header */}
      <div className="p-6 border-b border-border-color">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-bold text-text-primary group-hover:text-cout-base transition-colors">
            {recipe.title}
          </h3>
          <div className={`${getDietBadgeColor(recipe.diet)} px-3 py-1 rounded-full text-white text-xs font-semibold whitespace-nowrap`}>
            {recipe.diet}
          </div>
        </div>

        {/* Meta info */}
        <div className="flex items-center gap-4 mt-4 text-text-secondary text-sm">
          <div className="flex items-center gap-1">
            <ClockIcon className="w-4 h-4" />
            <span>{recipe.timeMinutes} min</span>
          </div>
          <div className="flex items-center gap-1">
            <UserGroupIcon className="w-4 h-4" />
            <span>{recipe.servings} pers.</span>
          </div>
        </div>
      </div>

      {/* Ingredients (visible) */}
      <div className="p-6 border-b border-border-color bg-secondary/50">
        <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
          <SparklesIcon className="w-4 h-4 text-cout-base" />
          Ingrédients
        </h4>
        <ul className="space-y-2">
          {recipe.ingredients.map((ingredient, index) => (
            <li key={index} className="text-sm text-text-secondary flex items-start gap-2">
              <span className="text-cout-base mt-1">•</span>
              <span className="flex-1">{ingredient}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Steps - Visible (2 first) */}
      <div className="p-6">
        <h4 className="text-sm font-semibold text-text-primary mb-3">Préparation</h4>
        <ol className="space-y-3">
          {visibleSteps.map((step, index) => (
            <li key={index} className="text-sm text-text-secondary flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cout-base/10 text-cout-base flex items-center justify-center font-semibold text-xs">
                {index + 1}
              </span>
              <span className="flex-1 pt-0.5">{step}</span>
            </li>
          ))}
        </ol>

        {/* Locked Steps with blur effect */}
        {lockedSteps.length > 0 && (
          <div className="relative mt-3">
            {/* Blurred content */}
            <ol className="space-y-3 blur-sm select-none pointer-events-none">
              {lockedSteps.map((step, index) => (
                <li key={index} className="text-sm text-text-secondary flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cout-base/10 text-cout-base flex items-center justify-center font-semibold text-xs">
                    {visibleSteps.length + index + 1}
                  </span>
                  <span className="flex-1 pt-0.5">{step}</span>
                </li>
              ))}
            </ol>

            {/* Lock overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-primary via-primary/90 to-transparent">
              <div className="bg-primary/95 backdrop-blur-sm px-6 py-4 rounded-xl border-2 border-cout-base/30 shadow-xl text-center max-w-sm">
                <LockClosedIcon className="w-10 h-10 text-cout-base mx-auto mb-3" />
                <h5 className="text-base font-bold text-text-primary mb-2">
                  Recette complète verrouillée
                </h5>
                <p className="text-sm text-text-secondary mb-4">
                  Inscrivez-vous gratuitement pour accéder à la recette complète et générer 3 autres recettes !
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-2 bg-cout-base text-white font-semibold rounded-lg hover:bg-indigo-500 transition-all duration-300 shadow-lg"
                >
                  S'inscrire gratuitement
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
