import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    useCulinaryProfile,
    useUpdateCulinaryProfile,
} from "../api/hooks/useCulinaryProfile";
import type {
    CookingLevel,
    UpdateUserCulinaryProfileRequest,
} from "../api/interfaces/users/UserCulinaryProfileInterface";
import type { BudgetTarget } from "../api/interfaces/batchcooking/BatchCookingInterfaces";
import { lightHaptic } from "../haptics/light";
import { errorHaptic } from "../haptics/error";
import PageLoader from "../components/global/PageLoader";
import {
    Q1Household,
    Q2Restrictions,
    Q3Budget,
    Q4CookingLevel,
    Q5TimeLunch,
    Q6TimeDinner,
    Q7AmbitiousMeals,
    Q8Equipment,
    Q9Flavors,
} from "../components/ritual/onboarding/editors";
import {
    PreferenceKey,
    preferenceMetaByKey,
} from "../components/ritual/onboarding/preferenceMeta";
import { profileToDraft } from "../components/ritual/onboarding/types";

const AUTOSAVE_DEBOUNCE_MS = 400;
const SAVED_INDICATOR_MS = 1800;

interface FieldValue {
    householdSize?: number;
    dietaryRestrictions?: string[];
    customRestrictions?: string;
    budgetTarget?: BudgetTarget;
    cookingLevel?: CookingLevel;
    timeLunchWeekdayMin?: number;
    timeDinnerWeekdayMin?: number;
    ambitiousMeals?: string[];
    equipment?: string[];
    flavorPreferences?: string[];
}

export default function RitualPreferenceEditPage() {
    const { key: rawKey } = useParams<{ key: string }>();
    const navigate = useNavigate();
    const { data: profile, isLoading } = useCulinaryProfile();
    const updateMutation = useUpdateCulinaryProfile();

    const meta = rawKey ? preferenceMetaByKey(rawKey) : null;
    const draft = useMemo(() => (profile ? profileToDraft(profile) : null), [profile]);

    const [local, setLocal] = useState<FieldValue>({});
    const [savedFlash, setSavedFlash] = useState(false);
    const flashTimerRef = useRef<number | null>(null);
    const debounceTimerRef = useRef<number | null>(null);
    const pendingBodyRef = useRef<UpdateUserCulinaryProfileRequest | null>(null);

    useEffect(() => {
        if (draft && meta) {
            setLocal(extractFieldValue(draft, meta.key));
        }
    }, [draft, meta?.key]);

    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);
            if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
        };
    }, []);

    if (!meta) {
        return (
            <div className="min-h-screen bg-bg-color px-4 pb-12 mobile-content-with-header">
                <div className="max-w-md mx-auto">
                    <p className="text-text-primary mt-6">Préférence inconnue.</p>
                </div>
            </div>
        );
    }

    if (isLoading || !draft) {
        return <PageLoader />;
    }

    const flushPendingSave = async (): Promise<boolean> => {
        if (debounceTimerRef.current) {
            window.clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = null;
        }
        const body = pendingBodyRef.current;
        if (!body) return true;
        pendingBodyRef.current = null;
        try {
            await updateMutation.mutateAsync(body);
            return true;
        } catch {
            errorHaptic();
            return false;
        }
    };

    const scheduleSave = (body: UpdateUserCulinaryProfileRequest) => {
        pendingBodyRef.current = { ...(pendingBodyRef.current ?? {}), ...body };
        if (debounceTimerRef.current) {
            window.clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = window.setTimeout(async () => {
            debounceTimerRef.current = null;
            const toSend = pendingBodyRef.current;
            pendingBodyRef.current = null;
            if (!toSend) return;
            try {
                await updateMutation.mutateAsync(toSend);
                setSavedFlash(true);
                if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
                flashTimerRef.current = window.setTimeout(() => setSavedFlash(false), SAVED_INDICATOR_MS);
            } catch {
                errorHaptic();
            }
        }, AUTOSAVE_DEBOUNCE_MS);
    };

    const updateField = (next: FieldValue) => {
        setLocal((prev) => ({ ...prev, ...next }));
        scheduleSave(toRequestBody(meta.key, next, local));
    };

    const handleSaveAndBack = async () => {
        const ok = await flushPendingSave();
        if (ok) {
            lightHaptic();
            navigate("/ritual/settings");
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-bg-color mobile-content-with-header">
            <div className="px-4 pb-3">
                <div className="max-w-md mx-auto flex items-center justify-end">
                    <SaveIndicator
                        isPending={updateMutation.isPending}
                        savedFlash={savedFlash}
                        isError={updateMutation.isError}
                    />
                </div>
            </div>

            <div className="flex-1 px-4 pb-32 overflow-y-auto">
                <div className="max-w-md mx-auto">
                    <EditorRenderer
                        keyName={meta.key}
                        value={local}
                        onChange={updateField}
                    />
                </div>
            </div>

            <div
                className="fixed bottom-0 left-0 right-0 bg-bg-color px-4 pt-3"
                style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)" }}
            >
                <div className="max-w-md mx-auto">
                    <button
                        type="button"
                        onClick={handleSaveAndBack}
                        disabled={updateMutation.isPending}
                        className="w-full px-5 py-3 rounded-full bg-cout-yellow text-cout-purple font-bold disabled:opacity-50"
                    >
                        {updateMutation.isPending ? "Enregistrement…" : "Enregistrer"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function SaveIndicator({
    isPending,
    savedFlash,
    isError,
}: {
    isPending: boolean;
    savedFlash: boolean;
    isError: boolean;
}) {
    if (isPending) {
        return <span className="text-xs text-text-secondary">Enregistrement…</span>;
    }
    if (isError) {
        return <span className="text-xs text-cancel-1">Erreur d'enregistrement</span>;
    }
    if (savedFlash) {
        return <span className="text-xs text-text-secondary">✓ Enregistré</span>;
    }
    return <span />;
}

function extractFieldValue(draft: ReturnType<typeof profileToDraft>, key: PreferenceKey): FieldValue {
    switch (key) {
        case "household":
            return { householdSize: draft.householdSize };
        case "restrictions":
            return {
                dietaryRestrictions: draft.dietaryRestrictions,
                customRestrictions: draft.customRestrictions,
            };
        case "budget":
            return { budgetTarget: draft.budgetTarget };
        case "cookingLevel":
            return { cookingLevel: draft.cookingLevel };
        case "timeLunch":
            return { timeLunchWeekdayMin: draft.timeLunchWeekdayMin };
        case "timeDinner":
            return { timeDinnerWeekdayMin: draft.timeDinnerWeekdayMin };
        case "ambitiousMeals":
            return { ambitiousMeals: draft.ambitiousMeals };
        case "equipment":
            return { equipment: draft.equipment };
        case "flavors":
            return { flavorPreferences: draft.flavorPreferences };
    }
}

function toRequestBody(
    key: PreferenceKey,
    next: FieldValue,
    current: FieldValue,
): UpdateUserCulinaryProfileRequest {
    const merged = { ...current, ...next };
    switch (key) {
        case "household":
            return { householdSize: merged.householdSize };
        case "restrictions":
            return {
                dietaryRestrictions: merged.dietaryRestrictions ?? [],
                customRestrictions: merged.customRestrictions?.trim() || undefined,
            };
        case "budget":
            return { budgetTarget: merged.budgetTarget };
        case "cookingLevel":
            return { cookingLevel: merged.cookingLevel };
        case "timeLunch":
            return { timeLunchWeekdayMin: merged.timeLunchWeekdayMin };
        case "timeDinner":
            return { timeDinnerWeekdayMin: merged.timeDinnerWeekdayMin };
        case "ambitiousMeals":
            return { ambitiousMeals: merged.ambitiousMeals ?? [] };
        case "equipment":
            return { equipment: merged.equipment ?? [] };
        case "flavors":
            return { flavorPreferences: merged.flavorPreferences ?? [] };
    }
}

function EditorRenderer({
    keyName,
    value,
    onChange,
}: {
    keyName: PreferenceKey;
    value: FieldValue;
    onChange: (next: FieldValue) => void;
}) {
    switch (keyName) {
        case "household":
            return (
                <Q1Household
                    value={value.householdSize ?? 1}
                    onChange={(v) => onChange({ householdSize: v })}
                />
            );
        case "restrictions":
            return (
                <Q2Restrictions
                    selected={value.dietaryRestrictions ?? []}
                    onChange={(s) => onChange({ dietaryRestrictions: s })}
                    customValue={value.customRestrictions ?? ""}
                    onCustomChange={(v) => onChange({ customRestrictions: v })}
                />
            );
        case "budget":
            return (
                <Q3Budget
                    value={value.budgetTarget ?? "BALANCED"}
                    onChange={(v) => onChange({ budgetTarget: v })}
                />
            );
        case "cookingLevel":
            return (
                <Q4CookingLevel
                    value={value.cookingLevel ?? "INTERMEDIATE"}
                    onChange={(v) => onChange({ cookingLevel: v })}
                />
            );
        case "timeLunch":
            return (
                <Q5TimeLunch
                    value={value.timeLunchWeekdayMin ?? 20}
                    onChange={(v) => onChange({ timeLunchWeekdayMin: v })}
                />
            );
        case "timeDinner":
            return (
                <Q6TimeDinner
                    value={value.timeDinnerWeekdayMin ?? 45}
                    onChange={(v) => onChange({ timeDinnerWeekdayMin: v })}
                />
            );
        case "ambitiousMeals":
            return (
                <Q7AmbitiousMeals
                    value={value.ambitiousMeals ?? []}
                    onChange={(v) => onChange({ ambitiousMeals: v })}
                />
            );
        case "equipment":
            return (
                <Q8Equipment
                    selected={value.equipment ?? []}
                    onChange={(v) => onChange({ equipment: v })}
                />
            );
        case "flavors":
            return (
                <Q9Flavors
                    selected={value.flavorPreferences ?? []}
                    onChange={(v) => onChange({ flavorPreferences: v })}
                />
            );
    }
}
