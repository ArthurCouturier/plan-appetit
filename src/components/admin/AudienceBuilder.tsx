import { useState, useCallback } from "react";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/solid";
import AdminService, { AudienceConditionDTO, AudienceQueryDTO } from "../../api/services/AdminService";

const FIELDS = [
    { value: "remainingCredits", label: "Credits restants", type: "number" },
    { value: "role", label: "Role", type: "enum" },
    { value: "recipesCount", label: "Nombre de recettes", type: "number" },
    { value: "collectionsCount", label: "Nombre de collections", type: "number" },
    { value: "daysSinceLastLogin", label: "Jours depuis derniere connexion", type: "number" },
    { value: "daysSinceCreation", label: "Jours depuis inscription", type: "number" },
    { value: "marketingConsent", label: "Consentement marketing", type: "boolean" },
    { value: "skAdNetworkConversionValue", label: "SKAdNetwork conversion value", type: "number" },
] as const;

const OPERATORS = [
    { value: "eq", label: "=" },
    { value: "neq", label: "!=" },
    { value: "gt", label: ">" },
    { value: "lt", label: "<" },
    { value: "gte", label: ">=" },
    { value: "lte", label: "<=" },
] as const;

const ROLES = ["MEMBER", "PREMIUM", "PREMIUM_FOR_EVER", "ADMIN", "BETA_USER"] as const;

interface AudienceBuilderProps {
    onChange: (query: AudienceQueryDTO | null) => void;
    initialValue?: AudienceQueryDTO | null;
}

export default function AudienceBuilder({ onChange, initialValue }: AudienceBuilderProps) {
    const [enabled, setEnabled] = useState(!!initialValue?.conditions?.length);
    const [combinator, setCombinator] = useState<"AND" | "OR">(initialValue?.combinator ?? "AND");
    const [conditions, setConditions] = useState<AudienceConditionDTO[]>(initialValue?.conditions ?? []);
    const [previewCount, setPreviewCount] = useState<number | null>(null);
    const [previewQuery, setPreviewQuery] = useState<string | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);

    const updateAndNotify = useCallback((newConditions: AudienceConditionDTO[], newCombinator: "AND" | "OR") => {
        setConditions(newConditions);
        setCombinator(newCombinator);
        if (newConditions.length > 0) {
            onChange({ combinator: newCombinator, conditions: newConditions });
        } else {
            onChange(null);
        }
        setPreviewCount(null);
        setPreviewQuery(null);
    }, [onChange]);

    const handleToggle = (checked: boolean) => {
        setEnabled(checked);
        if (!checked) {
            setConditions([]);
            setPreviewCount(null);
            onChange(null);
        }
    };

    const addCondition = () => {
        const newConditions = [...conditions, { field: "remainingCredits", operator: "eq", value: "" }];
        updateAndNotify(newConditions, combinator);
    };

    const removeCondition = (index: number) => {
        const newConditions = conditions.filter((_, i) => i !== index);
        updateAndNotify(newConditions, combinator);
    };

    const updateCondition = (index: number, updates: Partial<AudienceConditionDTO>) => {
        const newConditions = conditions.map((c, i) => i === index ? { ...c, ...updates } : c);
        updateAndNotify(newConditions, combinator);
    };

    const handleCombinatorChange = (newCombinator: "AND" | "OR") => {
        updateAndNotify(conditions, newCombinator);
    };

    const handlePreview = async () => {
        if (conditions.length === 0 || conditions.some(c => !c.value)) return;
        setPreviewLoading(true);
        try {
            const result = await AdminService.getAudienceCount({ combinator, conditions });
            setPreviewCount(result.count);
            setPreviewQuery(result.query);
        } catch {
            setPreviewCount(-1);
            setPreviewQuery(null);
        } finally {
            setPreviewLoading(false);
        }
    };

    const getFieldType = (field: string) => FIELDS.find(f => f.value === field)?.type ?? "number";

    return (
        <div className="border border-border-color rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
                <input
                    type="checkbox"
                    id="audienceBuilder"
                    checked={enabled}
                    onChange={(e) => handleToggle(e.target.checked)}
                    className="w-4 h-4 rounded accent-orange-500"
                />
                <label htmlFor="audienceBuilder" className="flex-1">
                    <span className="text-sm font-medium text-text-primary">Ciblage avance</span>
                    <p className="text-xs text-text-secondary">
                        Definir des conditions pour cibler des utilisateurs specifiques
                    </p>
                </label>
            </div>

            {enabled && (
                <div className="space-y-3 pt-2">
                    {/* Combinateur */}
                    {conditions.length > 1 && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-text-secondary">Combiner avec :</span>
                            <button
                                onClick={() => handleCombinatorChange("AND")}
                                className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                                    combinator === "AND"
                                        ? "bg-cout-purple text-white"
                                        : "bg-secondary border border-border-color text-text-secondary"
                                }`}
                            >
                                ET (toutes)
                            </button>
                            <button
                                onClick={() => handleCombinatorChange("OR")}
                                className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                                    combinator === "OR"
                                        ? "bg-cout-purple text-white"
                                        : "bg-secondary border border-border-color text-text-secondary"
                                }`}
                            >
                                OU (au moins une)
                            </button>
                        </div>
                    )}

                    {/* Conditions */}
                    {conditions.map((condition, index) => (
                        <div key={index} className="flex items-center gap-2">
                            {index > 0 && (
                                <span className="text-xs text-cout-purple font-semibold w-6 text-center shrink-0">
                                    {combinator === "AND" ? "ET" : "OU"}
                                </span>
                            )}
                            <select
                                value={condition.field}
                                onChange={(e) => updateCondition(index, { field: e.target.value, value: "" })}
                                className="flex-1 px-2 py-1.5 rounded-lg border border-border-color bg-secondary text-text-primary text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                                {FIELDS.map((f) => (
                                    <option key={f.value} value={f.value}>{f.label}</option>
                                ))}
                            </select>
                            <select
                                value={condition.operator}
                                onChange={(e) => updateCondition(index, { operator: e.target.value })}
                                className="w-16 px-2 py-1.5 rounded-lg border border-border-color bg-secondary text-text-primary text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                                {OPERATORS.map((o) => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                            {getFieldType(condition.field) === "enum" ? (
                                <select
                                    value={condition.value}
                                    onChange={(e) => updateCondition(index, { value: e.target.value })}
                                    className="flex-1 px-2 py-1.5 rounded-lg border border-border-color bg-secondary text-text-primary text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="">Choisir...</option>
                                    {ROLES.map((r) => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            ) : getFieldType(condition.field) === "boolean" ? (
                                <select
                                    value={condition.value}
                                    onChange={(e) => updateCondition(index, { value: e.target.value })}
                                    className="flex-1 px-2 py-1.5 rounded-lg border border-border-color bg-secondary text-text-primary text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="">Choisir...</option>
                                    <option value="true">Oui</option>
                                    <option value="false">Non</option>
                                </select>
                            ) : (
                                <input
                                    type="number"
                                    value={condition.value}
                                    onChange={(e) => updateCondition(index, { value: e.target.value })}
                                    placeholder="Valeur"
                                    className="w-20 px-2 py-1.5 rounded-lg border border-border-color bg-secondary text-text-primary text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            )}
                            <button
                                onClick={() => removeCondition(index)}
                                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors shrink-0"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ))}

                    {/* Ajouter + Apercu */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={addCondition}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-secondary border border-border-color hover:bg-thirdary transition-colors"
                        >
                            <PlusIcon className="w-3.5 h-3.5" />
                            Ajouter une condition
                        </button>
                        {conditions.length > 0 && conditions.every(c => c.value) && (
                            <button
                                onClick={handlePreview}
                                disabled={previewLoading}
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors disabled:opacity-50"
                            >
                                {previewLoading ? "..." : "Apercu"}
                            </button>
                        )}
                        {previewCount !== null && previewCount >= 0 && (
                            <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                                {previewCount} utilisateur{previewCount !== 1 ? "s" : ""}
                            </span>
                        )}
                        {previewCount === -1 && (
                            <span className="text-xs text-red-600">Erreur</span>
                        )}
                    </div>

                    {/* Query preview */}
                    {previewQuery && (
                        <div className="p-3 bg-secondary border border-border-color rounded-lg">
                            <p className="text-[10px] text-text-secondary font-medium mb-1">Query JPQL :</p>
                            <code className="text-[11px] text-text-primary break-all leading-relaxed">
                                {previewQuery}
                            </code>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
