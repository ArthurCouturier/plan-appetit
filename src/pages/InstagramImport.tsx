import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardDocumentIcon, ArrowPathIcon, SparklesIcon, CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import Header from "../components/global/Header";
import Footer from "../components/global/Footer";
import LogoButton from "../components/buttons/LogoButton";
import CreditPaywallModal from "../components/popups/CreditPaywallModal";
import InstagramService from "../api/services/InstagramService";
import SandboxService from "../api/services/SandboxService";
import useAuth from "../api/hooks/useAuth";
import { QuotaInfo } from "../api/interfaces/sandbox/QuotaInfo";

export default function InstagramImport() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [instagramUrl, setInstagramUrl] = useState("");
  const [showEmbed, setShowEmbed] = useState(false);
  const [embedUrl, setEmbedUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [quotaInfo, setQuotaInfo] = useState<QuotaInfo | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);

  const embedContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (user) {
      SandboxService.getQuotaStatus().then(setQuotaInfo);
    }
  }, [user]);

  useEffect(() => {
    if (showEmbed && embedContainerRef.current && embedUrl) {
      const processEmbed = () => {
        if ((window as any).instgrm) {
          (window as any).instgrm.Embeds.process();
        }
      };

      if ((window as any).instgrm) {
        processEmbed();
      } else {
        const existingScript = document.querySelector('script[src*="instagram.com/embed.js"]');
        if (existingScript) {
          existingScript.remove();
        }

        const script = document.createElement("script");
        script.src = "//www.instagram.com/embed.js";
        script.async = true;
        script.onload = processEmbed;
        document.body.appendChild(script);
      }
    }
  }, [showEmbed, embedUrl]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInstagramUrl(text);
    } catch (err) {
      console.error("Impossible de lire le presse-papier:", err);
    }
  };

  const handleDisplay = async () => {
    if (!instagramUrl.trim()) {
      setError("Veuillez entrer un lien Instagram");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedRecipe(null);

    let url = instagramUrl.trim();
    url = url.replace(/\/$/, "").replace("/embed", "");
    setEmbedUrl(url);
    setShowEmbed(true);

    try {
      await InstagramService.fetchPostInfo(url);
    } catch (err: any) {
      console.error("Error fetching post info from backend:", err);
      setError(err.message || "Erreur lors de la récupération du post Instagram");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateRecipe = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Check quota before generating
    if (quotaInfo && !quotaInfo.isSubscriber && quotaInfo.remainingFree <= 0) {
      setError(`Crédits insuffisants. Vous avez ${quotaInfo.remainingFree} crédit${quotaInfo.remainingFree > 1 ? 's' : ''}.`);
      setShowPaywall(true);
      return;
    }

    const token = user.token || localStorage.getItem("firebaseIdToken");
    if (!token) {
      setError("Vous devez être connecté pour générer une recette");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedRecipe(null);

    try {
      const response = await InstagramService.generateRecipeFromPost(
        embedUrl,
        user.email,
        token
      );
      console.log("Generated recipe:", response);

      // Refetch quota
      if (user) {
        try {
          const updatedQuota = await SandboxService.getQuotaStatus();
          setQuotaInfo(updatedQuota);
        } catch (err) {
          console.error('Erreur lors du fetch du quota:', err);
        }
      }

      // Navigate to the newly created recipe
      if (response.recipe?.uuid) {
        navigate(`/recettes/${response.recipe.uuid}`);
      } else {
        setError("Recette générée mais impossible de récupérer son identifiant");
      }
    } catch (err: any) {
      console.error("Error generating recipe:", err);

      // Handle quota exceeded error (402 Payment Required)
      if (err.type === 'QUOTA_EXCEEDED' || err.status === 402) {
        setError(err.message || "Quota de génération épuisé. Passez Premium pour continuer !");
        setShowPaywall(true);

        // Refetch quota to get updated info
        try {
          const updatedQuota = await SandboxService.getQuotaStatus();
          setQuotaInfo(updatedQuota);
        } catch (quotaErr) {
          console.error('Erreur lors du fetch du quota:', quotaErr);
        }
      } else {
        setError(err.message || "Erreur lors de la génération de la recette");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleDisplay();
    }
  };

  return (
    <div className="min-h-screen bg-bg-color flex flex-col">
      <div className="flex-grow">
        {/* Header - Only for logged in users on tablet/desktop */}
        {user && !isMobile && (
          <div className="p-6 pb-0">
            <Header
              back={true}
              home={true}
              title={true}
              profile={true}
              pageName="Import Instagram"
            />
          </div>
        )}

        {/* Hero Section */}
        <section className={`relative overflow-hidden bg-gradient-to-br from-cout-purple via-cout-base to-cout-purple ${user && !isMobile ? 'pt-12' : 'pt-12'} pb-32 px-4`}>
          <div className="absolute inset-0 overflow-hidden opacity-20">
            <div className="absolute top-20 left-10 w-64 h-64 bg-cout-yellow rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 right-20 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>

          <div className="max-w-4xl mx-auto relative z-10">
            {/* Logo Button - Only for non-logged users */}
            {!user && (
              <div className="flex justify-center mb-6 md:mb-12 mt-4 md:mt-8 scale-[2] lg:scale-[2.5] p-4">
                <LogoButton clickable={false} size="2xl" />
              </div>
            )}

            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
                Importez vos recettes Instagram
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-2">
                Collez le lien d'un post Instagram pour transformer la recette en fiche technique
              </p>
              {user && quotaInfo && !quotaInfo.isSubscriber && (
                <p className="text-sm text-cout-yellow font-semibold">
                  {quotaInfo.remainingFree} crédit{quotaInfo.remainingFree > 1 ? 's' : ''} restant{quotaInfo.remainingFree > 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Input Section */}
            <div className="max-w-3xl mx-auto">
              <div className="relative group">
                <div className="absolute inset-0 rounded-2xl p-[2px] bg-gradient-to-r from-cout-base via-cout-purple to-cout-yellow opacity-75 group-focus-within:opacity-100 transition duration-300 animate-gradient-x">
                  <div className="absolute inset-[2px] bg-primary rounded-2xl"></div>
                </div>

                <div className="relative flex items-center gap-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="https://www.instagram.com/p/..."
                    disabled={isLoading}
                    className="flex-1 px-6 py-4 bg-transparent text-text-primary rounded-2xl border-0 focus:outline-none focus:ring-0 transition-all duration-300 placeholder:text-text-secondary placeholder:opacity-60 relative z-10"
                  />
                  <button
                    onClick={handlePaste}
                    className="relative z-20 p-2 bg-cout-base/20 hover:bg-cout-base/40 rounded-lg transition-colors mr-2"
                    title="Coller depuis le presse-papier"
                  >
                    <ClipboardDocumentIcon className="w-5 h-5 text-cout-base" />
                  </button>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleDisplay}
                  disabled={isLoading || !instagramUrl.trim()}
                  className="group px-8 py-4 bg-cout-yellow text-cout-purple font-bold rounded-xl text-lg shadow-2xl hover:bg-yellow-400 transform hover:scale-105 transition-all duration-300 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <>
                      <ArrowPathIcon className="w-6 h-6 animate-spin" />
                      Chargement...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                      Afficher le post
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Login Button - Only for non-logged users */}
            {!user && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-3 bg-cout-yellow hover:bg-yellow-400 text-cout-purple font-bold rounded-xl transition-all duration-200 shadow-lg hover:scale-105 transform"
                >
                  Me Connecter
                </button>
              </div>
            )}
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
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Instagram Post Display */}
        {showEmbed && embedUrl && (
          <section className="py-12 px-4">
            <div className="max-w-4xl mx-auto">
              <button
                onClick={handleGenerateRecipe}
                disabled={isGenerating || !!generatedRecipe}
                className="w-full px-6 py-4 bg-gradient-to-r from-cout-purple to-cout-base text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
              >
                {isGenerating ? (
                  <>
                    <ArrowPathIcon className="w-6 h-6 animate-spin" />
                    <span className="text-sm md:text-base">Génération en cours...</span>
                  </>
                ) : generatedRecipe ? (
                  <>
                    <CheckCircleIcon className="w-6 h-6" />
                    <span className="text-sm md:text-base">Recette générée avec succès !</span>
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-6 h-6" />
                    <span className="text-sm md:text-base">Générer la recette avec l'IA</span>
                  </>
                )}
              </button>

              {/* Instagram Embed */}
              <div className="bg-primary rounded-xl border-2 border-border-color p-4 md:p-6 flex justify-center mb-6 mt-6" ref={embedContainerRef}>
                <blockquote
                  className="instagram-media"
                  data-instgrm-captioned
                  data-instgrm-permalink={embedUrl}
                  data-instgrm-version="14"
                  style={{
                    background: "#FFF",
                    border: "0",
                    borderRadius: "3px",
                    boxShadow: "0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)",
                    margin: "1px",
                    maxWidth: "540px",
                    minWidth: isMobile ? "280px" : "326px",
                    padding: "0",
                    width: "calc(100% - 2px)",
                  }}
                >
                  <div style={{ padding: "16px" }}>
                    <a
                      href={embedUrl}
                      style={{
                        background: "#FFFFFF",
                        lineHeight: "0",
                        padding: "0 0",
                        textAlign: "center",
                        textDecoration: "none",
                        width: "100%",
                      }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Chargement du post Instagram...
                    </a>
                  </div>
                </blockquote>
              </div>

              {/* Description and Generate Button */}
              <button
                onClick={handleGenerateRecipe}
                disabled={isGenerating || !!generatedRecipe}
                className="w-full px-6 py-4 bg-gradient-to-r from-cout-purple to-cout-base text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
              >
                {isGenerating ? (
                  <>
                    <ArrowPathIcon className="w-6 h-6 animate-spin" />
                    <span className="text-sm md:text-base">Génération en cours...</span>
                  </>
                ) : generatedRecipe ? (
                  <>
                    <CheckCircleIcon className="w-6 h-6" />
                    <span className="text-sm md:text-base">Recette générée avec succès !</span>
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-6 h-6" />
                    <span className="text-sm md:text-base">Générer la recette avec l'IA</span>
                  </>
                )}
              </button>
            </div>
          </section>
        )}
      </div>

      {!user && <Footer />}

      {/* Paywall Modal */}
      <CreditPaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
      />

      <style>{`
        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
          will-change: background-position;
        }
      `}</style>
    </div>
  );
}
