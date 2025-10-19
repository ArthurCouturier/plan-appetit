import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SparklesIcon } from "@heroicons/react/24/solid";
import { ExclamationTriangleIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import AnimatedGradientBox from "../components/sandbox/AnimatedGradientBox";
import LockedRecipeCard from "../components/sandbox/LockedRecipeCard";
import RecipeCard from "../components/cards/RecipeCard";
import CreditPaywallModal from "../components/popups/CreditPaywallModal";
import MultipleRecipeConfirmationModal from "../components/popups/MultipleRecipeConfirmationModal";
import RecipeGenerationLoadingModal from "../components/popups/RecipeGenerationLoadingModal";
import Header from "../components/global/Header";
import { useTypingPlaceholder } from "../hooks/useTypingPlaceholder";
import SandboxService from "../api/services/SandboxService";
import RecipeService from "../api/services/RecipeService";
import { SandboxRecipe } from "../api/interfaces/sandbox/SandboxRecipe";
import { QuotaInfo } from "../api/interfaces/sandbox/QuotaInfo";
import useAuth from "../api/hooks/useAuth";
import { useRecipeContext } from "../contexts/RecipeContext";

export default function Sandbox() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { recipes: userRecipes, setRecipes: setUserRecipes } = useRecipeContext();
  const [searchParams, setSearchParams] = useSearchParams();

  const [prompt, setPrompt] = useState(searchParams.get("q") || "");
  const [sandboxRecipes, setSandboxRecipes] = useState<SandboxRecipe[]>([]);
  const [quotaInfo, setQuotaInfo] = useState<QuotaInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [placeholders, setPlaceholders] = useState<string[]>([]);
  const [, setAnonymousRecipeUuid] = useState<string | null>(null);
  const [recipeCount, setRecipeCount] = useState(1);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const animatedPlaceholder = useTypingPlaceholder({
    phrases: placeholders,
    typingSpeed: 80,
    deletingSpeed: 50,
    pauseDuration: 2000,
  });

  useEffect(() => {
    SandboxService.getPlaceholders().then(setPlaceholders);
    SandboxService.getQuotaStatus().then(setQuotaInfo);

    const storedUuid = localStorage.getItem('anonymousRecipeUuid');
    if (storedUuid && !user) {
      setAnonymousRecipeUuid(storedUuid);
    }
  }, [user]);

  useEffect(() => {
    const linkRecipeOnLogin = async () => {
      const storedUuid = localStorage.getItem('anonymousRecipeUuid');
      if (user && storedUuid) {
        try {
          const result = await SandboxService.linkAnonymousRecipe(storedUuid);

          if (result.success) {
            console.log('Recette anonyme liée avec succès');
            localStorage.removeItem('anonymousRecipeUuid');
            setAnonymousRecipeUuid(null);

            if (result.quota) {
              setQuotaInfo(result.quota);
            }
          } else if (result.error === 'INSUFFICIENT_CREDITS') {
            setError('Quota insuffisant pour associer cette recette. Passez Premium ou attendez demain.');
            setShowPaywall(true);
            if (result.quota) {
              setQuotaInfo(result.quota);
            }
          } else if (result.alreadyLinked) {
            console.log('Recette déjà associée à un utilisateur');
            localStorage.removeItem('anonymousRecipeUuid');
            setAnonymousRecipeUuid(null);
          }
        } catch (error) {
          console.error('Erreur lors de la liaison de la recette:', error);
        }
      }
    };

    linkRecipeOnLogin();
  }, [user]);

  useEffect(() => {
    if (searchParams.get("q")) {
      setPrompt(searchParams.get("q") || "");
    }
  }, [searchParams]);

  const handleGenerateClick = () => {
    if (!prompt.trim() || prompt.trim().length < 3) {
      setError("Veuillez entrer au moins 3 caractères");
      return;
    }

    // Si utilisateur connecté, vérifier les crédits
    if (user && quotaInfo) {
      // Si utilisateur non-premium et crédits insuffisants
      if (!quotaInfo.isSubscriber && quotaInfo.remainingFree < recipeCount) {
        setError(`Crédits insuffisants. Vous avez ${quotaInfo.remainingFree} crédit${quotaInfo.remainingFree > 1 ? 's' : ''} mais essayez d'en générer ${recipeCount}.`);
        setShowPaywall(true);
        return;
      }

      // Si génération multiple, afficher la modale de confirmation
      if (recipeCount > 1) {
        setShowConfirmation(true);
        return;
      }
    }

    // Sinon, générer directement
    handleGenerate();
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || prompt.trim().length < 3) {
      setError("Veuillez entrer au moins 3 caractères");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSandboxRecipes([]);

    try {
      setSearchParams({ q: prompt });

      const response = await SandboxService.generateRecipes({
        prompt: prompt.trim(),
        count: user ? recipeCount : 1,
      });

      setSandboxRecipes(response.recipes);
      setQuotaInfo(response.quota);

      // Si utilisateur connecté, refetch toutes ses recettes pour mettre à jour le contexte
      if (user) {
        try {
          const updatedRecipes = await RecipeService.fetchRecipesRemotly();
          setUserRecipes(updatedRecipes);
        } catch (err) {
          console.error('Erreur lors du fetch des recettes:', err);
        }
      }

      if (response.recipeUuid && !user) {
        localStorage.setItem('anonymousRecipeUuid', response.recipeUuid);
        setAnonymousRecipeUuid(response.recipeUuid);
      }

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);

    } catch (err: any) {
      console.error("Erreur lors de la génération:", err);

      if (err.type === "QUOTA_EXCEEDED") {
        setError(err.message || "Quota épuisé. Passez Premium pour continuer !");
        setQuotaInfo(err.quota);
        if (!user || (quotaInfo && !quotaInfo.isSubscriber)) {
          setShowPaywall(true);
        }
      } else if (err.type === "VALIDATION_ERROR") {
        setError(err.message || "Erreur de validation de votre demande");
      } else {
        setError("Une erreur est survenue lors de la génération. Veuillez réessayer.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerateClick();
    }
  };

  const examplePrompts = [
    "5 recettes autour de la butternut",
    "Un dessert sans lactose",
    "Des idées de batch cooking",
    "Un curry thaï végétalien express"
  ];

  return (
    <div className="min-h-screen bg-bg-color">
      {/* Header - Only for logged in users */}
      {user && (
        <div className="p-6 pb-0">
          <Header
            back={true}
            home={true}
            title={true}
            profile={true}
            pageName="Sandbox - Création libre"
          />
        </div>
      )}

      {/* Hero Section */}
      <section className={`relative overflow-hidden bg-gradient-to-br from-cout-purple via-cout-base to-cout-purple ${user ? 'pt-12' : 'pt-24'} pb-32 px-4`}>
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute top-20 left-10 w-64 h-64 bg-cout-yellow rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
              Qu'est-ce qu'on mange aujourd'hui ?
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-2">
              Décrivez librement ce que vous voulez cuisiner
            </p>
            {user && quotaInfo && !quotaInfo.isSubscriber && (
              <p className="text-sm text-cout-yellow font-semibold">
                {quotaInfo.remainingFree} crédit{quotaInfo.remainingFree > 1 ? 's' : ''} restant{quotaInfo.remainingFree > 1 ? 's' : ''} / {recipeCount} recette{recipeCount > 1 ? 's' : ''} à générer
              </p>
            )}
          </div>

          {/* Input Section */}
          <div className="max-w-3xl mx-auto">
            <AnimatedGradientBox
              ref={inputRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              animatedPlaceholder={animatedPlaceholder}
              disabled={isLoading}
              aria-label="Entrez votre demande de recette"
            />

            <div className="mt-6 flex flex-col items-center gap-4">
              {/* Recipe Count Selector - Only for logged in users */}
              {user && (
                <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-xl border border-white/20">
                  <label htmlFor="recipeCount" className="text-white font-semibold text-sm">
                    Nombre de recettes :
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setRecipeCount(count)}
                        disabled={isLoading}
                        className={`w-10 h-10 rounded-lg font-bold text-sm transition-all duration-200 ${
                          recipeCount === count
                            ? 'bg-cout-yellow text-cout-purple shadow-lg scale-110'
                            : 'bg-white/20 text-white hover:bg-white/30'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleGenerateClick}
                disabled={isLoading || !prompt.trim()}
                className="group px-8 py-4 bg-cout-yellow text-cout-purple font-bold rounded-xl text-lg shadow-2xl hover:bg-yellow-400 transform hover:scale-105 transition-all duration-300 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                aria-label="Générer mes recettes"
              >
                {isLoading ? (
                  <>
                    <ArrowPathIcon className="w-6 h-6 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                    Générer {user && recipeCount > 1 ? `${recipeCount} recettes` : 'mes recettes'}
                  </>
                )}
              </button>

              <p className="text-white/70 text-sm text-center max-w-xl">
                Exemples : "{examplePrompts[0]}", "{examplePrompts[1]}", ou tout autre plat que vous imaginez !
              </p>
            </div>
          </div>

          {/* Quick examples */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                onClick={() => {
                  setPrompt(example);
                  inputRef.current?.focus();
                }}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-sm rounded-lg transition-all duration-200 border border-white/20 hover:border-white/40"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Error Section */}
      {error && (
        <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-20">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 font-semibold">Erreur</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 transition-colors"
              aria-label="Fermer l'erreur"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading && (
        <section className="py-12 px-4" ref={resultsRef}>
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-text-primary mb-8 text-center">
              Création de vos recettes magiques...
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-primary rounded-xl border-2 border-border-color p-6 animate-pulse">
                  <div className="h-6 bg-secondary rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-secondary rounded w-1/2 mb-6"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-secondary rounded"></div>
                    <div className="h-3 bg-secondary rounded w-5/6"></div>
                    <div className="h-3 bg-secondary rounded w-4/6"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Results Section */}
      {!isLoading && sandboxRecipes.length > 0 && (
        <section className="py-12 px-4" ref={resultsRef}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-text-primary mb-2">
                Vos recettes sont prêtes ! 🎉
              </h2>
              <p className="text-text-secondary">
                {sandboxRecipes.length} recette{sandboxRecipes.length > 1 ? 's' : ''} générée{sandboxRecipes.length > 1 ? 's' : ''} pour vous
              </p>
              {quotaInfo && !quotaInfo.isSubscriber && (
                <p className="text-sm text-cout-base font-semibold mt-2">
                  Il vous reste {quotaInfo.remainingFree} génération{quotaInfo.remainingFree > 1 ? 's' : ''} gratuite{quotaInfo.remainingFree > 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Si utilisateur non connecté avec 1 seule recette, afficher en pleine largeur centré */}
            {!user && sandboxRecipes.length === 1 ? (
              <div className="max-w-4xl mx-auto mb-8">
                <LockedRecipeCard recipe={sandboxRecipes[0]} />
              </div>
            ) : user ? (
              // Utilisateur connecté : afficher les vraies recettes depuis le contexte
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {sandboxRecipes
                  .filter(recipe => recipe.uuid)
                  .map((sandboxRecipe) => {
                    const fullRecipe = userRecipes.find(r => r.uuid === sandboxRecipe.uuid);
                    return fullRecipe ? (
                      <RecipeCard key={String(fullRecipe.uuid)} recipe={fullRecipe} />
                    ) : null;
                  })}
              </div>
            ) : (
              // Utilisateur anonyme : afficher les cartes verrouillées
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {sandboxRecipes.map((recipe, index) => (
                  <LockedRecipeCard key={index} recipe={recipe} />
                ))}
              </div>
            )}

            {/* CTA Section */}
            <div className="text-center">
              {!user ? (
                <div className="bg-gradient-to-r from-cout-base to-cout-purple p-8 rounded-2xl">
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Envie d'en générer plus ?
                  </h3>
                  <p className="text-white/90 mb-6">
                    Créez un compte gratuit pour obtenir 3 générations offertes !
                  </p>
                  <button
                    onClick={() => navigate('/login')}
                    className="px-8 py-3 bg-cout-yellow text-cout-purple font-bold rounded-xl hover:bg-yellow-400 transition-all duration-300 shadow-lg"
                  >
                    S'inscrire gratuitement
                  </button>
                </div>
              ) : quotaInfo && !quotaInfo.isSubscriber && quotaInfo.remainingFree === 0 ? (
                <div className="bg-gradient-to-r from-cout-base to-cout-purple p-8 rounded-2xl">
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Quota épuisé
                  </h3>
                  <p className="text-white/90 mb-6">
                    Passez Premium pour des générations illimitées !
                  </p>
                  <button
                    onClick={() => navigate('/premium')}
                    className="px-8 py-3 bg-cout-yellow text-cout-purple font-bold rounded-xl hover:bg-yellow-400 transition-all duration-300 shadow-lg"
                  >
                    Découvrir Premium
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setPrompt("");
                    setSandboxRecipes([]);
                    inputRef.current?.focus();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="px-8 py-3 bg-cout-base text-white font-bold rounded-xl hover:bg-indigo-500 transition-all duration-300"
                >
                  Générer d'autres recettes
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Empty State */}
      {!isLoading && sandboxRecipes.length === 0 && !error && (
        <section className="py-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <SparklesIcon className="w-16 h-16 text-cout-base mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              Prêt à découvrir de nouvelles recettes ?
            </h3>
            <p className="text-text-secondary mb-6">
              Décrivez ce que vous voulez cuisiner et laissez l'IA faire le reste !
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {examplePrompts.slice(0, 3).map((example, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setPrompt(example);
                    inputRef.current?.focus();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="px-4 py-2 bg-secondary hover:bg-cout-base/10 text-text-primary text-sm rounded-lg transition-all duration-200 border border-border-color hover:border-cout-base"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Loading Modal */}
      <RecipeGenerationLoadingModal isOpen={isLoading} />

      {/* Paywall Modal */}
      <CreditPaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
      />

      {/* Multiple Recipe Confirmation Modal */}
      {user && quotaInfo && (
        <MultipleRecipeConfirmationModal
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          onConfirm={handleGenerate}
          recipeCount={recipeCount}
          remainingCredits={quotaInfo.isSubscriber ? -1 : quotaInfo.remainingFree}
        />
      )}
    </div>
  );
}
