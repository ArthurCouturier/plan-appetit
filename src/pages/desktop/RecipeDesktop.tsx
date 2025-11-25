import { useEffect, useState, useMemo } from "react";
import RecipeCollectionInterface from "../../api/interfaces/collections/RecipeCollectionInterface";
import CollectionCard from "../../components/cards/CollectionCard";
import Header from "../../components/global/Header";
import QuickActions from "../../components/actions/QuickActions";
import { SparklesIcon, FolderIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";
import CollectionService from "../../api/services/CollectionService";
import SandboxService from "../../api/services/SandboxService";
import useAuth from "../../api/hooks/useAuth";
import CreditPaywallModal from "../../components/popups/CreditPaywallModal";

export default function RecipeDesktop() {

  const { user } = useAuth();
  const navigate = useNavigate();
  const [showPaywall, setShowPaywall] = useState(false);
  const [linkingRecipe, setLinkingRecipe] = useState(false);
  const [collections, setCollections] = useState<RecipeCollectionInterface[]>([]);
  const [loadingCollections, setLoadingCollections] = useState(true);

  // Compute total recipes count from all collections recursively
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

  // Fetch des collections de niveau 0 (avec toutes les données récursives)
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
          console.log('Recette liée avec succès');

          // Rafraîchir les collections après liaison
          const fetchedCollections = await CollectionService.getRootCollections();
          setCollections(fetchedCollections);
        } else if (result.error === 'INSUFFICIENT_CREDITS') {
          console.warn('Quota insuffisant pour lier la recette');
          setShowPaywall(true);
        } else if (result.alreadyLinked) {
          localStorage.removeItem('anonymousRecipeUuid');
          console.log('Recette déjà liée');
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
    <div className="min-h-screen bg-bg-color p-6">
      <RecipesHeader />

      <div className="mt-6">
        {/* Header section */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-text-primary mb-2">Ma Bibliothèque</h2>
            <p className="text-text-secondary">
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
        </div>

        {/* Action buttons */}
        <QuickActions
          onCollectionCreated={async () => {
            const fetchedCollections = await CollectionService.getRootCollections();
            setCollections(fetchedCollections);
          }}
        />

        {/* Collections section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <FolderIcon className="w-6 h-6 text-cout-base" />
            <h3 className="text-xl font-bold text-text-primary">Mes Collections</h3>
            <span className="text-text-secondary text-sm">
              ({loadingCollections ? '...' : collections.length})
            </span>
          </div>

          {loadingCollections ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="bg-primary rounded-xl shadow-lg border-2 border-border-color p-6 animate-pulse"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 bg-border-color rounded" />
                    <div className="h-6 bg-border-color rounded w-3/4" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-border-color rounded w-1/2" />
                    <div className="h-4 bg-border-color rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : collections.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {collections.map((collection: RecipeCollectionInterface) => (
                <CollectionCard key={collection.uuid} collection={collection} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-32 h-32 bg-gradient-to-br from-cout-base to-cout-purple rounded-full flex items-center justify-center mb-6 shadow-lg">
                <SparklesIcon className="w-16 h-16 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-3 text-center">
                Votre bibliothèque vous attend
              </h3>
              <p className="text-text-secondary text-center mb-8 max-w-md text-lg">
                Commencez à construire votre collection de recettes personnalisées.
                Utilisez l'IA pour générer des recettes adaptées à vos besoins !
              </p>
              <button
                onClick={() => navigate('/generate')}
                className="flex items-center gap-2 px-8 py-4 bg-cout-yellow text-cout-purple font-bold rounded-xl text-lg shadow-xl hover:bg-yellow-400 hover:scale-105 transition-all duration-300"
              >
                <SparklesIcon className="w-6 h-6" />
                Générer ma première recette
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Paywall Modal */}
      <CreditPaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
      />
    </div>
  )
}

function RecipesHeader() {
  return (
    <Header
      back={true}
      home={true}
      title={true}
      profile={true}
      pageName="Livre des recettes"
    />
  )
}