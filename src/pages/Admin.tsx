import { useState } from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../api/hooks/useAuth";
import { hasRoleLevel, UserRole } from "../api/interfaces/users/UserInterface";
import AdminService, { SetRoleResponse, TriggerDailyRecipesResponse } from "../api/services/AdminService";

export default function Admin() {
    const { user } = useAuth();

    if (!user || !hasRoleLevel(user.role, UserRole.ADMIN)) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-20 space-y-6">
            <div className="bg-primary rounded-xl p-6 shadow-md border border-border-color">
                <h2 className="text-lg font-bold text-text-primary mb-6">Actions administrateur</h2>

                <div className="space-y-4">
                    <DailyRecipesTrigger />
                    <SetRoleAction
                        title="Passer un utilisateur Premium"
                        description="Attribue le rôle PREMIUM à un utilisateur via son email."
                        buttonLabel="Passer Premium"
                        buttonColor="bg-cout-yellow text-cout-purple hover:bg-yellow-400"
                        onSubmit={(email) => AdminService.setUserPremium(email)}
                    />
                    <SetRoleAction
                        title="Repasser un utilisateur Membre"
                        description="Remet le rôle MEMBER à un utilisateur via son email."
                        buttonLabel="Repasser Membre"
                        buttonColor="bg-gray-500 hover:bg-gray-600 text-white"
                        onSubmit={(email) => AdminService.setUserMember(email)}
                    />
                </div>
            </div>
        </div>
    );
}

function DailyRecipesTrigger() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<TriggerDailyRecipesResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleTrigger = async () => {
        setLoading(true);
        setResult(null);
        setError(null);

        try {
            const response = await AdminService.triggerDailyRecipes();
            setResult(response);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Erreur inconnue");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="border border-border-color rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h3 className="font-semibold text-text-primary">Recettes du jour</h3>
                    <p className="text-sm text-text-secondary">
                        Relance la generation des recettes quotidiennes et envoie la notification push.
                    </p>
                </div>
                <button
                    onClick={handleTrigger}
                    disabled={loading}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            En cours...
                        </span>
                    ) : (
                        "Lancer le batch"
                    )}
                </button>
            </div>

            {result && result.status === "success" && (
                <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">
                        {result.recipesGenerated} recettes generees avec succes
                    </p>
                    {result.recipes && (
                        <ul className="mt-2 space-y-1">
                            {result.recipes.map((r) => (
                                <li key={r.uuid} className="text-xs text-green-600 dark:text-green-300">
                                    {r.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {error && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
            )}
        </div>
    );
}

function SetRoleAction({ title, description, buttonLabel, buttonColor, onSubmit }: {
    title: string;
    description: string;
    buttonLabel: string;
    buttonColor: string;
    onSubmit: (email: string) => Promise<SetRoleResponse>;
}) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<SetRoleResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!email.trim()) return;
        setLoading(true);
        setResult(null);
        setError(null);

        try {
            const response = await onSubmit(email.trim());
            setResult(response);
            setEmail("");
        } catch (e) {
            setError(e instanceof Error ? e.message : "Erreur inconnue");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="border border-border-color rounded-lg p-4">
            <h3 className="font-semibold text-text-primary">{title}</h3>
            <p className="text-sm text-text-secondary mb-3">{description}</p>

            <div className="flex gap-2">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    placeholder="email@exemple.com"
                    className="flex-1 px-3 py-2 rounded-lg border border-border-color bg-secondary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                    onClick={handleSubmit}
                    disabled={loading || !email.trim()}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${buttonColor}`}
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            En cours...
                        </span>
                    ) : buttonLabel}
                </button>
            </div>

            {result && result.status === "success" && (
                <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">
                        {result.email} est maintenant {result.role}
                    </p>
                </div>
            )}

            {error && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
            )}
        </div>
    );
}
