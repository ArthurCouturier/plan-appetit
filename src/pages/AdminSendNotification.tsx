import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../api/hooks/useAuth";
import { hasRoleLevel, UserRole } from "../api/interfaces/users/UserInterface";
import AdminService, { NotificationTemplateDTO } from "../api/services/AdminService";

export default function AdminSendNotification() {
    const { user } = useAuth();
    const [templates, setTemplates] = useState<NotificationTemplateDTO[]>([]);
    const [selectedKey, setSelectedKey] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingTemplates, setLoadingTemplates] = useState(true);
    const [result, setResult] = useState<{ pushSent: boolean; inAppSent: boolean } | null>(null);
    const [error, setError] = useState<string | null>(null);

    if (!user || !hasRoleLevel(user.role, UserRole.ADMIN)) {
        return <Navigate to="/" replace />;
    }

    useEffect(() => {
        AdminService.getNotificationTemplates()
            .then((data) => {
                setTemplates(data);
                if (data.length > 0) setSelectedKey(data[0].key);
            })
            .catch(() => setError("Impossible de charger les templates"))
            .finally(() => setLoadingTemplates(false));
    }, []);

    const selected = templates.find(t => t.key === selectedKey);

    const handleSubmit = async () => {
        if (!email.trim() || !selectedKey) return;
        setLoading(true);
        setResult(null);
        setError(null);

        try {
            const response = await AdminService.sendTemplateToUser(email.trim(), selectedKey);
            setResult({ pushSent: response.pushSent, inAppSent: response.inAppSent });
        } catch (e) {
            setError(e instanceof Error ? e.message : "Erreur inconnue");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-20 space-y-6">
            <div className="bg-primary rounded-xl p-6 shadow-md border border-border-color">
                <h2 className="text-lg font-bold text-text-primary mb-6">Envoyer une notification a un utilisateur</h2>

                {loadingTemplates ? (
                    <div className="flex justify-center py-12">
                        <span className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-1">Email de l'utilisateur</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="utilisateur@exemple.com"
                                className="w-full px-3 py-2 rounded-lg border border-border-color bg-secondary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        {/* Selection du template */}
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-1">Notification</label>
                            <select
                                value={selectedKey}
                                onChange={(e) => setSelectedKey(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-border-color bg-secondary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                                {templates.map((t) => (
                                    <option key={t.key} value={t.key}>{t.key}</option>
                                ))}
                            </select>
                        </div>

                        {/* Apercu du template selectionne */}
                        {selected && (
                            <div className="border border-border-color rounded-lg p-4 bg-secondary space-y-2">
                                <div className="flex items-start gap-3">
                                    <span className="mt-1 w-2 h-2 rounded-full bg-red-400 shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-text-primary">{selected.title}</p>
                                        <p className="text-xs text-text-secondary mt-0.5">{selected.body}</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 pt-2">
                                    <span className={`px-2 py-0.5 text-[10px] rounded-full font-semibold ${selected.push ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                        Push: {selected.push ? "Oui" : "Non"}
                                    </span>
                                    <span className={`px-2 py-0.5 text-[10px] rounded-full font-semibold ${selected.inApp ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                        In-app: {selected.inApp ? "Oui" : "Non"}
                                    </span>
                                    <span className="px-2 py-0.5 text-[10px] rounded-full bg-blue-100 text-blue-700">
                                        {selected.iconType}
                                    </span>
                                    {selected.actionUrl && (
                                        <span className="px-2 py-0.5 text-[10px] rounded-full bg-gray-100 text-gray-600">
                                            {selected.actionUrl}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !email.trim() || !selectedKey}
                            className="w-full px-4 py-3 rounded-lg font-semibold text-sm shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-cout-yellow text-cout-purple hover:bg-yellow-400"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    Envoi en cours...
                                </span>
                            ) : "Envoyer"}
                        </button>

                        {/* Resultat */}
                        {result && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-sm font-medium text-green-700">
                                    Notification envoyee
                                    {result.pushSent && result.inAppSent ? " (push + in-app)" :
                                     result.pushSent ? " (push)" :
                                     result.inAppSent ? " (in-app)" : ""}
                                </p>
                            </div>
                        )}
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
