import { useState } from "react";
import { usePostHog } from "../../contexts/PostHogContext";
import type { PaywallProducts, CreditPack, SubscriptionType } from "../../api/hooks/usePaywallProducts";
import { ArrowPathIcon, ChevronLeftIcon } from "@heroicons/react/24/solid";
import {
    getPrice,
    getFormattedPrice,
    formatPrice,
    monthlyEquivalent,
    discountPercent,
    pricePerRecipe,
} from "../../utils/priceUtils";

export type PaywallTrigger =
    | 'quota_exceeded'
    | 'insufficient_credits'
    | 'navigation'
    | 'premium_page';

interface PaywallContentProps {
    products: PaywallProducts;
    variant: 'modal' | 'page';
    trigger?: PaywallTrigger;
    creditsSheetOpen?: boolean;
    onCreditsSheetOpenChange?: (open: boolean) => void;
}

const BENEFITS = [
    "Recettes illimitées (batch cooking, frigo vide, etc...)",
    "Recettes du jour (inclus mode flemme)",
    "Import Instagram illimité (+ mode \"Remasteriser\")",
    "Les prochaines mises à jour en premium",
];

const InlineBackArrow = ({ onClick }: { onClick: () => void }) => (
    <button
        onClick={onClick}
        className="flex items-center justify-center w-9 h-9 rounded-full bg-white hover:bg-white/90 shadow-md text-black p-0 mt-2 mb-4 cursor-pointer transition-colors duration-200"
        aria-label="Revenir à l'essai gratuit"
    >
        <ChevronLeftIcon className="w-[18px] h-[18px] -translate-x-[1px]" />
    </button>
);

export default function PaywallContent({
    products,
    variant,
    trigger = 'quota_exceeded',
    creditsSheetOpen,
    onCreditsSheetOpenChange,
}: PaywallContentProps) {
    const { trackEvent } = usePostHog();
    const isCreditsSheetControlled = creditsSheetOpen !== undefined;
    const [internalCreditsSheetOpen, setInternalCreditsSheetOpen] = useState(false);
    const showCreditsSheet = isCreditsSheetControlled ? creditsSheetOpen : internalCreditsSheetOpen;
    const setShowCreditsSheet = (open: boolean) => {
        if (isCreditsSheetControlled) onCreditsSheetOpenChange?.(open);
        else setInternalCreditsSheetOpen(open);
    };
    const [selectedCredits, setSelectedCredits] = useState<CreditPack>(20);
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionType>('yearly');

    const yearlyRaw = getPrice(products.iapYearly, products.premiumYearly);
    const monthlyRaw = getPrice(products.iapMonthly, products.premiumMonthly);
    const credits20Raw = getPrice(products.iapCredits20, products.credit20);
    const credits10Raw = getPrice(products.iapCredits10, products.credit10);

    const yearlyPrice = getFormattedPrice(products.iapYearly, products.premiumYearly);
    const monthlyPrice = getFormattedPrice(products.iapMonthly, products.premiumMonthly);
    const credits20Price = getFormattedPrice(products.iapCredits20, products.credit20);
    const credits10Price = getFormattedPrice(products.iapCredits10, products.credit10);

    const monthlyEquiv = yearlyRaw ? formatPrice(monthlyEquivalent(yearlyRaw)) : null;
    const yearlyDiscountPct = (yearlyRaw && monthlyRaw)
        ? discountPercent(monthlyRaw * 12, yearlyRaw)
        : null;
    const perRecipe20Raw = credits20Raw ? pricePerRecipe(credits20Raw, 20) : null;
    const perRecipe10Raw = credits10Raw ? pricePerRecipe(credits10Raw, 10) : null;
    const cheapestPerRecipe = [perRecipe20Raw, perRecipe10Raw]
        .filter((v): v is number => v != null)
        .sort((a, b) => a - b)[0] ?? null;
    const cheapestPerRecipeLabel = cheapestPerRecipe != null ? formatPrice(cheapestPerRecipe) : null;
    const perRecipe20 = perRecipe20Raw != null ? formatPrice(perRecipe20Raw) : null;
    const perRecipe10 = perRecipe10Raw != null ? formatPrice(perRecipe10Raw) : null;
    const credits20DiscountPct = (perRecipe20Raw && perRecipe10Raw)
        ? discountPercent(perRecipe10Raw * 20, perRecipe20Raw * 20)
        : null;

    const placeholder = '...';

    const handleTrialCta = async () => {
        trackEvent('paywall_plan_selected', {
            plan: selectedPlan === 'yearly' ? 'annual_trial' : 'monthly',
            trigger,
        });
        await products.purchaseSubscription(selectedPlan);
    };

    const handleSelectPlan = (plan: SubscriptionType) => {
        setSelectedPlan(plan);
    };

    const handleCreditsCta = async () => {
        trackEvent('paywall_plan_selected', {
            plan: 'credits',
            credits_pack: selectedCredits,
            trigger,
        });
        await products.purchaseCredits(selectedCredits);
    };

    const handleOpenCreditsSheet = () => {
        trackEvent('paywall_credits_sheet_opened', { trigger });
        setShowCreditsSheet(true);
    };

    const handleCloseCreditsSheet = () => {
        setShowCreditsSheet(false);
    };

    const containerPbClass = variant === 'modal' ? 'pb-6' : 'pb-10';

    if (showCreditsSheet) {
        return (
            <div className={`px-6 ${containerPbClass}`}>
                {!isCreditsSheetControlled && (
                    <InlineBackArrow onClick={handleCloseCreditsSheet} />
                )}

                <h2 className="text-white text-[22px] font-extrabold mt-3 mb-1.5 tracking-[-0.4px] leading-[1.15]">
                    Acheter des recettes
                </h2>
                <p className="text-white/80 text-sm mb-[18px] font-normal leading-[1.4]">
                    Sans engagement. Tes recettes restent à vie.
                </p>

                <div className="flex flex-col gap-3">
                    <CreditCard
                        selected={selectedCredits === 20}
                        title="20 recettes"
                        price={credits20Price ?? placeholder}
                        perRecipe={perRecipe20 ?? placeholder}
                        discountPct={credits20DiscountPct}
                        highlight
                        onClick={() => setSelectedCredits(20)}
                    />
                    <CreditCard
                        selected={selectedCredits === 10}
                        title="10 recettes"
                        price={credits10Price ?? placeholder}
                        perRecipe={perRecipe10 ?? placeholder}
                        discountPct={null}
                        highlight={false}
                        onClick={() => setSelectedCredits(10)}
                    />
                </div>

                {products.purchaseError && (
                    <div className="mt-3 py-2.5 px-3.5 bg-red-500/15 border border-red-500/30 rounded-xl text-white text-[13px] text-center">
                        {products.purchaseError}
                    </div>
                )}

                <div className="pt-5 pb-2">
                    <button
                        onClick={handleCreditsCta}
                        disabled={products.isPurchasing || products.isLoading}
                        className="w-full h-[52px] p-4 rounded-[14px] border-0 bg-[#EE6344] text-white text-[17px] font-bold tracking-[-0.2px] shadow-[0_6px_24px_rgba(24,13,13,0.18)] flex items-center justify-center gap-2 transition-transform duration-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
                    >
                        {products.isPurchasing ? (
                            <>
                                <ArrowPathIcon className="w-[18px] h-[18px] animate-spin" />
                                Achat en cours...
                            </>
                        ) : (
                            <>Acheter {selectedCredits === 20 ? credits20Price : credits10Price}</>
                        )}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`px-6 ${containerPbClass}`}>
            {variant === 'modal' && (
                <div className="text-center px-1.5 pb-1.5">
                    <h2 className="text-white text-[28px] font-extrabold m-0 mb-1.5 tracking-[-0.5px] leading-[1.15]">
                        7 jours offerts
                    </h2>
                    <p className="text-white/85 text-[15px] m-0 font-normal leading-[1.4]">
                        Tu décides après. Pas de mauvaise surprise.
                    </p>
                </div>
            )}

            <div className="pt-[18px] pb-1.5 flex flex-col gap-2.5">
                <div
                    onClick={() => handleSelectPlan('yearly')}
                    className={[
                        "relative overflow-hidden backdrop-blur-xl rounded-[20px] py-[18px] px-5 cursor-pointer transition-all duration-200 border-2",
                        selectedPlan === 'yearly'
                            ? "bg-white/95 border-white/95 shadow-[0_8px_32px_rgba(24,13,13,0.18)]"
                            : "bg-white/15 border-white/20 shadow-none",
                    ].join(" ")}
                >
                    {yearlyDiscountPct != null && (
                        <span className="absolute top-3 right-3 bg-[#f4cf77] text-[#180d0d] text-xs font-extrabold py-1 px-2.5 rounded-lg tracking-[0.3px]">
                            -{yearlyDiscountPct}%
                        </span>
                    )}
                    <div
                        className={[
                            "text-lg font-extrabold leading-[1.2]",
                            selectedPlan === 'yearly' ? "text-[#180d0d]" : "text-white",
                        ].join(" ")}
                    >
                        7 jours gratuits
                    </div>
                    <div
                        className={[
                            "mt-1.5 text-sm font-medium leading-[1.35]",
                            selectedPlan === 'yearly' ? "text-[#5b4b4b]" : "text-white/85",
                        ].join(" ")}
                    >
                        Puis {monthlyEquiv ?? placeholder}/mois{' '}
                        <span className={selectedPlan === 'yearly' ? "text-[#8a7676]" : "text-white/65"}>
                            (facturé {yearlyPrice ?? placeholder}/an)
                        </span>
                    </div>
                </div>

                <div
                    onClick={() => handleSelectPlan('monthly')}
                    className={[
                        "relative overflow-hidden backdrop-blur-xl rounded-[20px] py-3.5 px-5 cursor-pointer transition-all duration-200 border-2",
                        selectedPlan === 'monthly'
                            ? "bg-white/95 border-white/95 shadow-[0_8px_32px_rgba(24,13,13,0.18)]"
                            : "bg-white/15 border-white/20 shadow-none",
                    ].join(" ")}
                >
                    <div className="flex items-baseline justify-between gap-2">
                        <div
                            className={[
                                "text-base font-extrabold leading-[1.2]",
                                selectedPlan === 'monthly' ? "text-[#180d0d]" : "text-white",
                            ].join(" ")}
                        >
                            Mensuel
                        </div>
                        <div
                            className={[
                                "text-[15px] font-extrabold leading-none",
                                selectedPlan === 'monthly' ? "text-[#180d0d]" : "text-white",
                            ].join(" ")}
                        >
                            {monthlyPrice ?? placeholder}/mois
                        </div>
                    </div>
                    <div
                        className={[
                            "mt-1 text-[13px] font-medium",
                            selectedPlan === 'monthly' ? "text-[#5b4b4b]" : "text-white/70",
                        ].join(" ")}
                    >
                        7 jours gratuits inclus, sans engagement
                    </div>
                </div>
            </div>

            <ul className="list-none p-0 mt-3.5 flex flex-col gap-2.5">
                {BENEFITS.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-white text-sm font-medium leading-[1.4]">
                        <span className="text-sm leading-5 flex-shrink-0" aria-hidden="true">✅</span>
                        <span>{benefit}</span>
                    </li>
                ))}
            </ul>

            {products.purchaseError && (
                <div className="mt-3 py-2.5 px-3.5 bg-red-500/15 border border-red-500/30 rounded-xl text-white text-[13px] text-center">
                    {products.purchaseError}
                </div>
            )}

            <div className="pt-5 pb-1">
                <button
                    onClick={handleTrialCta}
                    disabled={products.isPurchasing || products.isLoading}
                    className="w-full h-[52px] px-4 rounded-[14px] border-0 bg-[#EE6344] text-white text-[17px] font-bold tracking-[-0.2px] shadow-[0_8px_24px_rgba(24,13,13,0.22)] flex items-center justify-center gap-2 transition-transform duration-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
                >
                    {products.isPurchasing ? (
                        <>
                            <ArrowPathIcon className="w-[18px] h-[18px] animate-spin" />
                            Activation...
                        </>
                    ) : (
                        'Activer mes 7 jours'
                    )}
                </button>
                <p className="mt-2 text-center text-white/85 text-[11px] font-medium">
                    Annule en 1 clic. Sans engagement.
                </p>
            </div>

            <div className="flex items-center gap-2.5 mt-[18px]">
                <div className="flex-1 h-px bg-white/25" />
                <span className="text-white/70 text-[11px] font-semibold uppercase tracking-[0.6px]">
                    ou
                </span>
                <div className="flex-1 h-px bg-white/25" />
            </div>

            <button
                onClick={handleOpenCreditsSheet}
                disabled={products.isPurchasing || products.isLoading}
                className="mt-3 w-full min-h-[60px] py-2.5 px-4 rounded-[14px] border-[1.5px] border-white/85 bg-white/10 text-white flex flex-col items-center justify-center gap-0.5 transition-colors duration-200 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
            >
                <span className="text-[15px] font-bold tracking-[-0.2px]">
                    Acheter des recettes à l'unité
                </span>
                <span className="text-xs font-medium text-white/85">
                    Dès {cheapestPerRecipeLabel ?? placeholder}/recette, sans abonnement
                </span>
            </button>

            <p className="text-center text-white/45 text-[10px] mt-3.5 leading-[1.4]">
                {selectedPlan === 'yearly'
                    ? <>Essai gratuit de 7 jours, puis {yearlyPrice ?? placeholder}/an. Annulable à tout moment.</>
                    : <>Essai gratuit de 7 jours, puis {monthlyPrice ?? placeholder}/mois. Annulable à tout moment.</>}
                <br />
                <a href="/legal/cgu" className="text-white/45 underline">
                    Conditions d'utilisation
                </a>
                {' · '}
                <a href="/legal/politique-de-confidentialite" className="text-white/45 underline">
                    Politique de confidentialité
                </a>
            </p>
        </div>
    );
}

interface CreditCardProps {
    selected: boolean;
    title: string;
    price: string;
    perRecipe: string;
    discountPct: number | null;
    highlight: boolean;
    onClick: () => void;
}

function CreditCard({ selected, title, price, perRecipe, discountPct, highlight, onClick }: CreditCardProps) {
    return (
        <div
            onClick={onClick}
            className={[
                "relative py-4 px-[18px] rounded-[18px] cursor-pointer transition-all duration-200 border-2",
                selected
                    ? "bg-white/95 border-white/95 shadow-[0_6px_24px_rgba(24,13,13,0.12)]"
                    : "bg-white/15 border-white/20 shadow-none",
            ].join(" ")}
        >
            {highlight && (
                <div className="absolute top-2.5 right-3 bg-[#f4cf77] text-[#180d0d] text-[11px] font-extrabold py-[3px] px-2 rounded-[7px] tracking-[0.3px]">
                    MEILLEURE OFFRE{discountPct != null ? ` -${discountPct}%` : ''}
                </div>
            )}
            <div
                className={[
                    "text-[13px] font-bold uppercase tracking-[0.8px]",
                    selected ? "text-[#180d0d]" : "text-white/90",
                ].join(" ")}
            >
                {title}
            </div>
            <div
                className={[
                    "mt-1.5 text-2xl font-extrabold leading-none tracking-[-0.6px]",
                    selected ? "text-[#180d0d]" : "text-white",
                ].join(" ")}
            >
                {price}
            </div>
            <div
                className={[
                    "mt-1 text-[13px] font-medium",
                    selected ? "text-[#8a7676]" : "text-white/70",
                ].join(" ")}
            >
                soit {perRecipe} / recette
            </div>
        </div>
    );
}
