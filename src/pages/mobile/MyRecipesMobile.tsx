import { useEffect, useState, useMemo } from "react";
import RecipeCollectionInterface from "../../api/interfaces/collections/RecipeCollectionInterface";
import CollectionCard from "../../components/cards/CollectionCard";
import { SparklesIcon, FolderIcon } from "@heroicons/react/24/solid";
import CollectionService from "../../api/services/CollectionService";
import SandboxService from "../../api/services/SandboxService";
import useAuth from "../../api/hooks/useAuth";
import CreditPaywallModal from "../../components/popups/CreditPaywallModal";
import RecipeGenerationChoiceModal from "../../components/popups/RecipeGenerationChoiceModal";
import OnboardingChecklist from "../../components/onboarding/OnboardingChecklist";

export default function MyRecipesMobile({
  isMobile
}: {
  isMobile: boolean;
}) {

  const { user } = useAuth();
  const [showPaywall, setShowPaywall] = useState(false);
  const [showGenerationChoice, setShowGenerationChoice] = useState(false);
  const [linkingRecipe, setLinkingRecipe] = useState(false);
  const [collections, setCollections] = useState<RecipeCollectionInterface[]>([]);
  const [loadingCollections, setLoadingCollections] = useState(true);

  const totalRecipesCount = useMemo(() => {
    const countRecipes = (cols: RecipeCollectionInterface[]): number => {
      return cols.reduce((total, col) => {
        const recipesInCol = col.recipes?.length ?? 0;
        const recipesInSubCols = col.subCollections ? countRecipes(col.subCollections) : 0;
        return total + recipesInCol + recipesInSubCols;
      }, 0);
    };
    return countRecipes(collections);
  }, [collections]);

  useEffect(() => {
    const fetchCollections = async () => {
      if (!user) return;

      try {
        setLoadingCollections(true);
        const fetchedCollections = await CollectionService.getRootCollections();
        setCollections(fetchedCollections);
      } catch (err) {
        console.error('Erreur lors du fetch des collections:', err);
      } finally {
        setLoadingCollections(false);
      }
    };

    fetchCollections();
  }, [user]);

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
          const fetchedCollections = await CollectionService.getRootCollections();
          setCollections(fetchedCollections);
        } else if (result.error === 'INSUFFICIENT_CREDITS') {
          setShowPaywall(true);
        } else if (result.alreadyLinked) {
          localStorage.removeItem('anonymousRecipeUuid');
        }
      } catch (err) {
        console.error('Erreur lors de la liaison de la recette:', err);
      } finally {
        setLinkingRecipe(false);
      }
    };

    linkAnonymousRecipeIfExists();
  }, [user]);

  return (
    <div className="min-h-screen bg-bg-color px-4 pt-20 pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Mes Collections</h1>
        <p className="text-text-secondary text-sm">
          {linkingRecipe ? (
            <span className="text-cout-base animate-pulse">Liaison de votre recette en cours...</span>
          ) : loadingCollections ? (
            "Chargement..."
          ) : totalRecipesCount > 0 ? (
            `${totalRecipesCount} recette${totalRecipesCount > 1 ? 's' : ''} dans vos collections`
          ) : (
            "Votre bibliothèque est vide"
          )}
        </p>
      </div>

      {/* Onboarding Checklist */}
      <OnboardingChecklist isMobile={isMobile} />

      {/* Collections list or empty state */}
      {loadingCollections ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="bg-primary rounded-xl shadow-md border border-border-color p-4 animate-pulse"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 bg-border-color rounded" />
                <div className="h-5 bg-border-color rounded w-3/4" />
              </div>
              <div className="h-4 bg-border-color rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : collections.length > 0 ? (
        <div className="space-y-3">
          {collections.map((collection: RecipeCollectionInterface) => (
            <CollectionCard
              key={collection.uuid}
              collection={collection}
              isMobile={true}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <div className="w-24 h-24 bg-cout-purple/10 rounded-full flex items-center justify-center mb-4">
            <FolderIcon className="w-12 h-12 text-cout-base" />
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2 text-center">
            Aucune collection pour le moment
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
