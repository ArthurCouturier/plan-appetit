import { useState } from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../api/hooks/useAuth";
import { hasRoleLevel, UserRole } from "../api/interfaces/users/UserInterface";
import AdminService from "../api/services/AdminService";

const ICON_TYPES = ["INFO", "CREDIT", "RECIPE", "PROMO", "MILESTONE"] as const;
const SEGMENTS = [
    { value: "", label: "Tous les utilisateurs" },
    { value: "FREE", label: "Gratuits uniquement" },
    { value: "PREMIUM", label: "Premium uniquement" },
    { value: "INACTIVE", label: "Inactifs uniquement" },
] as const;

export default function AdminNotifications() {
    const { user } = useAuth();

    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [segment, setSegment] = useState("");
    const [actionUrl, setActionUrl] = useState("");
    const [iconType, setIconType] = useState<string>("INFO");
    const [expiresIn, setExpiresIn] = useState("");
    const [linkToStores, setLinkToStores] = useState(false);
    const [sendPush, setSendPush] = useState(false);
    const [showPushConfirm, setShowPushConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ status: string; id: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    if (!user || !hasRoleLevel(user.role, UserRole.ADMIN)) {
        return <Navigate to="/" replace />;
    }

    const doSubmit = async () => {
        if (!title.trim() || !body.trim()) return;
        setShowPushConfirm(false);
        setLoading(true);
        setResult(null);
        setError(null);

        try {
            let expiresAt: string | null = null;
            if (expiresIn) {
                const hours = parseInt(expiresIn);
                if (!isNaN(hours) && hours > 0) {
                    expiresAt = new Date(Date.now() + hours * 3600000).toISOString();
                }
            }

            const response = await AdminService.createBroadcastNotification({
                title: title.trim(),
                body: body.trim(),
                segment: segment || null,
                actionUrl: linkToStores ? undefined : (actionUrl.trim() || undefined),
                iconType,
                expiresAt,
                sendPush,
                linkToStores,
            });
            setResult(response);
            setTitle("");
            setBody("");
            setActionUrl("");
            setExpiresIn("");
            setSendPush(false);
            setLinkToStores(false);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Erreur inconnue");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = () => {
        if (!title.trim() || !body.trim()) return;
        if (sendPush) {
            setShowPushConfirm(true);
        } else {
            doSubmit();
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-20 space-y-6">
            <div className="bg-primary rounded-xl p-6 shadow-md border border-border-color">
                <h2 className="text-lg font-bold text-text-primary mb-6">Envoyer une notification broadcast</h2>

                <div className="space-y-4">
                    {/* Titre */}
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">
                            Titre <span className="text-text-secondary text-xs">({title.length}/127)</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value.slice(0, 127))}
                            placeholder="Ex: Nouveau mode Vide mon frigo !"
                            className="w-full px-3 py-2 rounded-lg border border-border-color bg-secondary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    {/* Corps */}
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">
                            Message <span className="text-text-secondary text-xs">({body.length}/511)</span>
                        </label>
                        <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value.slice(0, 511))}
                            placeholder="Ex: Dis-nous ce que tu as dans ton frigo et on te propose une recette adaptee."
                            rows={3}
                            className="w-full px-3 py-2 rounded-lg border border-border-color bg-secondary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                        />
                    </div>

                    {/* Segment + Icone */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-1">Audience</label>
                            <select
                                value={segment}
                                onChange={(e) => setSegment(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-border-color bg-secondary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                                {SEGMENTS.map((s) => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-1">Icone</label>
                            <select
                                value={iconType}
                                onChange={(e) => setIconType(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-border-color bg-secondary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                                {ICON_TYPES.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Lien vers les stores */}
                    <div className="flex items-center gap-3 p-4 border border-border-color rounded-lg">
                        <input
                            type="checkbox"
                            id="linkToStores"
                            checked={linkToStores}
                            onChange={(e) => {
                                setLinkToStores(e.target.checked);
                                if (e.target.checked) setActionUrl("");
                            }}
                            className="w-4 h-4 rounded accent-orange-500"
                        />
                        <label htmlFor="linkToStores" className="flex-1">
                            <span className="text-sm font-medium text-text-primary">Lien vers les stores</span>
                            <p className="text-xs text-text-secondary">
                                Le clic redirigera vers l'App Store (iOS) ou le Play Store (Android) automatiquement
                            </p>
                        </label>
                    </div>

                    {/* Action URL (masque si lien stores) */}
                    {!linkToStores && (
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-1">
                                Lien d'action <span className="text-text-secondary text-xs">(optionnel)</span>
                            </label>
                            <input
                                type="text"
                                value={actionUrl}
                                onChange={(e) => setActionUrl(e.target.value)}
                                placeholder="Ex: /frigo, /premium, /recettes/nouvelle"
                                className="w-full px-3 py-2 rounded-lg border border-border-color bg-secondary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                    )}

                    {/* Expiration */}
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">
                            Expire dans (heures) <span className="text-text-secondary text-xs">(vide = jamais)</span>
                        </label>
                        <input
                            type="number"
                            value={expiresIn}
                            onChange={(e) => setExpiresIn(e.target.value)}
                            placeholder="Ex: 72 (3 jours)"
                            min="1"
                            className="w-full px-3 py-2 rounded-lg border border-border-color bg-secondary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    {/* Push notification */}
                    <div className="flex items-center gap-3 p-4 border border-border-color rounded-lg">
                        <input
                            type="checkbox"
                            id="sendPush"
                            checked={sendPush}
                            onChange={(e) => setSendPush(e.target.checked)}
                            className="w-4 h-4 rounded accent-orange-500"
                        />
                        <label htmlFor="sendPush" className="flex-1">
                            <span className="text-sm font-medium text-text-primary">Envoyer aussi en push</span>
                            <p className="text-xs text-text-secondary">
                                Envoie une notification push a tous les appareils mobiles enregistres
                            </p>
                        </label>
                    </div>

                    {/* Preview */}
                    {(title || body) && (
                        <div className="border border-white/20 rounded-xl p-4 bg-cout-purple/10">
                            <p className="text-xs text-text-secondary mb-2 font-medium">Apercu</p>
                            <div className="flex items-start gap-3">
                                <span className="mt-1 w-2 h-2 rounded-full bg-red-400 shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-text-primary">{title || "Titre..."}</p>
                                    <p className="text-xs text-text-secondary mt-0.5">{body || "Message..."}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !title.trim() || !body.trim()}
                        className="w-full px-4 py-3 rounded-lg font-semibold text-sm shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-cout-yellow text-cout-purple hover:bg-yellow-400"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                Envoi en cours...
                            </span>
                        ) : "Envoyer la notification"}
                    </button>

                    {/* Confirmation push */}
                    {showPushConfirm && (
                        <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg space-y-3">
                            <p className="text-sm font-bold text-red-700">
                                Attention : notification push
                            </p>
                            <p className="text-xs text-red-600">
                                Tu es sur le point d'envoyer une notification push a tous les appareils mobiles.
                                Cette action est irreversible.
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={doSubmit}
                                    className="flex-1 px-4 py-2 rounded-lg font-semibold text-sm bg-red-500 text-white hover:bg-red-600 transition-colors"
                                >
                                    Confirmer l'envoi push
                                </button>
                                <button
                                    onClick={() => setShowPushConfirm(false)}
                                    className="flex-1 px-4 py-2 rounded-lg font-semibold text-sm bg-secondary border border-border-color hover:bg-thirdary transition-colors"
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Resultat */}
                    {result && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm font-medium text-green-700">
                                Notification creee (ID: {result.id})
                            </p>
                        </div>
                    )}
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
