import { Capacitor } from '@capacitor/core';
import { NativePurchases, PURCHASE_TYPE, Product } from '@capgo/native-purchases';

export interface IAPProduct {
    identifier: string;
    title: string;
    description: string;
    priceString: string;
    price: number;
    currencyCode: string;
}

export interface IAPPurchaseResult {
    success: boolean;
    transactionId?: string;
    error?: string;
}

export default class IAPService {
    // Product IDs - must match App Store Connect / Google Play Console
    static readonly PREMIUM_MONTHLY_IOS = 'fr.planappetit.premium.monthly';
    static readonly PREMIUM_MONTHLY_ANDROID = 'fr.planappetit.premium.monthly';
    static readonly CREDITS_20_IOS = 'fr.planappetit.credits.20';
    static readonly CREDITS_20_ANDROID = 'fr.planappetit.credits.20';

    // Android base plan ID (required for subscriptions)
    static readonly ANDROID_MONTHLY_PLAN = 'monthly-plan';

    private static initialized = false;

    /**
     * Check if IAP is available on current platform
     */
    static isAvailable(): boolean {
        return Capacitor.isNativePlatform();
    }

    /**
     * Check if current platform is iOS
     */
    static isIOS(): boolean {
        return Capacitor.getPlatform() === 'ios';
    }

    /**
     * Check if current platform is Android
     */
    static isAndroid(): boolean {
        return Capacitor.getPlatform() === 'android';
    }

    /**
     * Initialize IAP and check billing support
     */
    static async initialize(): Promise<boolean> {
        if (!this.isAvailable()) {
            console.log('IAP not available on this platform');
            return false;
        }

        if (this.initialized) {
            return true;
        }

        try {
            const { isBillingSupported } = await NativePurchases.isBillingSupported();
            this.initialized = isBillingSupported;
            console.log('IAP billing supported:', isBillingSupported);
            return isBillingSupported;
        } catch (error) {
            console.error('Failed to initialize IAP:', error);
            return false;
        }
    }

    /**
     * Get the correct subscription product ID for current platform
     */
    static getSubscriptionProductId(): string {
        return this.isIOS() ? this.PREMIUM_MONTHLY_IOS : this.PREMIUM_MONTHLY_ANDROID;
    }

    /**
     * Get the correct credits product ID for current platform
     */
    static getCreditsProductId(): string {
        return this.isIOS() ? this.CREDITS_20_IOS : this.CREDITS_20_ANDROID;
    }

    /**
     * Fetch subscription product info from the store
     * Returns title and price from Apple/Google (required by Apple guidelines)
     */
    static async getSubscriptionProduct(): Promise<IAPProduct | null> {
        if (!await this.initialize()) {
            return null;
        }

        try {
            const productId = this.getSubscriptionProductId();
            const { product } = await NativePurchases.getProduct({
                productIdentifier: productId,
                productType: PURCHASE_TYPE.SUBS
            });

            if (!product) {
                console.error('Product not found:', productId);
                return null;
            }

            return this.mapProduct(product);
        } catch (error) {
            console.error('Failed to fetch subscription product:', error);
            return null;
        }
    }

    /**
     * Fetch credits product info from the store
     */
    static async getCreditsProduct(): Promise<IAPProduct | null> {
        if (!await this.initialize()) {
            return null;
        }

        try {
            const productId = this.getCreditsProductId();
            const { product } = await NativePurchases.getProduct({
                productIdentifier: productId,
                productType: PURCHASE_TYPE.INAPP
            });

            if (!product) {
                console.error('Credits product not found:', productId);
                return null;
            }

            return this.mapProduct(product);
        } catch (error) {
            console.error('Failed to fetch credits product:', error);
            return null;
        }
    }

    /**
     * Map native product to our interface
     */
    private static mapProduct(product: Product): IAPProduct {
        return {
            identifier: product.identifier,
            title: product.title,
            description: product.description || '',
            priceString: product.priceString,
            price: product.price,
            currencyCode: product.currencyCode || 'EUR'
        };
    }

    /**
     * Purchase subscription
     * On success, returns transactionId to verify with backend
     */
    static async purchaseSubscription(): Promise<IAPPurchaseResult> {
        if (!await this.initialize()) {
            return { success: false, error: 'IAP not available' };
        }

        try {
            const productId = this.getSubscriptionProductId();

            const purchaseParams: {
                productIdentifier: string;
                productType: PURCHASE_TYPE;
                quantity: number;
                planIdentifier?: string;
            } = {
                productIdentifier: productId,
                productType: PURCHASE_TYPE.SUBS,
                quantity: 1
            };

            // Android requires planIdentifier for subscriptions
            if (this.isAndroid()) {
                purchaseParams.planIdentifier = this.ANDROID_MONTHLY_PLAN;
            }

            const result = await NativePurchases.purchaseProduct(purchaseParams);

            if (result.transactionId) {
                console.log('Purchase successful, transactionId:', result.transactionId);
                return {
                    success: true,
                    transactionId: result.transactionId
                };
            } else {
                return { success: false, error: 'No transaction ID returned' };
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Purchase failed:', errorMessage);

            // Check for user cancellation
            if (errorMessage.includes('cancel') || errorMessage.includes('Cancel')) {
                return { success: false, error: 'cancelled' };
            }

            return { success: false, error: errorMessage };
        }
    }

    /**
     * Purchase credits (consumable)
     * On success, returns transactionId to verify with backend
     */
    static async purchaseCredits(): Promise<IAPPurchaseResult> {
        if (!await this.initialize()) {
            return { success: false, error: 'IAP not available' };
        }

        try {
            const productId = this.getCreditsProductId();

            const result = await NativePurchases.purchaseProduct({
                productIdentifier: productId,
                productType: PURCHASE_TYPE.INAPP,
                quantity: 1
            });

            if (result.transactionId) {
                console.log('Credits purchase successful, transactionId:', result.transactionId);
                return {
                    success: true,
                    transactionId: result.transactionId
                };
            } else {
                return { success: false, error: 'No transaction ID returned' };
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Credits purchase failed:', errorMessage);

            if (errorMessage.includes('cancel') || errorMessage.includes('Cancel')) {
                return { success: false, error: 'cancelled' };
            }

            return { success: false, error: errorMessage };
        }
    }

    /**
     * Restore previous purchases
     * Useful when user reinstalls app or switches device
     */
    static async restorePurchases(): Promise<boolean> {
        if (!await this.initialize()) {
            return false;
        }

        try {
            await NativePurchases.restorePurchases();
            console.log('Purchases restored successfully');
            return true;
        } catch (error) {
            console.error('Failed to restore purchases:', error);
            return false;
        }
    }

    /**
     * Open native subscription management
     * iOS: Settings > Apple ID > Subscriptions
     * Android: Play Store > Subscriptions
     */
    static async manageSubscriptions(): Promise<void> {
        if (!this.isAvailable()) {
            return;
        }

        try {
            await NativePurchases.manageSubscriptions();
        } catch (error) {
            console.error('Failed to open subscription management:', error);
        }
    }

    /**
     * Verify subscription purchase with backend and activate premium
     */
    static async verifySubscriptionPurchase(
        transactionId: string,
        email: string,
        token: string
    ): Promise<boolean> {
        return this.verifyPurchaseWithBackend(transactionId, email, token, this.getSubscriptionProductId());
    }

    /**
     * Verify credits purchase with backend
     */
    static async verifyCreditsPurchase(
        transactionId: string,
        email: string,
        token: string
    ): Promise<boolean> {
        return this.verifyPurchaseWithBackend(transactionId, email, token, this.getCreditsProductId());
    }

    /**
     * Internal method to verify purchase with backend
     */
    private static async verifyPurchaseWithBackend(
        transactionId: string,
        email: string,
        token: string,
        productId: string
    ): Promise<boolean> {
        // Skip backend verification for StoreKit local testing (transactionId is "0" or very short)
        // This should NEVER be enabled in production
        if (import.meta.env.VITE_IAP_SKIP_VERIFICATION === 'true') {
            console.warn('IAP verification skipped (VITE_IAP_SKIP_VERIFICATION=true)');
            return true;
        }

        try {
            const platform = this.isIOS() ? 'apple' : 'google';
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}:${import.meta.env.VITE_API_PORT}/api/v1/iap/${platform}/verify`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'Email': email
                    },
                    body: JSON.stringify({
                        transactionId,
                        productId
                    })
                }
            );

            if (!response.ok) {
                console.error('Backend verification failed:', response.status);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Failed to verify purchase with backend:', error);
            return false;
        }
    }
}
