import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import StripeService from "../services/StripeService";
import IAPService, { IAPProduct } from "../services/IAPService";
import { Product } from "../interfaces/stripe/Product";
import { CartItem } from "../interfaces/stripe/CartItem";
import { TrackingService } from "../services/TrackingService";
import { usePostHog } from "../../contexts/PostHogContext";
import useAuth from "./useAuth";

export type SubscriptionType = 'monthly' | 'yearly';
export type CreditPack = 10 | 20;
export type ProductOption = 'yearly' | 'monthly' | 'credits_20' | 'credits_10';

export interface PaywallProducts {
    // Stripe products (web)
    premiumMonthly: Product | null;
    premiumYearly: Product | null;
    credit20: Product | null;
    credit10: Product | null;
    // IAP products (native)
    iapMonthly: IAPProduct | null;
    iapYearly: IAPProduct | null;
    iapCredits20: IAPProduct | null;
    iapCredits10: IAPProduct | null;
    // Platform state
    isNativeIOS: boolean;
    isIAPAvailable: boolean;
    isLoading: boolean;
    // Purchase
    isPurchasing: boolean;
    purchaseError: string | null;
    clearError: () => void;
    purchaseSubscription: (type: SubscriptionType) => Promise<void>;
    purchaseCredits: (pack: CreditPack) => Promise<void>;
}

export default function usePaywallProducts(): PaywallProducts {
    const [premiumMonthly, setPremiumMonthly] = useState<Product | null>(null);
    const [premiumYearly, setPremiumYearly] = useState<Product | null>(null);
    const [credit20, setCredit20] = useState<Product | null>(null);
    const [credit10, setCredit10] = useState<Product | null>(null);

    const [iapMonthly, setIapMonthly] = useState<IAPProduct | null>(null);
    const [iapYearly, setIapYearly] = useState<IAPProduct | null>(null);
    const [iapCredits20, setIapCredits20] = useState<IAPProduct | null>(null);
    const [iapCredits10, setIapCredits10] = useState<IAPProduct | null>(null);

    const [isNativeIOS, setIsNativeIOS] = useState(false);
    const [isIAPAvailable, setIsIAPAvailable] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [purchaseError, setPurchaseError] = useState<string | null>(null);

    const user = useAuth().user;
    const navigate = useNavigate();
    const { trackEvent } = usePostHog();

    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            const isIOS = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
            setIsNativeIOS(isIOS);

            if (IAPService.isAvailable()) {
                const available = await IAPService.initialize();
                setIsIAPAvailable(available);

                if (available) {
                    const [monthly, yearly, credits20, credits10] = await Promise.all([
                        IAPService.getSubscriptionProduct('monthly'),
                        IAPService.getSubscriptionProduct('yearly'),
                        IAPService.getCreditsProduct(20),
                        IAPService.getCreditsProduct(10),
                    ]);
                    setIapMonthly(monthly);
                    setIapYearly(yearly);
                    setIapCredits20(credits20);
                    setIapCredits10(credits10);
                }
            }

            if (!isIOS) {
                const [monthly, yearly, c20, c10] = await Promise.all([
                    StripeService.fetchProduct(StripeService.PREMIUM_SUBSCRIPTION_MENSUAL).catch(() => null),
                    StripeService.fetchProduct(StripeService.PREMIUM_SUBSCRIPTION_YEARLY).catch(() => null),
                    StripeService.fetchProduct(StripeService.CREDIT_TWENTY_RECIPES).catch(() => null),
                    StripeService.fetchProduct(StripeService.CREDIT_TEN_RECIPES).catch(() => null),
                ]);
                setPremiumMonthly(monthly);
                setPremiumYearly(yearly);
                setCredit20(c20);
                setCredit10(c10);
            }

            setIsLoading(false);
        };

        init();
    }, []);

    const clearError = useCallback(() => setPurchaseError(null), []);

    const purchaseSubscription = useCallback(async (type: SubscriptionType) => {
        setPurchaseError(null);
        const productType: ProductOption = type === 'yearly' ? 'yearly' : 'monthly';
        TrackingService.logInitiateCheckout('premium_subscription', 0, 'EUR');
        trackEvent('checkout_started', { product_type: productType, payment_method: isNativeIOS ? 'iap' : 'stripe' });

        if (isNativeIOS && isIAPAvailable) {
            const iapProduct = type === 'yearly' ? iapYearly : iapMonthly;
            if (!iapProduct) return;

            setIsPurchasing(true);
            try {
                const result = await IAPService.purchaseSubscription(type);
                if (result.success && result.transactionId && user) {
                    const verified = await IAPService.verifySubscriptionPurchase(
                        result.transactionId, user.email, user.token || "", type
                    );
                    if (verified) {
                        TrackingService.logSubscribe(iapProduct.price, iapProduct.currencyCode);
                        trackEvent('purchase_completed', { product_type: productType, amount: iapProduct.price });
                        navigate('/recettes');
                    } else {
                        setPurchaseError('Erreur de validation. Contactez le support.');
                    }
                } else if (result.error !== 'cancelled') {
                    setPurchaseError(result.error || "Erreur lors de l'achat");
                }
            } catch {
                setPurchaseError('Une erreur est survenue');
            } finally {
                setIsPurchasing(false);
            }
            return;
        }

        if (isNativeIOS) {
            setPurchaseError('Achat non disponible');
            return;
        }

        const stripeProduct = type === 'yearly' ? premiumYearly : premiumMonthly;
        if (!stripeProduct || !user) return;
        const cart: CartItem = { priceId: stripeProduct.prices[0].stripePriceId, quantity: 1 };
        StripeService.checkout([cart], user);
    }, [isNativeIOS, isIAPAvailable, iapYearly, iapMonthly, premiumYearly, premiumMonthly, user, navigate, trackEvent]);

    const purchaseCredits = useCallback(async (pack: CreditPack) => {
        setPurchaseError(null);
        const productType: ProductOption = pack === 20 ? 'credits_20' : 'credits_10';
        TrackingService.logInitiateCheckout('credits', 0, 'EUR');
        trackEvent('checkout_started', { product_type: productType, payment_method: isNativeIOS ? 'iap' : 'stripe' });

        if (isNativeIOS && isIAPAvailable) {
            const iapProduct = pack === 20 ? iapCredits20 : iapCredits10;
            if (!iapProduct) return;

            setIsPurchasing(true);
            try {
                const result = await IAPService.purchaseCredits(pack);
                if (result.success && result.transactionId && user) {
                    const verified = await IAPService.verifyCreditsPurchase(
                        result.transactionId, user.email, user.token || "", pack
                    );
                    if (verified) {
                        TrackingService.logPurchase(iapProduct.price, iapProduct.currencyCode, 'credits');
                        trackEvent('purchase_completed', { product_type: productType, amount: iapProduct.price });
                        navigate('/recettes');
                    } else {
                        setPurchaseError('Erreur de validation. Contactez le support.');
                    }
                } else if (result.error !== 'cancelled') {
                    setPurchaseError(result.error || "Erreur lors de l'achat");
                }
            } catch {
                setPurchaseError('Une erreur est survenue');
            } finally {
                setIsPurchasing(false);
            }
            return;
        }

        if (isNativeIOS) {
            setPurchaseError('Achat non disponible');
            return;
        }

        const stripeProduct = pack === 20 ? credit20 : credit10;
        if (!stripeProduct || !user) return;
        const cart: CartItem = { priceId: stripeProduct.prices[0].stripePriceId, quantity: 1 };
        StripeService.checkout([cart], user);
    }, [isNativeIOS, isIAPAvailable, iapCredits20, iapCredits10, credit20, credit10, user, navigate, trackEvent]);

    return {
        premiumMonthly, premiumYearly, credit20, credit10,
        iapMonthly, iapYearly, iapCredits20, iapCredits10,
        isNativeIOS, isIAPAvailable, isLoading,
        isPurchasing, purchaseError, clearError,
        purchaseSubscription, purchaseCredits,
    };
}
