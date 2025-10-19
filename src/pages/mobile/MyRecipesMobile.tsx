import { useEffect, useState } from "react";
import RecipeInterface from "../../api/interfaces/recipes/RecipeInterface";
import RecipeCard from "../../components/cards/RecipeCard";
import { useRecipeContext } from "../../contexts/RecipeContext";
import { SparklesIcon, PlusIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";
import RecipeService from "../../api/services/RecipeService";
import SandboxService from "../../api/services/SandboxService";
import useAuth from "../../api/hooks/useAuth";
import CreditPaywallModal from "../../components/popups/CreditPaywallModal";
import RecipeGenerationChoiceModal from "../../components/popups/RecipeGenerationChoiceModal";

export default function MyRecipesMobile({
  isMobile
}: {
  isMobile: boolean;
}) {

  const { recipes, setRecipes } = useRecipeContext();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showPaywall, setShowPaywall] = useState(false);
  const [showGenerationChoice, setShowGenerationChoice] = useState(false);
  const [linkingRecipe, setLinkingRecipe] = useState(false);

  // Fetch des recettes au chargement de la page
  useEffect(() => {
    const fetchRecipes = async () => {
      if (!user) return;

      try {
        const fetchedRecipes = await RecipeService.fetchRecipesRemotly();
        setRecipes(fetchedRecipes);
      } catch (err) {
        console.error('Erreur lors du fetch des recettes:', err);
      }
    };

    fetchRecipes();
  }, [user, setRecipes]);

  // Vérifier et lier une recette anonyme au chargement de la page
  useEffect(() => {
    const linkAnonymousRecipeIfExists = async () => {
      if (!user) return;

      const anonymousRecipeUuid = localStorage.getItem('anonymousRecipeUuid');
      if (!anonymousRecipeUuid) return;

      setLinkingRecipe(true);

      try {
        const result = await SandboxService.linkAnonymousRecipe(anonymousRecipeUuid);

        if (result.success) {
          localStorage.removeItem('anonymousRecipeUuid');
          console.log('✅ Recette liée avec succès sur MyRecipes');

          // Récupérer toutes les recettes après liaison
          const updatedRecipes = await RecipeService.fetchRecipesRemotly();
          setRecipes(updatedRecipes);
        } else if (result.error === 'INSUFFICIENT_CREDITS') {
          console.warn('⚠️ Quota insuffisant pour lier la recette');
          setShowPaywall(true);
        } else if (result.alreadyLinked) {
          localStorage.removeItem('anonymousRecipeUuid');
          console.log('ℹ️ Recette déjà liée');
        }
      } catch (err) {
        console.error('Erreur lors de la liaison de la recette:', err);
      } finally {
        setLinkingRecipe(false);
      }
    };

    linkAnonymousRecipeIfExists();
  }, [user, setRecipes]);

  const handleCreateRecipe = async () => {
    try {
      await RecipeService.addEmptyRecipe();
      const newRecipes = await RecipeService.fetchRecipesRemotly();
      setRecipes(newRecipes);
      navigate(`/recettes/${newRecipes[newRecipes.length - 1].uuid}`);
    } catch (err) {
      console.error(err);
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-bg-color p-4 pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Mes Recettes</h1>
        <p className="text-text-secondary text-sm">
          {linkingRecipe ? (
            <span className="text-cout-base animate-pulse">Liaison de votre recette en cours...</span>
          ) : recipes.length > 0 ? (
            `${recipes.length} recette${recipes.length > 1 ? 's' : ''} dans votre livre`
          ) : (
            "Votre livre de recettes est vide"
          )}
        </p>
      </div>

      {/* Recipes list or empty state */}
      {recipes.length > 0 ? (
        <>
          <div className="space-y-3 mb-6">
            {recipes.map((recipe: RecipeInterface, index: number) => (
              <RecipeCard
                key={index}
                recipe={recipe}
                isMobile={isMobile}
              />
            ))}
          </div>

          {/* Create button */}
          <button
            onClick={handleCreateRecipe}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-secondary border-2 border-cout-base text-text-primary font-semibold rounded-xl hover:bg-cout-purple/10 active:scale-95 transition-all duration-200"
          >
            <PlusIcon className="w-5 h-5 text-cout-base" />
            Créer une recette
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <div className="w-24 h-24 bg-cout-purple/10 rounded-full flex items-center justify-center mb-4">
            <SparklesIcon className="w-12 h-12 text-cout-base" />
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2 text-center">
            Aucune recette pour le moment
          </h3>
          <p className="text-text-secondary text-center mb-6 max-w-sm">
            Commencez à créer votre bibliothèque de recettes en générant votre première recette avec l'IA !
          </p>
          <button
            onClick={() => setShowGenerationChoice(true)}
            className="flex items-center gap-2 px-6 py-3 bg-cout-yellow text-cout-purple font-bold rounded-xl shadow-lg hover:bg-yellow-400 active:scale-95 transition-all duration-200"
          >
            <SparklesIcon className="w-5 h-5" />
            Générer une recette
          </button>
        </div>
      )}

      {/* Generation Choice Modal */}
      <RecipeGenerationChoiceModal
        isOpen={showGenerationChoice}
        onClose={() => setShowGenerationChoice(false)}
      />

      {/* Paywall Modal */}
      <CreditPaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
      />
    </div>
  )
}