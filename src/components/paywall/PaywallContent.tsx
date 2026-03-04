import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePostHog } from "../../contexts/PostHogContext";
import type { PaywallProducts, SubscriptionType, CreditPack, ProductOption } from "../../api/hooks/usePaywallProducts";
import { ArrowPathIcon } from "@heroicons/react/24/solid";
import { getPrice, getFormattedPrice, formatPrice, monthlyEquivalent, discountPercent, pricePerRecipe, hasFreeTrial, getTrialText } from "../../utils/priceUtils";

interface PaywallContentProps {
    products: PaywallProducts;
    onClose?: () => void;
    variant: 'modal' | 'page';
}

export default function PaywallContent({ products, onClose, variant }: PaywallContentProps) {
    const [mode, setMode] = useState<'abo' | 'credits'>('abo');
    const [selectedAbo, setSelectedAbo] = useState<SubscriptionType>('yearly');
    const [selectedCredits, setSelectedCredits] = useState<CreditPack>(20);
    const ctaRef = useRef<HTMLButtonElement>(null);
    const navigate = useNavigate();
    const { trackEvent } = usePostHog();

    useEffect(() => {
        trackEvent('paywall_viewed', { variant });
    }, []);

    // Dynamic prices
    const yearlyRaw = getPrice(products.iapYearly, products.premiumYearly);
    const monthlyRaw = getPrice(products.iapMonthly, products.premiumMonthly);
    const credits20Raw = getPrice(products.iapCredits20, products.credit20);
    const credits10Raw = getPrice(products.iapCredits10, products.credit10);

    const yearlyPrice = getFormattedPrice(products.iapYearly, products.premiumYearly);
    const monthlyPrice = getFormattedPrice(products.iapMonthly, products.premiumMonthly);
    const credits20Price = getFormattedPrice(products.iapCredits20, products.credit20);
    const credits10Price = getFormattedPrice(products.iapCredits10, products.credit10);

    const monthlyEquiv = yearlyRaw ? formatPrice(monthlyEquivalent(yearlyRaw)) : null;
    const yearlyDiscountPct = (yearlyRaw && monthlyRaw) ? discountPercent(monthlyRaw * 12, yearlyRaw) : null;
    const perRecipe20 = credits20Raw ? formatPrice(pricePerRecipe(credits20Raw, 20)) : null;
    const perRecipe10 = credits10Raw ? formatPrice(pricePerRecipe(credits10Raw, 10)) : null;
    const credits20DiscountPct = (credits20Raw && credits10Raw)
        ? discountPercent(pricePerRecipe(credits10Raw, 10) * 20, credits20Raw) : null;

    const pricePlaceholder = '—';

    // Free trial detection (iOS only)
    const yearlyTrialText = getTrialText(products.iapYearly);
    const monthlyTrialText = getTrialText(products.iapMonthly);
    const selectedHasTrial = selectedAbo === 'yearly' ? hasFreeTrial(products.iapYearly) : hasFreeTrial(products.iapMonthly);
    const selectedTrialText = selectedAbo === 'yearly' ? yearlyTrialText : monthlyTrialText;

    const handleToggle = (tab: 'abo' | 'credits') => {
        setMode(tab);
        const eventName = tab === 'credits' ? 'paywall_toggle_credits' : 'paywall_toggle_subscription';
        trackEvent(eventName);
    };

    const handleSelectOption = (option: ProductOption) => {
        trackEvent('paywall_option_selected', { option });
        if (option === 'yearly' || option === 'monthly') {
            setSelectedAbo(option);
        } else {
            setSelectedCredits(option === 'credits_20' ? 20 : 10);
        }
    };

    const handleCTA = async () => {
        if (ctaRef.current) {
            ctaRef.current.style.transform = 'scale(0.97)';
            setTimeout(() => {
                if (ctaRef.current) ctaRef.current.style.transform = 'scale(1)';
            }, 150);
        }

        if (mode === 'abo') {
            await products.purchaseSubscription(selectedAbo);
        } else {
            await products.purchaseCredits(selectedCredits);
        }
    };

    const handleClose = () => {
        if (onClose) onClose();
        else navigate(-1);
    };

    const ctaText = mode === 'abo'
        ? selectedHasTrial
            ? `Commencer l'essai gratuit`
            : selectedAbo === 'yearly'
                ? `S'abonner — ${yearlyPrice ?? pricePlaceholder}/an`
                : `S'abonner — ${monthlyPrice ?? pricePlaceholder}/mois`
        : selectedCredits === 20
            ? `Acheter — ${credits20Price ?? pricePlaceholder}`
            : `Acheter — ${credits10Price ?? pricePlaceholder}`;

    const isCardSelected = (sel: boolean) => sel
        ? 'rgba(255,255,255,0.92)'
        : 'rgba(255,255,255,0.15)';

    const isCardBorder = (sel: boolean) => sel
        ? '2px solid rgba(255,255,255,0.95)'
        : '1px solid rgba(255,255,255,0.2)';

    const isCardShadow = (sel: boolean) => sel
        ? '0 8px 32px rgba(0,0,0,0.12)'
        : 'none';

    const textDark = (sel: boolean) => sel ? '#180d0d' : 'rgba(255,255,255,0.9)';
    const textPrice = (sel: boolean) => sel ? '#180d0d' : 'white';
    const textSub = (sel: boolean) => sel ? '#666' : 'rgba(255,255,255,0.6)';
    const textAccent = (sel: boolean) => sel ? '#f17c63' : 'rgba(255,255,255,0.7)';
    const badgeBg = (sel: boolean) => sel ? 'rgba(241,124,99,0.12)' : 'rgba(255,255,255,0.1)';
    const badgeColor = (sel: boolean) => sel ? '#e8694f' : 'rgba(255,255,255,0.7)';

    const RadioButton = ({ selected }: { selected: boolean }) => (
        <div style={{
            width: '24px', height: '24px', borderRadius: '50%',
            border: selected ? '2px solid #f17c63' : '2px solid rgba(255,255,255,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'all 0.2s ease',
        }}>
            {selected && (
                <div style={{
                    width: '14px', height: '14px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #f17c63, #e8694f)',
                }} />
            )}
        </div>
    );

    return (
        <div style={{ padding: '0 24px', paddingBottom: variant === 'modal' ? '24px' : '40px' }}>
            {/* Header */}
            {variant === 'modal' && (
                <div style={{ textAlign: 'center', padding: '0 6px 10px' }}>
                    <h2 style={{
                        color: 'white', fontSize: '28px', fontWeight: '800',
                        margin: '0 0 6px 0', letterSpacing: '-0.5px', lineHeight: '1.15',
                    }}>
                        Crédits épuisés
                    </h2>
                    <p style={{
                        color: 'rgba(255,255,255,0.8)', fontSize: '15px',
                        margin: 0, fontWeight: '400', lineHeight: '1.4',
                    }}>
                        Continuez à créer vos recettes
                    </p>
                </div>
            )}

            {/* Liquid Glass Toggle */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0 20px' }}>
                <div style={{
                    display: 'flex', position: 'relative',
                    background: 'rgba(255,255,255,0.12)',
                    backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                    borderRadius: '14px', padding: '4px',
                    border: '1px solid rgba(255,255,255,0.18)',
                    boxShadow: '0 2px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.15)',
                    width: '280px',
                }}>
                    <div style={{
                        position: 'absolute', top: '4px',
                        left: mode === 'abo' ? '4px' : 'calc(50%)',
                        width: 'calc(50% - 4px)', height: 'calc(100% - 8px)',
                        background: 'rgba(255,255,255,0.85)', borderRadius: '11px',
                        transition: 'left 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
                        zIndex: 0,
                    }} />
                    <button onClick={() => handleToggle('abo')} style={{
                        flex: 1, padding: '10px 0', border: 'none', background: 'transparent',
                        borderRadius: '11px', fontSize: '14px', fontWeight: '600',
                        color: mode === 'abo' ? '#e8694f' : 'rgba(255,255,255,0.85)',
                        cursor: 'pointer', transition: 'color 0.3s ease',
                        position: 'relative', zIndex: 1, letterSpacing: '-0.2px',
                    }}>
                        Abonnement
                    </button>
                    <button onClick={() => handleToggle('credits')} style={{
                        flex: 1, padding: '10px 0', border: 'none', background: 'transparent',
                        borderRadius: '11px', fontSize: '14px', fontWeight: '600',
                        color: mode === 'credits' ? '#e8694f' : 'rgba(255,255,255,0.85)',
                        cursor: 'pointer', transition: 'color 0.3s ease',
                        position: 'relative', zIndex: 1, letterSpacing: '-0.2px',
                    }}>
                        Crédits
                    </button>
                </div>
            </div>

            {/* Content */}
            {mode === 'abo' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Annual Card */}
                    <div
                        onClick={() => handleSelectOption('yearly')}
                        style={{
                            background: isCardSelected(selectedAbo === 'yearly'),
                            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                            borderRadius: '20px', padding: '20px',
                            border: isCardBorder(selectedAbo === 'yearly'),
                            cursor: 'pointer', transition: 'all 0.3s ease',
                            position: 'relative', overflow: 'hidden',
                            boxShadow: isCardShadow(selectedAbo === 'yearly'),
                        }}
                    >
                        <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '6px' }}>
                            {yearlyTrialText && (
                                <span style={{
                                    background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
                                    color: 'white', fontSize: '11px', fontWeight: '700',
                                    padding: '4px 10px', borderRadius: '8px', letterSpacing: '0.3px',
                                }}>
                                    🎁 {yearlyTrialText.toUpperCase()}
                                </span>
                            )}
                            <span style={{
                                background: 'linear-gradient(135deg, #f2a96f 0%, #f17c63 100%)',
                                color: 'white', fontSize: '11px', fontWeight: '700',
                                padding: '4px 10px', borderRadius: '8px', letterSpacing: '0.3px',
                            }}>
                                ⭐ RECOMMANDÉ
                            </span>
                        </div>
                        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                            <div style={{ marginTop: '2px' }}>
                                <RadioButton selected={selectedAbo === 'yearly'} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <span style={{
                                    fontSize: '13px', fontWeight: '700',
                                    color: textDark(selectedAbo === 'yearly'),
                                    textTransform: 'uppercase', letterSpacing: '0.8px',
                                }}>
                                    Annuel
                                </span>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px', marginBottom: '6px' }}>
                                    <span style={{
                                        fontSize: '32px', fontWeight: '800',
                                        color: textPrice(selectedAbo === 'yearly'),
                                        letterSpacing: '-1px', lineHeight: '1',
                                    }}>
                                        {yearlyPrice ?? pricePlaceholder}
                                    </span>
                                    <span style={{
                                        fontSize: '15px', fontWeight: '500',
                                        color: textSub(selectedAbo === 'yearly'),
                                    }}>
                                        /an
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{
                                        fontSize: '14px', fontWeight: '600',
                                        color: textAccent(selectedAbo === 'yearly'),
                                    }}>
                                        soit {monthlyEquiv ?? pricePlaceholder}/mois
                                    </span>
                                    {yearlyDiscountPct != null && (
                                    <span style={{
                                        background: badgeBg(selectedAbo === 'yearly'),
                                        color: badgeColor(selectedAbo === 'yearly'),
                                        fontSize: '12px', fontWeight: '700',
                                        padding: '2px 8px', borderRadius: '6px',
                                    }}>
                                        -{yearlyDiscountPct}%
                                    </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Monthly Card */}
                    <div
                        onClick={() => handleSelectOption('monthly')}
                        style={{
                            background: isCardSelected(selectedAbo === 'monthly'),
                            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                            borderRadius: '20px', padding: '18px 20px',
                            border: isCardBorder(selectedAbo === 'monthly'),
                            cursor: 'pointer', transition: 'all 0.3s ease',
                            boxShadow: isCardShadow(selectedAbo === 'monthly'),
                            position: 'relative', overflow: 'hidden',
                        }}
                    >
                        {monthlyTrialText && (
                            <div style={{
                                position: 'absolute', top: '12px', right: '12px',
                                background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
                                color: 'white', fontSize: '11px', fontWeight: '700',
                                padding: '4px 10px', borderRadius: '8px', letterSpacing: '0.3px',
                            }}>
                                🎁 {monthlyTrialText.toUpperCase()}
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                            <RadioButton selected={selectedAbo === 'monthly'} />
                            <div style={{ flex: 1 }}>
                                <span style={{
                                    fontSize: '13px', fontWeight: '700',
                                    color: textDark(selectedAbo === 'monthly'),
                                    textTransform: 'uppercase', letterSpacing: '0.8px',
                                }}>
                                    Mensuel
                                </span>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '4px' }}>
                                    <span style={{
                                        fontSize: '28px', fontWeight: '800',
                                        color: textPrice(selectedAbo === 'monthly'),
                                        letterSpacing: '-0.8px', lineHeight: '1',
                                    }}>
                                        {monthlyPrice ?? pricePlaceholder}
                                    </span>
                                    <span style={{
                                        fontSize: '15px', fontWeight: '500',
                                        color: textSub(selectedAbo === 'monthly'),
                                    }}>
                                        /mois
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Features List */}
                    <div style={{ padding: '12px 4px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {["Générations illimitées", "Recettes du jour complètes", "Import Instagram", "Collections illimitées"].map((feat, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '14px', color: 'white' }}>✓</span>
                                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: '500' }}>
                                    {feat}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* 20 Credits Card */}
                    <div
                        onClick={() => handleSelectOption('credits_20')}
                        style={{
                            background: isCardSelected(selectedCredits === 20),
                            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                            borderRadius: '20px', padding: '20px',
                            border: isCardBorder(selectedCredits === 20),
                            cursor: 'pointer', transition: 'all 0.3s ease',
                            position: 'relative',
                            boxShadow: isCardShadow(selectedCredits === 20),
                        }}
                    >
                        <div style={{
                            position: 'absolute', top: '12px', right: '12px',
                            background: 'linear-gradient(135deg, #f2a96f 0%, #f17c63 100%)',
                            color: 'white', fontSize: '11px', fontWeight: '700',
                            padding: '4px 10px', borderRadius: '8px', letterSpacing: '0.3px',
                        }}>
                            MEILLEURE OFFRE
                        </div>
                        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                            <div style={{ marginTop: '2px' }}>
                                <RadioButton selected={selectedCredits === 20} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <span style={{
                                    fontSize: '13px', fontWeight: '700',
                                    color: textDark(selectedCredits === 20),
                                    textTransform: 'uppercase', letterSpacing: '0.8px',
                                }}>
                                    20 crédits
                                </span>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '6px', marginBottom: '6px' }}>
                                    <span style={{
                                        fontSize: '32px', fontWeight: '800',
                                        color: textPrice(selectedCredits === 20),
                                        letterSpacing: '-1px', lineHeight: '1',
                                    }}>
                                        {credits20Price ?? pricePlaceholder}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{
                                        fontSize: '14px', fontWeight: '600',
                                        color: textAccent(selectedCredits === 20),
                                    }}>
                                        soit {perRecipe20 ?? pricePlaceholder}/recette
                                    </span>
                                    {credits20DiscountPct != null && (
                                    <span style={{
                                        background: badgeBg(selectedCredits === 20),
                                        color: badgeColor(selectedCredits === 20),
                                        fontSize: '12px', fontWeight: '700',
                                        padding: '2px 8px', borderRadius: '6px',
                                    }}>
                                        -{credits20DiscountPct}%
                                    </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 10 Credits Card */}
                    <div
                        onClick={() => handleSelectOption('credits_10')}
                        style={{
                            background: isCardSelected(selectedCredits === 10),
                            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                            borderRadius: '20px', padding: '18px 20px',
                            border: isCardBorder(selectedCredits === 10),
                            cursor: 'pointer', transition: 'all 0.3s ease',
                            boxShadow: isCardShadow(selectedCredits === 10),
                        }}
                    >
                        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                            <RadioButton selected={selectedCredits === 10} />
                            <div style={{ flex: 1 }}>
                                <span style={{
                                    fontSize: '13px', fontWeight: '700',
                                    color: textDark(selectedCredits === 10),
                                    textTransform: 'uppercase', letterSpacing: '0.8px',
                                }}>
                                    10 crédits
                                </span>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
                                    <span style={{
                                        fontSize: '28px', fontWeight: '800',
                                        color: textPrice(selectedCredits === 10),
                                        letterSpacing: '-0.8px', lineHeight: '1',
                                    }}>
                                        {credits10Price ?? pricePlaceholder}
                                    </span>
                                    <span style={{
                                        fontSize: '13px', fontWeight: '500',
                                        color: selectedCredits === 10 ? '#999' : 'rgba(255,255,255,0.5)',
                                    }}>
                                        soit {perRecipe10 ?? pricePlaceholder}/recette
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tip Box */}
                    <div style={{
                        padding: '14px 16px',
                        background: 'rgba(255,255,255,0.08)',
                        borderRadius: '14px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex', alignItems: 'center', gap: '10px',
                    }}>
                        <span style={{ fontSize: '16px' }}>💡</span>
                        <p style={{
                            margin: 0, color: 'rgba(255,255,255,0.8)',
                            fontSize: '13px', lineHeight: '1.4', fontWeight: '400',
                        }}>
                            <strong style={{ color: 'white', fontWeight: '600' }}>Astuce :</strong>{' '}
                            L'abonnement annuel revient à{' '}
                            <strong style={{ color: 'white' }}>{monthlyEquiv ?? pricePlaceholder}/mois</strong>{' '}
                            pour des recettes <em>illimitées</em>
                        </p>
                    </div>
                </div>
            )}

            {/* Error */}
            {products.purchaseError && (
                <div style={{
                    marginTop: '12px', padding: '10px 14px',
                    background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: '12px', color: 'white', fontSize: '13px', textAlign: 'center',
                }}>
                    {products.purchaseError}
                </div>
            )}

            {/* CTA Button */}
            <div style={{ padding: '24px 0 8px' }}>
                <button
                    ref={ctaRef}
                    onClick={handleCTA}
                    disabled={products.isPurchasing || products.isLoading}
                    style={{
                        width: '100%', padding: '17px', borderRadius: '16px',
                        border: 'none',
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))',
                        color: '#e8694f', fontSize: '17px', fontWeight: '700',
                        cursor: products.isPurchasing ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                        letterSpacing: '-0.2px', transition: 'transform 0.2s ease',
                        opacity: products.isPurchasing ? 0.7 : 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    }}
                >
                    {products.isPurchasing ? (
                        <>
                            <ArrowPathIcon style={{ width: '18px', height: '18px' }} className="animate-spin" />
                            Achat en cours...
                        </>
                    ) : ctaText}
                </button>
            </div>

            {/* Continue without Premium */}
            <p
                onClick={handleClose}
                style={{
                    textAlign: 'center', color: 'rgba(255,255,255,0.5)',
                    fontSize: '13px', margin: '4px 0 0', fontWeight: '400', cursor: 'pointer',
                }}
            >
                Continuer sans Premium
            </p>

            {/* Legal */}
            <p style={{
                textAlign: 'center', color: 'rgba(255,255,255,0.3)',
                fontSize: '10px', margin: '16px 0 0', lineHeight: '1.4',
            }}>
                {mode === 'abo' && selectedHasTrial ? (
                    <>
                        Essai gratuit de {selectedTrialText}, puis {selectedAbo === 'yearly' ? `${yearlyPrice ?? pricePlaceholder}/an` : `${monthlyPrice ?? pricePlaceholder}/mois`}.
                        {' '}Annulable à tout moment.
                    </>
                ) : (
                    <>Renouvellement automatique. Annulable à tout moment.</>
                )}
                <br />
                <a href="/legal/cgu" style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'underline' }}>
                    Conditions d'utilisation
                </a>
                {' · '}
                <a href="/legal/politique-de-confidentialite" style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'underline' }}>
                    Politique de confidentialité
                </a>
            </p>
        </div>
    );
}
