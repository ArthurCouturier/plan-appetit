import { Capacitor } from '@capacitor/core';
import { AppTrackingTransparency, AppTrackingStatusResponse } from 'capacitor-plugin-app-tracking-transparency';
import { FacebookLogin } from '@capacitor-community/facebook-login';
import ConsentService from './ConsentService';
import { FacebookPixelService } from './FacebookPixelService';

export class TrackingService {
    private static isInitialized = false;
    private static attPrompted = false;

    public static async initialize(): Promise<void> {
        if (this.isInitialized) return;

        const hasConsent = await ConsentService.hasMarketingConsent();
        if (!hasConsent) {
            this.isInitialized = false;
            return;
        }

        if (Capacitor.isNativePlatform()) {
            if (Capacitor.getPlatform() === 'ios') {
                await this.configureAdvertiserTracking();
            }
        } else {
            await FacebookPixelService.initialize();
        }

        this.isInitialized = true;
    }

    /**
     * Demande la permission ATT au moment opportun (après une action significative).
     * À appeler après la 1ère génération de recette réussie, pas au lancement.
     */
    public static async promptATTIfNeeded(): Promise<string> {
        if (Capacitor.getPlatform() !== 'ios') return 'not-applicable';
        if (this.attPrompted) return await this.getTrackingStatus();

        const hasConsent = await ConsentService.hasMarketingConsent();
        if (!hasConsent) return 'no-consent';

        try {
            const status = await AppTrackingTransparency.getStatus();

            if (status.status === 'notDetermined') {
                this.attPrompted = true;
                const response: AppTrackingStatusResponse = await AppTrackingTransparency.requestPermission();
                await this.configureAdvertiserTracking();
                return response.status;
            }

            return status.status;
        } catch (error) {
            console.error('Error requesting ATT permission:', error);
            return 'error';
        }
    }

    /** Track PageView sur changement de route (SPA) — web uniquement */
    public static trackPageView(): void {
        if (!Capacitor.isNativePlatform()) {
            FacebookPixelService.trackPageView();
        }
    }

    private static async configureAdvertiserTracking(): Promise<void> {
        try {
            const status = await this.getTrackingStatus();
            const enabled = status === 'authorized';
            await FacebookLogin.setAdvertiserTrackingEnabled({ enabled });
            await FacebookLogin.setAutoLogAppEventsEnabled({ enabled: true });
        } catch (error) {
            console.error('Error configuring advertiser tracking:', error);
        }
    }

    public static async getTrackingStatus(): Promise<string> {
        if (Capacitor.getPlatform() !== 'ios') {
            return 'not-applicable';
        }

        try {
            const status = await AppTrackingTransparency.getStatus();
            return status.status;
        } catch (error) {
            console.error('Error getting ATT status:', error);
            return 'error';
        }
    }

    public static generateEventId(): string {
        return crypto.randomUUID();
    }

    // --- Core logging ---

    private static async logStandardEvent(
        nativeEventName: string,
        pixelEventName: string,
        params?: Record<string, unknown>,
        eventId?: string,
    ): Promise<void> {
        const hasConsent = await ConsentService.hasMarketingConsent();
        if (!hasConsent) return;

        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            if (Capacitor.isNativePlatform()) {
                await FacebookLogin.logEvent({ eventName: nativeEventName });
            } else {
                FacebookPixelService.trackEvent(pixelEventName, params, eventId);
            }
        } catch (error) {
            console.error('Error logging Meta event:', error);
        }
    }

    private static async logCustomEvent(
        eventName: string,
        params?: Record<string, unknown>,
        eventId?: string,
    ): Promise<void> {
        const hasConsent = await ConsentService.hasMarketingConsent();
        if (!hasConsent) return;

        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            if (Capacitor.isNativePlatform()) {
                await FacebookLogin.logEvent({ eventName });
            } else {
                FacebookPixelService.trackCustomEvent(eventName, params, eventId);
            }
        } catch (error) {
            console.error('Error logging Meta event:', error);
        }
    }

    // --- Standard Meta Events ---

    public static async logCompleteRegistration(method: string): Promise<string> {
        const eventId = this.generateEventId();
        await this.logStandardEvent(
            'fb_mobile_complete_registration',
            'CompleteRegistration',
            { content_name: method, status: true },
            eventId,
        );
        return eventId;
    }

    public static async logViewContent(contentId: string): Promise<string> {
        const eventId = this.generateEventId();
        await this.logStandardEvent(
            'fb_mobile_content_view',
            'ViewContent',
            { content_type: 'recipe', content_ids: [contentId] },
            eventId,
        );
        return eventId;
    }

    public static async logSearch(query: string): Promise<string> {
        const eventId = this.generateEventId();
        await this.logStandardEvent(
            'fb_mobile_search',
            'Search',
            { search_string: query },
            eventId,
        );
        return eventId;
    }

    public static async logInitiateCheckout(productType: string, value: number, currency: string = 'EUR'): Promise<string> {
        const eventId = this.generateEventId();
        await this.logStandardEvent(
            'fb_mobile_initiated_checkout',
            'InitiateCheckout',
            { content_type: productType, value, currency },
            eventId,
        );
        return eventId;
    }

    public static async logPurchase(value: number, currency: string = 'EUR', productType: string = ''): Promise<string> {
        const eventId = this.generateEventId();
        await this.logStandardEvent(
            'fb_mobile_purchase',
            'Purchase',
            { value, currency, content_type: productType },
            eventId,
        );
        return eventId;
    }

    public static async logSubscribe(value: number, currency: string = 'EUR'): Promise<string> {
        const eventId = this.generateEventId();
        await this.logStandardEvent(
            'Subscribe',
            'Subscribe',
            { value, currency, predicted_ltv: value },
            eventId,
        );
        return eventId;
    }

    public static async logAddToCart(contentId: string): Promise<string> {
        const eventId = this.generateEventId();
        await this.logStandardEvent(
            'fb_mobile_add_to_cart',
            'AddToCart',
            { content_type: 'recipe', content_ids: [contentId] },
            eventId,
        );
        return eventId;
    }

    public static async logLead(source: string): Promise<string> {
        const eventId = this.generateEventId();
        await this.logStandardEvent(
            'fb_mobile_level_achieved',
            'Lead',
            { content_name: source },
            eventId,
        );
        return eventId;
    }

    // --- Custom Events ---

    public static async logRecipeGenerated(source: string): Promise<string> {
        const eventId = this.generateEventId();
        await this.logCustomEvent('RecipeGenerated', { source }, eventId);
        return eventId;
    }

    public static async logRecipeGenerationFailed(source: string): Promise<string> {
        const eventId = this.generateEventId();
        await this.logCustomEvent('RecipeGenerationFailed', { source }, eventId);
        return eventId;
    }

    public static async logQuotaLimitReached(source: string): Promise<string> {
        const eventId = this.generateEventId();
        await this.logCustomEvent('QuotaLimitReached', { source }, eventId);
        return eventId;
    }

    public static async logCreditPackViewed(source: string): Promise<string> {
        const eventId = this.generateEventId();
        await this.logCustomEvent('CreditPackViewed', { source }, eventId);
        return eventId;
    }

    public static async logCollectionCreated(): Promise<string> {
        const eventId = this.generateEventId();
        await this.logCustomEvent('CollectionCreated', {}, eventId);
        return eventId;
    }

    public static async logInstagramImportStarted(): Promise<string> {
        const eventId = this.generateEventId();
        await this.logCustomEvent('InstagramImportStarted', {}, eventId);
        return eventId;
    }
}
