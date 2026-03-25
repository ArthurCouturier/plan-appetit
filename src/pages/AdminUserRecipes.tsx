import { useState } from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../api/hooks/useAuth";
import { hasRoleLevel, UserRole } from "../api/interfaces/users/UserInterface";
import AdminService, { UserRecipesInfoResponse, BatchImageGenerationResponse } from "../api/services/AdminService";

export default function AdminUserRecipes() {
    const { user } = useAuth();

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [info, setInfo] = useState<UserRecipesInfoResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [generating, setGenerating] = useState(false);
    const [generationResult, setGenerationResult] = useState<BatchImageGenerationResponse | null>(null);
    const [generationError, setGenerationError] = useState<string | null>(null);

    if (!user || !hasRoleLevel(user.role, UserRole.ADMIN)) {
        return <Navigate to="/" replace />;
    }

    const handleFetchInfo = async () => {
        if (!email.trim()) return;
        setLoading(true);
        setInfo(null);
        setError(null);
        setGenerationResult(null);
        setGenerationError(null);

        try {
            const response = await AdminService.getUserRecipesInfo(email.trim());
            setInfo(response);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Erreur inconnue");
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateImages = async () => {
        if (!info) return;
        setGenerating(true);
        setGenerationResult(null);
        setGenerationError(null);

        try {
            const response = await AdminService.generateUserImages(info.email);
            setGenerationResult(response);
            const updatedInfo = await AdminService.getUserRecipesInfo(info.email);
            setInfo(updatedInfo);
        } catch (e) {
            setGenerationError(e instanceof Error ? e.message : "Erreur inconnue");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

            <div className="bg-primary rounded-xl p-6 shadow-md border border-border-color">
                <h2 className="text-lg font-bold text-text-primary mb-4">Rechercher un utilisateur</h2>

                <div className="flex flex-col gap-2">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleFetchInfo()}
                        placeholder="email@exemple.com"
                        className="px-3 py-2 rounded-lg border border-border-color bg-secondary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <button
                        onClick={handleFetchInfo}
                        disabled={loading || !email.trim()}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold text-sm shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Chargement...
                            </span>
                        ) : "Rechercher"}
                    </button>
                </div>

                {error && (
                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                    </div>
                )}
            </div>

            {info && (
                <div className="bg-primary rounded-xl p-6 shadow-md border border-border-color space-y-4">
                    <h2 className="text-lg font-bold text-text-primary">{info.email}</h2>

                    <div className="grid grid-cols-3 gap-3">
                        <StatCard label="Collections" value={info.collectionsCount} />
                        <StatCard label="Recettes" value={info.recipesCount} />
                        <StatCard label="Sans image" value={info.recipesWithoutImageCount} color={info.recipesWithoutImageCount > 0 ? "text-orange-500" : "text-green-500"} />
                    </div>

                    {info.recipesWithoutImageCount > 0 && (
                        <button
                            onClick={handleGenerateImages}
                            disabled={generating}
                            className="w-full px-4 py-3 bg-gradient-to-r from-cout-base to-cout-purple text-white rounded-lg font-semibold text-sm shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
                        >
                            {generating ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Génération en cours...
                                </span>
                            ) : (
                                `Générer jusqu'à 10 visuels de recettes`
                            )}
                        </button>
                    )}

                    {generationResult && (
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <p className="text-sm font-medium text-green-700 dark:text-green-400">
                                {generationResult.generatedCount} image{generationResult.generatedCount > 1 ? "s" : ""} générée{generationResult.generatedCount > 1 ? "s" : ""}
                                {generationResult.failedCount > 0 && (
                                    <span className="text-red-500"> — {generationResult.failedCount} échec{generationResult.failedCount > 1 ? "s" : ""}</span>
                                )}
                            </p>
                        </div>
                    )}

                    {generationError && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-sm text-red-700 dark:text-red-400">{generationError}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
    return (
        <div className="bg-secondary rounded-lg p-3 border border-border-color text-center">
            <p className={`text-2xl font-bold ${color || "text-text-primary"}`}>{value}</p>
            <p className="text-xs text-text-secondary mt-1">{label}</p>
        </div>
    );
}
