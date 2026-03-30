import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ClipboardDocumentIcon, ArrowPathIcon, SparklesIcon, ExclamationTriangleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Footer from "../components/global/Footer";
import LogoButton from "../components/buttons/LogoButton";
import CreditPaywallModal from "../components/popups/CreditPaywallModal";
import RecipeGenerationLoadingModal from "../components/popups/RecipeGenerationLoadingModal";
import InstagramDebugModal from "../components/instagram/InstagramDebugModal";
import InstagramService, { InstagramPostInfo } from "../api/services/InstagramService";
import { TrackingService } from "../api/tracking/TrackingService";
import { SKAdNetworkService } from "../api/tracking/skadnetwork/SKAdNetworkService";
import { SKAdNetworkConversionValue } from "../api/tracking/skadnetwork/SKAdNetworkConversionValue";
import SandboxService from "../api/services/SandboxService";
import useAuth from "../api/hooks/useAuth";
import { useInvalidateCollections } from "../api/hooks/useCollectionMutations";
import { QuotaInfo } from "../api/interfaces/sandbox/QuotaInfo";
import { UserRole, hasRoleLevel } from "../api/interfaces/users/UserInterface";
import AdminService from "../api/services/AdminService";

export default function InstagramImport() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const invalidateCollections = useInvalidateCollections();

  const isAdminMode = !!(location.state as any)?.adminMode
    && !!user && hasRoleLevel(user.role, UserRole.ADMIN);

  const [instagramUrl, setInstagramUrl] = useState("");
  const [postInfo, setPostInfo] = useState<InstagramPostInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quotaInfo, setQuotaInfo] = useState<QuotaInfo | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [progress, setProgress] = useState<{
    step: string; currentFrame: number; totalFrames: number; percent: number;
  } | null>(null);
  const eventSourceRef = useRef<{ close: () => void } | null>(null);

  // Admin
  const [analysisApproach, setAnalysisApproach] = useState<string | null>(null);
  const [effectiveApproach, setEffectiveApproach] = useState<string | null>(null);
  const [debugData, setDebugData] = useState<{
    frameCount: number; frames: string[]; frameAnalyses: string[];
    audioTranscription: string | null; recipeUuid: string; recipeName: string;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      SandboxService.getQuotaStatus().then(setQuotaInfo);
      if (isAdminMode) {
        AdminService.getInstagramAnalysisConfig().then(data => {
          setAnalysisApproach(data.currentApproach);
          setEffectiveApproach(data.effectiveApproach);
        }).catch(() => { });
      }
    }
  }, [user]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInstagramUrl(text);
    } catch (err) {
      console.error("Impossible de lire le presse-papier:", err);
    }
  };

  const handleFetchPost = async () => {
    if (!instagramUrl.trim()) {
      setError("Veuillez entrer un lien Instagram");
      return;
    }

    setIsLoading(true);
    setError(null);
    setPostInfo(null);

    try {
      const url = instagramUrl.trim().replace(/\/$/, "").replace("/embed", "");
      const info = await InstagramService.fetchPostInfo(url);
      setPostInfo(info);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la recuperation du post Instagram");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateRecipe = async () => {
    if (!user) { navigate("/login"); return; }
    if (!postInfo) return;

    if (quotaInfo && !quotaInfo.isSubscriber && quotaInfo.remainingFree <= 0) {
      setShowPaywall(true);
      return;
    }

    const token = user.token || localStorage.getItem("firebaseIdToken");
    if (!token) { setError("Vous devez être connecté pour générer une recette"); return; }

    setIsGenerating(true);
    setError(null);
    setProgress(null);
    TrackingService.logInstagramImportStarted();
    TrackingService.logRecipeGenerationInitiated('instagram');

    // SSE progress
    const baseUrl = import.meta.env.VITE_API_URL;
    const port = import.meta.env.VITE_API_PORT;
    const abortController = new AbortController();

    fetch(`${baseUrl}:${port}/api/v1/instagram/generation-progress`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Email': user.email, 'Accept': 'text/event-stream' },
      signal: abortController.signal,
    }).then(async (res) => {
      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (line.startsWith('data:')) {
            try { setProgress(JSON.parse(line.slice(5).trim())); } catch { }
          }
        }
      }
    }).catch(() => { });

    eventSourceRef.current = { close: () => abortController.abort() };

    try {
      const response = await InstagramService.generateRecipeFromPost(postInfo.url, user.email, token);

      if (user) {
        SandboxService.getQuotaStatus().then(setQuotaInfo).catch(() => { });
      }

      if (response.recipe?.uuid) {
        TrackingService.logRecipeGenerated('instagram');
        TrackingService.logInstagramImportFinished();
        SKAdNetworkService.updateConversionValue(SKAdNetworkConversionValue.ONE_RECIPE_GENERATED);
        invalidateCollections();

        if (isAdminMode && response.debug) {
          setDebugData({ ...response.debug, recipeUuid: response.recipe.uuid, recipeName: response.recipe.name });
        } else {
          navigate(`/recettes/${response.recipe.uuid}`);
        }
      } else {
        setError("Recette generee mais impossible de recuperer son identifiant");
      }
    } catch (err: any) {
      if (err.type === 'QUOTA_EXCEEDED' || err.status === 402) {
        SKAdNetworkService.updateConversionValue(SKAdNetworkConversionValue.QUOTA_REACHED);
        setShowPaywall(true);
        SandboxService.getQuotaStatus().then(setQuotaInfo).catch(() => { });
      } else {
        setError(err.message || "Erreur lors de la generation de la recette");
      }
    } finally {
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); handleFetchPost(); }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-cout-purple via-cout-base to-cout-purple">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-cout-yellow rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="flex-grow relative z-10 pb-16" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 48px)" }}>
        <div className="max-w-2xl mx-auto px-4 mb-12">

          {/* Logo - non-logged users */}
          {!user && (
            <div className="flex justify-center mb-6 md:mb-12 mt-4 md:mt-8 scale-[2] lg:scale-[2.5] p-4">
              <LogoButton clickable={false} size="2xl" />
            </div>
          )}

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 leading-tight">
              Importez vos recettes Instagram
            </h1>
            <p className="text-base md:text-lg text-white/80">
              Collez le lien d'un post pour le transformer en recette
            </p>
            {user && quotaInfo && !quotaInfo.isSubscriber && (
              <p className="text-sm text-cout-yellow font-semibold mt-2">
                {quotaInfo.remainingFree} credit{quotaInfo.remainingFree > 1 ? 's' : ''} restant{quotaInfo.remainingFree > 1 ? 's' : ''}
              </p>
            )}
            {isAdminMode && analysisApproach && (
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="text-xs text-white/60">Approche :</span>
                {['PARALLEL', 'BATCH', 'HYBRID'].map(a => (
                  <button
                    key={a}
                    onClick={() => {
                      AdminService.setInstagramAnalysisApproach(a).then(data => {
                        setAnalysisApproach(data.currentApproach);
                        setEffectiveApproach(data.effectiveApproach);
                      }).catch(() => { });
                    }}
                    className={`text-xs px-2 py-1 rounded-md transition-colors ${analysisApproach === a
                      ? 'bg-cout-yellow text-cout-purple font-bold'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                  >
                    {a}{effectiveApproach !== analysisApproach && effectiveApproach === a ? ' (actif)' : ''}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="mb-6 flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-lg border-2 border-cout-yellow/50 focus-within:border-cout-yellow transition-colors duration-300">
            <input
              ref={inputRef}
              type="text"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="https://www.instagram.com/p/..."
              disabled={isLoading || isGenerating}
              className="flex-1 bg-transparent text-gray-800 text-base focus:outline-none placeholder:text-gray-400"
            />
            <button
              onClick={handlePaste}
              className="p-2 bg-cout-purple/10 hover:bg-cout-purple/20 rounded-lg transition-colors"
              title="Coller depuis le presse-papier"
            >
              <ClipboardDocumentIcon className="w-5 h-5 text-cout-purple" />
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-4 flex items-start gap-3 mb-6">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
              <p className="text-red-200 text-sm flex-1">{error}</p>
              <button onClick={() => setError(null)} className="text-red-300 hover:text-white">
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Post preview + actions */}
          {!postInfo && !isLoading && (
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={handleFetchPost}
                disabled={!instagramUrl.trim() || isLoading}
                className="px-8 py-4 bg-cout-yellow text-cout-purple font-bold rounded-xl text-lg shadow-2xl hover:bg-yellow-400 transform hover:scale-105 transition-all duration-300 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <SparklesIcon className="w-6 h-6" />
                Charger le post
              </button>
              {!user && (
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all"
                >
                  Me connecter
                </button>
              )}
            </div>
          )}

          {isLoading && (
            <div className="flex justify-center py-8">
              <ArrowPathIcon className="w-8 h-8 text-white animate-spin" />
            </div>
          )}

          {postInfo && (
            <div className="space-y-6">
              {/* Thumbnail */}
              {postInfo.imageBase64 && (
                <div className="flex justify-center">
                  <div className="w-44 h-44 md:w-56 md:h-56 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20">
                    <img
                      src={postInfo.imageBase64}
                      alt={postInfo.title}
                      draggable={false}
                      className="w-full h-full object-cover select-none"
                    />
                  </div>
                </div>
              )}

              {/* Post info */}
              <div className="text-center">
                <p className="text-white/70 text-sm">{postInfo.title}</p>
                {postInfo.description && (
                  <p className="text-white/50 text-xs mt-1 line-clamp-2">{postInfo.description}</p>
                )}
              </div>

              {/* Generate button */}
              <button
                onClick={handleGenerateRecipe}
                disabled={isGenerating}
                className="w-full px-6 py-4 bg-cout-yellow text-cout-purple font-bold rounded-xl shadow-lg hover:bg-yellow-400 transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
              >
                {isGenerating ? (
                  <><ArrowPathIcon className="w-6 h-6 animate-spin" /> Demarrage...</>
                ) : (
                  <><SparklesIcon className="w-6 h-6" />Avoir les secrets de cette recette!</>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {!user && <Footer />}

      <RecipeGenerationLoadingModal isOpen={isGenerating} progress={progress} />

      {debugData && (
        <InstagramDebugModal debugData={debugData} onClose={() => setDebugData(null)} />
      )}

      {showPaywall && <CreditPaywallModal onClose={() => setShowPaywall(false)} />}

      <style>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
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
