import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import StripeService from "../../api/services/StripeService";
import IAPService, { IAPProduct } from "../../api/services/IAPService";
import { Product } from "../../api/interfaces/stripe/Product";
import { CartItem } from "../../api/interfaces/stripe/CartItem";
import { XMarkIcon, SparklesIcon, CreditCardIcon, ArrowPathIcon } from "@heroicons/react/24/solid";
import useAuth from "../../api/hooks/useAuth";
import { TrackingService } from "../../api/services/TrackingService";

interface CreditPaywallModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreditPaywallModal({ isOpen, onClose }: CreditPaywallModalProps) {
    const [premiumProduct, setPremiumProduct] = useState<Product | null>(null);
    const [credit20Product, setCredit20Product] = useState<Product | null>(null);
    const [iapPremiumProduct, setIapPremiumProduct] = useState<IAPProduct | null>(null);
    const [iapCreditsProduct, setIapCreditsProduct] = useState<IAPProduct | null>(null);
    const [isNativeIOS, setIsNativeIOS] = useState(false);
    const [isIAPAvailable, setIsIAPAvailable] = useState(false);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [isPurchasingCredits, setIsPurchasingCredits] = useState(false);
    const [purchaseError, setPurchaseError] = useState<string | null>(null);
    const user = useAuth().user;
    const navigate = useNavigate();

    // Load products for modal
    useEffect(() => {
        if (isOpen) {
            const initProducts = async () => {
                // Detect platform
                const isIOS = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
                setIsNativeIOS(isIOS);

                // Initialize IAP on native platforms
                if (IAPService.isAvailable()) {
                    const iapAvailable = await IAPService.initialize();
                    setIsIAPAvailable(iapAvailable);

                    if (iapAvailable) {
                        const subProduct = await IAPService.getSubscriptionProduct();
                        setIapPremiumProduct(subProduct);

                        const creditsProduct = await IAPService.getCreditsProduct();
                        setIapCreditsProduct(creditsProduct);
                    }
                }

                // Fetch Stripe products for web only
                if (!isIOS) {
                    StripeService.fetchProduct(StripeService.PREMIUM_SUBSCRIPTION_MENSUAL)
                        .then(product => setPremiumProduct(product));
                    StripeService.fetchProduct(StripeService.CREDIT_TWENTY_RECIPES)
                        .then(product => setCredit20Product(product));
                }
            };

            initProducts();
        }
        TrackingService.logCreditPackViewed('paywall');
    }, [isOpen]);

    const handleSubscribe = async () => {
        TrackingService.logInitiateCheckout('premium_subscription', 0, 'EUR');
        setPurchaseError(null);

        // Use IAP on iOS
        if (isNativeIOS && isIAPAvailable && iapPremiumProduct) {
            setIsPurchasing(true);
            try {
                const result = await IAPService.purchaseSubscription();
                if (result.success && result.transactionId && user) {
                    const verified = await IAPService.verifySubscriptionPurchase(
                        result.transactionId,
                        user.email,
                        user.token || ""
                    );
                    if (verified) {
                        TrackingService.logSubscribe(iapPremiumProduct.price, iapPremiumProduct.currencyCode);
                        onClose();
                        navigate('/recettes');
                    } else {
                        setPurchaseError('Erreur de validation. Contactez le support.');
                    }
                } else if (result.error !== 'cancelled') {
                    setPurchaseError(result.error || 'Erreur lors de l\'achat');
                }
            } catch {
                setPurchaseError('Une erreur est survenue');
            } finally {
                setIsPurchasing(false);
            }
            return;
        }

        // Block Stripe on iOS
        if (isNativeIOS) {
            setPurchaseError('Achat non disponible');
            return;
        }

        // Use Stripe on web
        if (!premiumProduct) return;
        const cart: CartItem = {
            priceId: premiumProduct.prices[0].stripePriceId,
            quantity: 1
        };
        user && StripeService.checkout([cart], user);
    };

    const handleBuyCredits = async () => {
        setPurchaseError(null);
        TrackingService.logInitiateCheckout('credits', 0, 'EUR');

        // Use IAP on iOS
        if (isNativeIOS && isIAPAvailable && iapCreditsProduct) {
            setIsPurchasingCredits(true);
            try {
                const result = await IAPService.purchaseCredits();
                if (result.success && result.transactionId && user) {
                    const verified = await IAPService.verifyCreditsPurchase(
                        result.transactionId,
                        user.email,
                        user.token || ""
                    );
                    if (verified) {
                        TrackingService.logPurchase(iapCreditsProduct.price, iapCreditsProduct.currencyCode, 'credits');
                        onClose();
                        navigate('/recettes');
                    } else {
                        setPurchaseError('Erreur de validation. Contactez le support.');
                    }
                } else if (result.error !== 'cancelled') {
                    setPurchaseError(result.error || 'Erreur lors de l\'achat');
                }
            } catch {
                setPurchaseError('Une erreur est survenue');
            } finally {
                setIsPurchasingCredits(false);
            }
            return;
        }

        // Block Stripe on iOS
        if (isNativeIOS) {
            setPurchaseError('Achat non disponible');
            return;
        }

        // Use Stripe on web
        if (!credit20Product) return;
        const cart: CartItem = {
            priceId: credit20Product.prices[0].stripePriceId,
            quantity: 1
        };
        user && StripeService.checkout([cart], user);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-primary rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-cout-base to-cout-purple p-6 rounded-t-2xl flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">Crédits épuisés</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <XMarkIcon className="w-6 h-6 text-white" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-text-secondary text-center mb-6">
                        Rechargez vos crédits ou passez Premium pour générer des recettes illimitées
                    </p>

                    {/* Pricing Cards */}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        {/* Premium Card */}
                        <div className="relative bg-gradient-to-br from-cout-base to-cout-purple p-6 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300">
                            <div className="absolute -top-3 -right-3 bg-cout-yellow text-cout-purple px-3 py-1 rounded-full font-bold text-xs shadow-lg">
                                ⭐ Recommandé
                            </div>
                            <div className="text-white">
                                <div className="flex items-center gap-2 mb-2">
                                    <SparklesIcon className="w-6 h-6" />
                                    <h3 className="text-xl font-bold">Premium</h3>
                                </div>
                                <div className="text-3xl font-bold mb-3">
                                    {isNativeIOS
                                        ? (iapPremiumProduct ? iapPremiumProduct.priceString : '...')
                                        : (premiumProduct ? `${(premiumProduct.prices[0].unitAmount).toFixed(2)}€` : '...')}
                                    <span className="text-base font-normal">/mois</span>
                                </div>
                                <ul className="space-y-2 mb-6 text-sm">
                                    {[
                                        "Générations illimitées",
                                        "Personnalisation avancée",
                                        "Import Instagram (bientôt)",
                                        "Support prioritaire"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-2">
                                            <span className="text-cout-yellow">✓</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                {purchaseError && (
                                    <div className="mb-3 p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-xs">
                                        {purchaseError}
                                    </div>
                                )}
                                <button
                                    onClick={handleSubscribe}
                                    className="w-full py-3 bg-cout-yellow text-cout-purple font-bold rounded-lg hover:bg-yellow-400 transition-all duration-300 shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                                    disabled={isPurchasing || (isNativeIOS ? !iapPremiumProduct : !premiumProduct)}
                                >
                                    {isPurchasing ? (
                                        <>
                                            <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                            Achat...
                                        </>
                                    ) : (
                                        "S'abonner"
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Credits Card */}
                        <div className="bg-secondary border-2 border-border-color p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center gap-2 mb-2">
                                <CreditCardIcon className="w-6 h-6 text-cout-base" />
                                <h3 className="text-xl font-bold text-text-primary">Pack Crédits</h3>
                            </div>
                            <div className="text-3xl font-bold text-text-primary mb-3">
                                {isNativeIOS
                                    ? (iapCreditsProduct ? iapCreditsProduct.priceString : '...')
                                    : (credit20Product ? `${(credit20Product.prices[0].unitAmount).toFixed(2)}€` : '...')}
                            </div>
                            <ul className="space-y-2 mb-6 text-sm text-text-secondary">
                                {[
                                    "20 crédits de génération",
                                    "Valables à vie",
                                    "Personnalisation standard",
                                    "Parfait pour essayer"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-2">
                                        <span className="text-cout-base">✓</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={handleBuyCredits}
                                className="w-full py-3 bg-cout-base text-white font-bold rounded-lg hover:bg-indigo-500 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                                disabled={isPurchasingCredits || (isNativeIOS ? !iapCreditsProduct : !credit20Product)}
                            >
                                {isPurchasingCredits ? (
                                    <>
                                        <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                        Achat...
                                    </>
                                ) : (
                                    "Acheter"
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Bottom links */}
                    <div className="text-center space-y-3 pt-4 border-t border-border-color">
                        <button
                            onClick={() => navigate('/premium')}
                            className="text-cout-base hover:text-cout-purple font-semibold transition-colors"
                        >
                            En savoir plus sur Premium →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
