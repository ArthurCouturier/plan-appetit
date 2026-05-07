import { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import {
    ChevronDownIcon,
    ChevronUpIcon,
    ClipboardDocumentIcon,
    ShareIcon,
    UserPlusIcon,
    CheckIcon,
} from "@heroicons/react/24/outline";
import { Capacitor } from "@capacitor/core";
import { Share } from "@capacitor/share";
import {
    isValidReferralCode,
    normalizeReferralCode,
    REFERRAL_CODE_LENGTH,
    ReferralErrorCode,
} from "../../api/interfaces/referral/ReferralInterface";
import { useApplyReferralCode, useReferralStats } from "../../api/hooks/useReferral";
import { mediumHaptic } from "../../haptics/medium";

const ERROR_MESSAGES: Record<ReferralErrorCode, string> = {
    ALREADY_HAS_REFERRER: "Tu as déjà utilisé un code parrain.",
    SELF_REFERRAL: "Tu ne peux pas utiliser ton propre code.",
    CODE_NOT_FOUND: "Ce code n'existe pas.",
    INVALID_FORMAT: "Le code doit faire 6 caractères.",
    UNAUTHORIZED: "Connexion expirée, reconnecte-toi.",
    INTERNAL_ERROR: "Erreur serveur, réessaie plus tard.",
};

export default function ReferralSection() {
    const [open, setOpen] = useState(false);
    const { data: stats, isLoading } = useReferralStats();

    const headerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [closedHeight, setClosedHeight] = useState<number | null>(null);
    const [openHeight, setOpenHeight] = useState<number | null>(null);

    const measure = useCallback(() => {
        const header = headerRef.current;
        const content = contentRef.current;
        if (header) {
            setClosedHeight(header.offsetHeight + 24);
        }
        if (header && content) {
            setOpenHeight(header.offsetHeight + content.scrollHeight + 24);
        }
    }, []);

    useLayoutEffect(() => {
        measure();
    }, [stats, open, measure]);

    useEffect(() => {
        const content = contentRef.current;
        if (!content) return;
        const observer = new ResizeObserver(() => measure());
        observer.observe(content);
        return () => observer.disconnect();
    }, [stats, measure]);

    const containerStyle: React.CSSProperties = {
        maxHeight: open ? (openHeight ?? 800) : (closedHeight ?? 64),
        transition: "max-height 350ms ease-in-out",
        overflow: "hidden",
    };

    const handleToggle = () => {
        setOpen((v) => !v);
        mediumHaptic();
    };

    if (isLoading || !stats) {
        return (
            <div className="bg-primary rounded-xl p-4 shadow-lg border border-border-color">
                <div className="text-text-secondary text-sm text-center">Chargement…</div>
            </div>
        );
    }

    return (
        <div className="bg-primary rounded-xl shadow-lg border border-border-color" style={containerStyle}>
            <button
                type="button"
                onClick={handleToggle}
                className="w-full px-6 py-4 flex items-center justify-between gap-3 text-left"
            >
                <div ref={headerRef} className="flex items-center gap-3">
                    <UserPlusIcon className="w-5 h-5 text-cout-purple flex-shrink-0" />
                    <div>
                        <div className="text-base font-bold text-text-primary">Mon code ami</div>
                        <div className="text-xs text-text-secondary">
                            Invite tes amis et gagne des crédits gratuits
                        </div>
                    </div>
                </div>
                {open ? (
                    <ChevronUpIcon className="w-5 h-5 text-text-secondary flex-shrink-0" />
                ) : (
                    <ChevronDownIcon className="w-5 h-5 text-text-secondary flex-shrink-0" />
                )}
            </button>

            <div ref={contentRef} className="px-6 pb-6 pt-2">
                <ReferralExpandedContent
                    code={stats.referralCode}
                    shareUrl={stats.shareUrl}
                    activationsCount={stats.activationsCount}
                    creditsActivations={stats.creditsEarnedFromActivations}
                    creditsPurchases={stats.creditsEarnedFromPurchases}
                    activationCap={stats.activationCap}
                    hasReferrer={stats.hasReferrer}
                />
            </div>
        </div>
    );
}

function ReferralExpandedContent({
    code,
    shareUrl,
    activationsCount,
    creditsActivations,
    creditsPurchases,
    activationCap,
    hasReferrer,
}: {
    code: string;
    shareUrl: string;
    activationsCount: number;
    creditsActivations: number;
    creditsPurchases: number;
    activationCap: number;
    hasReferrer: boolean;
}) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            mediumHaptic();
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Clipboard error", err);
        }
    };

    const handleShare = async () => {
        const message = `Hey ! J'utilise Plan Appétit pour générer des recettes, ça vaut le coup. Avec mon code ami ${code} tu reçois 2 crédits gratuits à l'inscription : ${shareUrl}`;
        try {
            if (Capacitor.isNativePlatform()) {
                await Share.share({
                    title: "Plan Appétit",
                    text: message,
                    url: shareUrl,
                    dialogTitle: "Partager mon code ami",
                });
            } else if (navigator.share) {
                await navigator.share({
                    title: "Plan Appétit",
                    text: message,
                    url: shareUrl,
                });
            } else {
                await navigator.clipboard.writeText(message);
                alert("Message copié, tu peux le coller où tu veux !");
            }
        } catch (err) {
            const msg = (err as Error).message || "";
            if (msg !== "Share canceled" && (err as Error).name !== "AbortError") {
                console.error("Share error", err);
            }
        }
    };

    const totalEarned = creditsActivations + creditsPurchases;

    return (
        <div className="space-y-4">
            <p className="text-sm text-text-secondary leading-relaxed">
                Quand un ami crée son compte avec ton code, vous recevez chacun{" "}
                <span className="font-bold text-text-primary">2 crédits</span>. Et
                s'il achète son premier pack de crédits, tu en gagnes{" "}
                <span className="font-bold text-text-primary">5 de plus</span>.
            </p>

            <div className="bg-secondary border border-border-color rounded-lg p-4 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="text-xs text-text-secondary mb-1">Ton code</div>
                    <div className="text-2xl font-bold tracking-widest text-cout-purple">
                        {code}
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleCopy}
                    aria-label="Copier le code"
                    className="flex-shrink-0 p-3 rounded-lg bg-primary border border-border-color hover:bg-secondary transition-colors"
                >
                    {copied ? (
                        <CheckIcon className="w-5 h-5 text-green-600" />
                    ) : (
                        <ClipboardDocumentIcon className="w-5 h-5 text-text-primary" />
                    )}
                </button>
            </div>

            <button
                type="button"
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cout-base to-cout-purple text-white font-bold rounded-lg shadow hover:shadow-lg transition-all"
            >
                <ShareIcon className="w-5 h-5" />
                Partager mon code
            </button>

            <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-secondary rounded-lg p-3 border border-border-color text-center">
                    <div className="text-2xl font-bold text-text-primary">{activationsCount}</div>
                    <div className="text-xs text-text-secondary">Ami{activationsCount > 1 ? "s" : ""} parrainé{activationsCount > 1 ? "s" : ""}</div>
                </div>
                <div className="bg-secondary rounded-lg p-3 border border-border-color text-center">
                    <div className="text-2xl font-bold text-text-primary">+{totalEarned}</div>
                    <div className="text-xs text-text-secondary">
                        Crédits gagnés ({creditsActivations}/{activationCap})
                    </div>
                </div>
            </div>

            {!hasReferrer && (
                <div className="pt-3 border-t border-border-color">
                    <ApplyCodeForm />
                </div>
            )}
        </div>
    );
}

function ApplyCodeForm() {
    const [input, setInput] = useState("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const { mutate, isPending } = useApplyReferralCode();

    const normalized = normalizeReferralCode(input);
    const canSubmit = isValidReferralCode(normalized) && !isPending;

    const handleSubmit = () => {
        if (!canSubmit) return;
        setErrorMessage(null);
        setSuccessMessage(null);
        mutate(normalized, {
            onSuccess: (response) => {
                if (response.success) {
                    setSuccessMessage(`+${response.creditsAdded} crédits ajoutés !`);
                    setInput("");
                } else if (response.errorCode) {
                    setErrorMessage(ERROR_MESSAGES[response.errorCode] ?? "Erreur");
                } else {
                    setErrorMessage(response.message ?? "Erreur");
                }
            },
            onError: () => {
                setErrorMessage("Erreur réseau, réessaie.");
            },
        });
    };

    return (
        <div>
            <div className="text-sm font-bold text-text-primary mb-1">
                Tu as reçu un code d'un ami ?
            </div>
            <div className="text-xs text-text-secondary mb-3">
                Saisis-le ici pour recevoir 2 crédits gratuits.
            </div>
            <div className="flex gap-2 items-center mx-auto w-fit">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value.toUpperCase().slice(0, REFERRAL_CODE_LENGTH))}
                    placeholder="ABC23K"
                    maxLength={REFERRAL_CODE_LENGTH}
                    style={{ width: "11ch" }}
                    className="px-3 py-2.5 rounded-lg bg-secondary border border-border-color text-text-primary placeholder:text-text-secondary uppercase tracking-widest font-mono text-center text-lg focus:outline-none focus:border-cout-purple"
                />
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className="px-4 py-2.5 rounded-lg bg-cout-yellow text-cout-purple font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {isPending ? "…" : "Valider"}
                </button>
            </div>
            {errorMessage && (
                <div className="text-xs text-red-600 mt-2">{errorMessage}</div>
            )}
            {successMessage && (
                <div className="text-xs text-green-600 font-bold mt-2">{successMessage}</div>
            )}
        </div>
    );
}
