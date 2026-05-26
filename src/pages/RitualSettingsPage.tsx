import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    useCulinaryProfile,
    useUpdateCulinaryProfile,
} from "../api/hooks/useCulinaryProfile";
import { lightHaptic } from "../haptics/light";
import { errorHaptic } from "../haptics/error";
import PageLoader from "../components/global/PageLoader";
import { profileToDraft } from "../components/ritual/onboarding/types";
import { PREFERENCE_META } from "../components/ritual/onboarding/preferenceMeta";

function timeToHHmm(value: string): string {
    return value.length >= 5 ? value.slice(0, 5) : value;
}

export default function RitualSettingsPage() {
    const navigate = useNavigate();
    const { data: profile, isLoading } = useCulinaryProfile();
    const updateMutation = useUpdateCulinaryProfile();

    const [notifsEnabled, setNotifsEnabled] = useState(true);
    const [lunchEnabled, setLunchEnabled] = useState(true);
    const [dinnerEnabled, setDinnerEnabled] = useState(true);
    const [lunchTime, setLunchTime] = useState("11:55");
    const [dinnerTime, setDinnerTime] = useState("18:55");
    const [savedAt, setSavedAt] = useState<number | null>(null);

    const draft = useMemo(() => (profile ? profileToDraft(profile) : null), [profile]);

    useEffect(() => {
        if (profile) {
            setNotifsEnabled(profile.notifsEnabled);
            setLunchEnabled(profile.notifsLunchEnabled);
            setDinnerEnabled(profile.notifsDinnerEnabled);
            setLunchTime(timeToHHmm(profile.notifTime1));
            setDinnerTime(timeToHHmm(profile.notifTime2));
        }
    }, [profile]);

    const save = async () => {
        try {
            await updateMutation.mutateAsync({
                notifsEnabled,
                notifsLunchEnabled: lunchEnabled,
                notifsDinnerEnabled: dinnerEnabled,
                notifTime1: `${lunchTime}:00`,
                notifTime2: `${dinnerTime}:00`,
            });
            lightHaptic();
            setSavedAt(Date.now());
        } catch (e) {
            errorHaptic();
        }
    };

    if (isLoading) {
        return <PageLoader />;
    }

    return (
        <div className="min-h-screen bg-bg-color px-4 pb-12 mobile-content-with-header">
            <div className="max-w-md mx-auto">
                <h1 className="text-2xl font-bold text-text-primary mb-2">
                    Réglages ritual
                </h1>
                <p className="text-text-secondary text-sm mb-6">
                    Ajuste tes préférences et tes rappels.
                </p>

                <Section title="Mes préférences ritual">
                    {!draft ? (
                        <p className="text-text-secondary text-sm text-center p-4">
                            Chargement…
                        </p>
                    ) : (
                        PREFERENCE_META.map((meta) => (
                            <NavRow
                                key={meta.key}
                                label={meta.label}
                                sub={meta.formatValue(draft) || "—"}
                                onClick={() => {
                                    navigate(`/ritual/settings/preferences/${meta.key}`);
                                    lightHaptic();
                                }}
                            />
                        ))
                    )}
                </Section>

                <Section title="Notifications">
                    <ToggleRow
                        label="Recevoir les notifications ritual"
                        sub="Désactive pour ne plus recevoir aucun rappel."
                        value={notifsEnabled}
                        onChange={setNotifsEnabled}
                    />
                </Section>

                <div className={notifsEnabled ? "" : "opacity-40 pointer-events-none"}>
                    <Section title="Repas notifiés">
                        <MealNotifRow
                            label="Midi"
                            time={lunchTime}
                            onTimeChange={setLunchTime}
                            enabled={lunchEnabled}
                            onEnabledChange={setLunchEnabled}
                        />
                        <MealNotifRow
                            label="Soir"
                            time={dinnerTime}
                            onTimeChange={setDinnerTime}
                            enabled={dinnerEnabled}
                            onEnabledChange={setDinnerEnabled}
                        />
                    </Section>
                </div>

                <button
                    type="button"
                    onClick={save}
                    disabled={updateMutation.isPending}
                    className="w-full mt-6 px-5 py-4 rounded-full bg-cout-yellow text-cout-purple font-bold disabled:opacity-50"
                >
                    {updateMutation.isPending ? "Enregistrement..." : "Enregistrer"}
                </button>
                {savedAt && (
                    <p className="text-text-secondary text-xs text-center mt-2">
                        ✓ Préférences mises à jour
                    </p>
                )}
                {updateMutation.isError && (
                    <p className="text-cancel-1 text-xs text-center mt-2">
                        {updateMutation.error?.message ?? "Erreur."}
                    </p>
                )}
            </div>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="mb-6">
            <h2 className="text-xs uppercase tracking-wider text-text-secondary mb-2">
                {title}
            </h2>
            <div className="bg-secondary border border-border-color rounded-2xl divide-y divide-border-color">
                {children}
            </div>
        </div>
    );
}

function ToggleRow({
    label,
    sub,
    value,
    onChange,
}: {
    label: string;
    sub?: string;
    value: boolean;
    onChange: (v: boolean) => void;
}) {
    return (
        <button
            type="button"
            onClick={() => { onChange(!value); lightHaptic(); }}
            className="w-full flex items-center justify-between gap-3 p-4 text-left"
        >
            <div className="flex-1 min-w-0">
                <p className="text-text-primary font-semibold">{label}</p>
                {sub && <p className="text-text-secondary text-xs mt-0.5">{sub}</p>}
            </div>
            <span
                className={`w-12 h-7 rounded-full p-1 transition-colors ${
                    value ? "bg-cout-yellow" : "bg-border-color"
                }`}
            >
                <span
                    className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                        value ? "translate-x-5" : "translate-x-0"
                    }`}
                />
            </span>
        </button>
    );
}

function NavRow({
    label,
    sub,
    onClick,
}: {
    label: string;
    sub?: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="w-full flex items-center justify-between gap-3 p-4 text-left"
        >
            <div className="flex-1 min-w-0">
                <p className="text-text-primary font-semibold">{label}</p>
                {sub && <p className="text-text-secondary text-xs mt-0.5">{sub}</p>}
            </div>
            <span className="text-text-secondary text-lg">›</span>
        </button>
    );
}

function MealNotifRow({
    label,
    time,
    onTimeChange,
    enabled,
    onEnabledChange,
}: {
    label: string;
    time: string;
    onTimeChange: (v: string) => void;
    enabled: boolean;
    onEnabledChange: (v: boolean) => void;
}) {
    return (
        <div className="w-full flex items-center justify-between gap-3 p-4">
            <span className="text-text-primary font-semibold">{label}</span>
            <div className="flex items-center gap-3">
                <input
                    type="time"
                    value={time}
                    onChange={(e) => onTimeChange(e.target.value)}
                    disabled={!enabled}
                    className={`bg-primary border border-border-color rounded-xl px-3 py-2 text-text-primary transition-opacity ${
                        enabled ? "" : "opacity-40 pointer-events-none"
                    }`}
                />
                <button
                    type="button"
                    onClick={() => { onEnabledChange(!enabled); lightHaptic(); }}
                    aria-label={`Activer ${label.toLowerCase()}`}
                    className="shrink-0"
                >
                    <span
                        className={`block w-12 h-7 rounded-full p-1 transition-colors ${
                            enabled ? "bg-cout-yellow" : "bg-border-color"
                        }`}
                    >
                        <span
                            className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                                enabled ? "translate-x-5" : "translate-x-0"
                            }`}
                        />
                    </span>
                </button>
            </div>
        </div>
    );
}
