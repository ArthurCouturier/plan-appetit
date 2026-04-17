import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../../api/hooks/useAuth";
import { hasRoleLevel, UserRole } from "../../api/interfaces/users/UserInterface";
import AdminFeedbackService, {
    FeedbackCampaignSummary,
    SendCampaignRequest,
} from "../../api/services/AdminFeedbackService";
import type { AudienceQueryDTO } from "../../api/services/AdminService";
import AudienceBuilder from "../../components/admin/AudienceBuilder";
import FeedbackModal from "../../components/modals/FeedbackModal";
import type { FeedbackForm, FeedbackPayload } from "../../components/feedbacks/types";

const DRAFT_KEY = "adminFeedbackDraft";

const EXAMPLE_FORM: FeedbackForm = {
    meta: {
        templateId: "admin-showcase",
        version: 1,
        title: "Exemple de tous les composants",
    },
    components: [
        {
            type: "title",
            id: "t1",
            props: { text: "Comment trouvez-vous Plan'Appetit ?" },
        },
        {
            type: "text",
            id: "d1",
            props: { text: "Vos retours nous aident à nous améliorer.", variant: "muted" },
        },
        {
            type: "text",
            id: "d2",
            props: { text: "Attention : cette campagne expire dans 24h.", variant: "warning" },
        },
        {
            type: "rating",
            id: "rating",
            props: {
                label: "Note globale (demi-étoiles)",
                min: 1,
                max: 5,
                step: 0.5,
                required: true,
            },
        },
        {
            type: "choice",
            id: "usage",
            props: {
                label: "A quelle fréquence utilisez-vous l'app ?",
                options: [
                    { value: "daily", label: "Tous les jours" },
                    { value: "weekly", label: "Plusieurs fois par semaine" },
                    { value: "monthly", label: "Quelques fois par mois" },
                    { value: "rarely", label: "Rarement" },
                ],
                required: true,
            },
        },
        {
            type: "text_input",
            id: "comment",
            props: {
                label: "Un commentaire à partager ?",
                placeholder: "Ce qui vous plait, ce qui manque...",
                multiline: true,
                maxLength: 500,
                required: false,
            },
        },
        {
            type: "link",
            id: "link1",
            props: {
                label: "Consulter notre politique de confidentialité",
                url: "/politique-de-confidentialite",
                external: false,
            },
        },
        {
            type: "button",
            id: "btn1",
            props: {
                label: "Voir nos offres Premium",
                action: "open_url",
                url: "/devenir-premium",
                variant: "secondary",
            },
        },
    ],
};

interface DraftShape {
    templateId: string;
    formJson: string;
    triggerEvent: string;
    priority: number;
    showAfterSeconds: number;
    dismissable: boolean;
    audience: AudienceQueryDTO | null;
}

function parseForm(jsonStr: string): { form: FeedbackForm | null; error: string | null } {
    try {
        const parsed = JSON.parse(jsonStr);
        if (!parsed || typeof parsed !== "object") throw new Error("root must be an object");
        if (!parsed.meta || typeof parsed.meta.title !== "string") throw new Error("meta.title required");
        if (!Array.isArray(parsed.components)) throw new Error("components must be an array");
        return { form: parsed as FeedbackForm, error: null };
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Invalid JSON";
        return { form: null, error: msg };
    }
}

export default function AdminFeedback() {
    const { user } = useAuth();

    const [templateId, setTemplateId] = useState("");
    const [formJson, setFormJson] = useState(() => JSON.stringify(EXAMPLE_FORM, null, 2));
    const [triggerEvent, setTriggerEvent] = useState("");
    const [priority, setPriority] = useState(50);
    const [showAfterSeconds, setShowAfterSeconds] = useState(0);
    const [dismissable, setDismissable] = useState(true);
    const [audience, setAudience] = useState<AudienceQueryDTO | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<{ templateId: string; count: number } | null>(null);

    const [previewOpen, setPreviewOpen] = useState(false);

    const [campaigns, setCampaigns] = useState<FeedbackCampaignSummary[] | null>(null);
    const [campaignsError, setCampaignsError] = useState<string | null>(null);

    useEffect(() => {
        const raw = sessionStorage.getItem(DRAFT_KEY);
        if (!raw) return;
        try {
            const draft = JSON.parse(raw) as Partial<DraftShape>;
            if (draft.templateId) setTemplateId(draft.templateId);
            if (draft.formJson) setFormJson(draft.formJson);
            if (draft.triggerEvent) setTriggerEvent(draft.triggerEvent);
            if (typeof draft.priority === "number") setPriority(draft.priority);
            if (typeof draft.showAfterSeconds === "number") setShowAfterSeconds(draft.showAfterSeconds);
            if (typeof draft.dismissable === "boolean") setDismissable(draft.dismissable);
            if (draft.audience) setAudience(draft.audience);
        } catch {
            /* ignore */
        }
    }, []);

    useEffect(() => {
        const draft: DraftShape = {
            templateId,
            formJson,
            triggerEvent,
            priority,
            showAfterSeconds,
            dismissable,
            audience,
        };
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    }, [templateId, formJson, triggerEvent, priority, showAfterSeconds, dismissable, audience]);

    const { form, error: formError } = useMemo(() => parseForm(formJson), [formJson]);

    const canSend =
        form !== null &&
        audience !== null &&
        (audience?.conditions.length ?? 0) > 0 &&
        !loading;

    const previewPayload: FeedbackPayload | null = form
        ? {
              id: "preview",
              templateId: templateId || "preview",
              form,
              triggerEvent: triggerEvent || null,
              priority,
              showAfterSeconds: 0,
              dismissable: true,
              createdAt: new Date().toISOString(),
          }
        : null;

    const loadCampaigns = async () => {
        setCampaignsError(null);
        try {
            const data = await AdminFeedbackService.listCampaigns();
            setCampaigns(data);
        } catch (e) {
            setCampaignsError(e instanceof Error ? e.message : "Erreur");
        }
    };

    useEffect(() => {
        if (user && hasRoleLevel(user.role, UserRole.ADMIN)) {
            loadCampaigns();
        }
    }, [user]);

    if (!user || !hasRoleLevel(user.role, UserRole.ADMIN)) {
        return <Navigate to="/" replace />;
    }

    const doSend = async () => {
        if (!form || !audience) return;
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const payload: SendCampaignRequest = {
                templateId: templateId.trim() || undefined,
                form,
                audience,
                triggerEvent: triggerEvent.trim() || undefined,
                priority,
                showAfterSeconds,
                dismissable,
            };
            const res = await AdminFeedbackService.sendCampaign(payload);
            setResult(res);
            await loadCampaigns();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Erreur inattendue");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (iso: string) => {
        try {
            return new Date(iso).toLocaleString("fr-FR", {
                dateStyle: "short",
                timeStyle: "short",
            });
        } catch {
            return iso;
        }
    };

    const pct = (part: number, total: number) =>
        total === 0 ? "0 %" : `${Math.round((part / total) * 100)} %`;

    return (
        <div className="min-h-screen bg-bg-color text-text-primary">
            <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
                <header>
                    <h1 className="text-2xl font-bold">Feedback</h1>
                    <p className="text-sm text-text-secondary mt-1">
                        Envoyer une modale de feedback ciblée et consulter l'historique.
                    </p>
                </header>

                <section className="space-y-4 bg-primary rounded-xl p-5 border border-border-color">
                    <h2 className="text-lg font-semibold">Nouvelle campagne</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <label className="flex flex-col gap-1 text-sm">
                            <span className="font-medium">Template ID (optionnel)</span>
                            <input
                                type="text"
                                value={templateId}
                                onChange={(e) => setTemplateId(e.target.value)}
                                placeholder="auto-généré si vide"
                                className="rounded-lg border border-border-color bg-primary px-3 py-2"
                            />
                        </label>

                        <label className="flex flex-col gap-1 text-sm">
                            <span className="font-medium">Trigger event (optionnel)</span>
                            <input
                                type="text"
                                value={triggerEvent}
                                onChange={(e) => setTriggerEvent(e.target.value)}
                                placeholder="ex: recipe_generated, laisser vide pour tous"
                                className="rounded-lg border border-border-color bg-primary px-3 py-2"
                            />
                        </label>

                        <label className="flex flex-col gap-1 text-sm">
                            <span className="font-medium">Priorité (0-100)</span>
                            <input
                                type="number"
                                value={priority}
                                min={0}
                                max={100}
                                onChange={(e) => setPriority(Number(e.target.value))}
                                className="rounded-lg border border-border-color bg-primary px-3 py-2"
                            />
                        </label>

                        <label className="flex flex-col gap-1 text-sm">
                            <span className="font-medium">Délai affichage (sec)</span>
                            <input
                                type="number"
                                value={showAfterSeconds}
                                min={0}
                                onChange={(e) => setShowAfterSeconds(Number(e.target.value))}
                                className="rounded-lg border border-border-color bg-primary px-3 py-2"
                            />
                        </label>

                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={dismissable}
                                onChange={(e) => setDismissable(e.target.checked)}
                            />
                            <span>Fermable par l'utilisateur (croix)</span>
                        </label>
                    </div>

                    <div className="flex flex-col gap-1 text-sm">
                        <span className="font-medium">Formulaire (JSON)</span>
                        <textarea
                            value={formJson}
                            onChange={(e) => setFormJson(e.target.value)}
                            rows={18}
                            spellCheck={false}
                            className="font-mono text-xs rounded-lg border border-border-color bg-primary px-3 py-2"
                        />
                        {formError && (
                            <span className="text-xs text-red-500">JSON invalide: {formError}</span>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            disabled={!form}
                            onClick={() => setPreviewOpen(true)}
                            className="rounded-lg bg-secondary px-4 py-2 text-sm font-semibold disabled:opacity-50"
                        >
                            Aperçu
                        </button>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium mb-2">Ciblage</h3>
                        <AudienceBuilder onChange={setAudience} initialValue={audience} />
                    </div>

                    {error && (
                        <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-sm text-red-600">
                            {error}
                        </div>
                    )}
                    {result && (
                        <div className="rounded-lg bg-green-500/10 border border-green-500/30 px-3 py-2 text-sm text-green-700">
                            Campagne <strong>{result.templateId}</strong> envoyée à {result.count} utilisateur(s).
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button
                            type="button"
                            disabled={!canSend}
                            onClick={doSend}
                            className="rounded-lg bg-accent text-white px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
                        >
                            {loading ? "Envoi..." : "Envoyer la campagne"}
                        </button>
                    </div>
                </section>

                <section className="space-y-3 bg-primary rounded-xl p-5 border border-border-color">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Historique</h2>
                        <button
                            type="button"
                            onClick={loadCampaigns}
                            className="text-sm underline text-text-secondary"
                        >
                            Rafraîchir
                        </button>
                    </div>

                    {campaignsError && (
                        <div className="text-sm text-red-500">{campaignsError}</div>
                    )}

                    {campaigns === null && !campaignsError && (
                        <div className="text-sm text-text-secondary">Chargement...</div>
                    )}

                    {campaigns && campaigns.length === 0 && (
                        <div className="text-sm text-text-secondary">Aucune campagne pour le moment.</div>
                    )}

                    {campaigns && campaigns.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="text-left text-xs text-text-secondary border-b border-border-color">
                                    <tr>
                                        <th className="py-2 pr-3">Template</th>
                                        <th className="py-2 pr-3">Type</th>
                                        <th className="py-2 pr-3">Dernière création</th>
                                        <th className="py-2 pr-3">Total</th>
                                        <th className="py-2 pr-3">Lus</th>
                                        <th className="py-2 pr-3">Répondus</th>
                                        <th className="py-2 pr-3">Dismissés</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {campaigns.map((c) => (
                                        <tr key={c.templateId} className="border-b border-border-color/50">
                                            <td className="py-2 pr-3 font-mono text-xs">{c.templateId}</td>
                                            <td className="py-2 pr-3 text-xs">
                                                {c.isCatalog ? "Catalog" : "Admin"}
                                            </td>
                                            <td className="py-2 pr-3 text-xs">{formatDate(c.lastCreatedAt)}</td>
                                            <td className="py-2 pr-3">{c.total}</td>
                                            <td className="py-2 pr-3">
                                                {c.readCount} <span className="text-text-secondary">({pct(c.readCount, c.total)})</span>
                                            </td>
                                            <td className="py-2 pr-3">
                                                {c.answeredCount} <span className="text-text-secondary">({pct(c.answeredCount, c.total)})</span>
                                            </td>
                                            <td className="py-2 pr-3">
                                                {c.dismissedCount} <span className="text-text-secondary">({pct(c.dismissedCount, c.total)})</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>

            {previewPayload && (
                <FeedbackModal
                    payload={previewPayload}
                    isOpen={previewOpen}
                    onSubmit={() => setPreviewOpen(false)}
                    onDismiss={() => setPreviewOpen(false)}
                />
            )}
        </div>
    );
}
