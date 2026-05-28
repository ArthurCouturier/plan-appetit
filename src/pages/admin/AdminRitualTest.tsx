import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import useAuth from "../../api/hooks/useAuth";
import { hasRoleLevel, UserRole } from "../../api/interfaces/users/UserInterface";
import RitualAdminService from "../../api/services/RitualAdminService";
import { MealType } from "../../api/interfaces/ritual/RitualDailyInterface";
import { lightHaptic } from "../../haptics/light";
import { errorHaptic } from "../../haptics/error";

const TARGET_UID_MAX_LENGTH = 64;

export default function AdminRitualTest() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [targetUid, setTargetUid] = useState("");
    const [submitting, setSubmitting] = useState<MealType | null>(null);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [isError, setIsError] = useState(false);

    if (!user || !hasRoleLevel(user.role, UserRole.ADMIN)) {
        return <Navigate to="/" replace />;
    }

    const trigger = async (mealType: MealType) => {
        const email = localStorage.getItem("email");
        const token = localStorage.getItem("firebaseIdToken");
        if (!email || !token) {
            setIsError(true);
            setFeedback("Non authentifié.");
            return;
        }
        setSubmitting(mealType);
        setFeedback(null);
        setIsError(false);
        try {
            const res = await RitualAdminService.testPush(
                email,
                token,
                mealType,
                targetUid.trim() || undefined,
            );
            if (res.success) {
                lightHaptic();
                setFeedback(`✓ Push envoyé (${res.mealType}) à ${res.targetUid}`);
            } else {
                errorHaptic();
                setIsError(true);
                setFeedback(res.message ?? "Erreur.");
            }
        } catch (e) {
            errorHaptic();
            setIsError(true);
            setFeedback(e instanceof Error ? e.message : "Erreur inattendue.");
        } finally {
            setSubmitting(null);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-20 space-y-6">
            <button
                type="button"
                onClick={() => { navigate("/admin"); lightHaptic(); }}
                className="text-text-secondary text-sm"
            >
                ← Retour admin
            </button>
            <div className="bg-primary rounded-xl p-6 shadow-md border border-border-color">
                <h2 className="text-lg font-bold text-text-primary mb-1">Test push ritual</h2>
                <p className="text-sm text-text-secondary mb-6">
                    Envoie un push de test à toi-même (par défaut) ou à un autre user via son uid Firebase.
                </p>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                    UID Firebase cible (optionnel, vide = soi-même)
                </label>
                <input
                    type="text"
                    value={targetUid}
                    onChange={(e) => setTargetUid(e.target.value)}
                    maxLength={TARGET_UID_MAX_LENGTH}
                    placeholder="laisser vide pour s'auto-pinger"
                    className="w-full px-4 py-3 bg-secondary border border-border-color rounded-xl text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-cout-yellow mb-6"
                />
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => trigger("LUNCH")}
                        disabled={submitting !== null}
                        className="flex-1 px-4 py-3 rounded-full bg-cout-yellow text-cout-purple font-bold disabled:opacity-50"
                    >
                        {submitting === "LUNCH" ? "..." : "🌞 Push midi"}
                    </button>
                    <button
                        type="button"
                        onClick={() => trigger("DINNER")}
                        disabled={submitting !== null}
                        className="flex-1 px-4 py-3 rounded-full bg-cout-yellow text-cout-purple font-bold disabled:opacity-50"
                    >
                        {submitting === "DINNER" ? "..." : "🌙 Push soir"}
                    </button>
                </div>
                {feedback && (
                    <p className={`text-sm text-center mt-4 ${isError ? "text-cancel-1" : "text-confirmation-1"}`}>
                        {feedback}
                    </p>
                )}
            </div>
        </div>
    );
}
