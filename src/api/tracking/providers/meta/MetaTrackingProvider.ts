import { Capacitor } from '@capacitor/core';
import { AppTrackingTransparency, AppTrackingStatusResponse } from 'capacitor-plugin-app-tracking-transparency';
import { FacebookLogin } from '@capacitor-community/facebook-login';
import { TrackingEvent } from '../../events/TrackingEvent';
import { AbstractTrackingProvider } from '../AbstractTrackingProvider';
import ConsentService from '../../consent/ConsentService';
import { FacebookPixelService } from './FacebookPixelService';

const STANDARD_EVENTS = new Set<TrackingEvent>([
    TrackingEvent.COMPLETE_REGISTRATION,
    TrackingEvent.VIEW_CONTENT,
    TrackingEvent.SEARCH,
    TrackingEvent.INITIATE_CHECKOUT,
    TrackingEvent.PURCHASE,
    TrackingEvent.SUBSCRIBE,
    TrackingEvent.ADD_TO_CART,
    TrackingEvent.LEAD,
]);

export class MetaTrackingProvider extends AbstractTrackingProvider {
    private isInitialized = false;
    private attPrompted = false;

    protected readonly eventMap: Record<TrackingEvent, string> = {
        // Standard events — Pixel names (web)
        [TrackingEvent.COMPLETE_REGISTRATION]: 'CompleteRegistration',
        [TrackingEvent.VIEW_CONTENT]: 'ViewContent',
        [TrackingEvent.SEARCH]: 'Search',
        [TrackingEvent.INITIATE_CHECKOUT]: 'InitiateCheckout',
        [TrackingEvent.PURCHASE]: 'Purchase',
        [TrackingEvent.SUBSCRIBE]: 'Subscribe',
        [TrackingEvent.ADD_TO_CART]: 'AddToCart',
        [TrackingEvent.LEAD]: 'Lead',
        // Custom events
        [TrackingEvent.RECIPE_GENERATED]: 'RecipeGenerated',
        [TrackingEvent.RECIPE_GENERATION_INITIATED]: 'RecipeGenerationInitiated',
        [TrackingEvent.RECIPE_GENERATION_FAILED]: 'RecipeGenerationFailed',
        [TrackingEvent.QUOTA_LIMIT_REACHED]: 'QuotaLimitReached',
        [TrackingEvent.CREDIT_PACK_VIEWED]: 'CreditPackViewed',
        [TrackingEvent.FRIDGE_FINISHED_STEP3]: 'FridgeFinishedStep3',
        [TrackingEvent.INSTAGRAM_IMPORT_STARTED]: 'InstagramImportStarted',
        [TrackingEvent.INSTAGRAM_IMPORT_FINISHED]: 'InstagramImportFinished',
    };

    private readonly nativeEventMap: Record<TrackingEvent, string> = {
        [TrackingEvent.COMPLETE_REGISTRATION]: 'fb_mobile_complete_registration',
        [TrackingEvent.VIEW_CONTENT]: 'fb_mobile_content_view',
        [TrackingEvent.SEARCH]: 'fb_mobile_search',
        [TrackingEvent.INITIATE_CHECKOUT]: 'fb_mobile_initiated_checkout',
        [TrackingEvent.PURCHASE]: 'fb_mobile_purchase',
        [TrackingEvent.SUBSCRIBE]: 'Subscribe',
        [TrackingEvent.ADD_TO_CART]: 'fb_mobile_add_to_cart',
        [TrackingEvent.LEAD]: 'fb_mobile_level_achieved',
        [TrackingEvent.RECIPE_GENERATED]: 'RecipeGenerated',
        [TrackingEvent.RECIPE_GENERATION_INITIATED]: 'RecipeGenerationInitiated',
        [TrackingEvent.RECIPE_GENERATION_FAILED]: 'RecipeGenerationFailed',
        [TrackingEvent.QUOTA_LIMIT_REACHED]: 'QuotaLimitReached',
        [TrackingEvent.CREDIT_PACK_VIEWED]: 'CreditPackViewed',
        [TrackingEvent.FRIDGE_FINISHED_STEP3]: 'FridgeFinishedStep3',
        [TrackingEvent.INSTAGRAM_IMPORT_STARTED]: 'InstagramImportStarted',
        [TrackingEvent.INSTAGRAM_IMPORT_FINISHED]: 'InstagramImportFinished',
    };

    async initialize(): Promise<void> {
        if (this.isInitialized) return;

        const hasConsent = await ConsentService.hasMarketingConsent();
        if (!hasConsent) return;

        if (Capacitor.isNativePlatform()) {
            if (Capacitor.getPlatform() === 'ios') {
                await this.configureAdvertiserTracking();
            }
        } else {
            await FacebookPixelService.initialize();
        }

        this.isInitialized = true;
    }

    disable(): void {
        this.isInitialized = false;
        if (!Capacitor.isNativePlatform()) {
            FacebookPixelService.disable();
        }
    }

    trackPageView(): void {
        if (!Capacitor.isNativePlatform()) {
            FacebookPixelService.trackPageView();
        }
    }

    async promptATTIfNeeded(): Promise<string> {
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

    async getTrackingStatus(): Promise<string> {
        if (Capacitor.getPlatform() !== 'ios') return 'not-applicable';

        try {
            const status = await AppTrackingTransparency.getStatus();
            return status.status;
        } catch (error) {
            console.error('Error getting ATT status:', error);
            return 'error';
        }
    }

    protected async sendEvent(
        translatedName: string,
        event: TrackingEvent,
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
                const nativeName = this.nativeEventMap[event] ?? translatedName;
                await FacebookLogin.logEvent({ eventName: nativeName });
            } else {
                const isStandard = STANDARD_EVENTS.has(event);
                if (isStandard) {
                    FacebookPixelService.trackEvent(translatedName, params, eventId);
                } else {
                    FacebookPixelService.trackCustomEvent(translatedName, params, eventId);
                }
            }
        } catch (error) {
            console.error('Error logging Meta event:', error);
        }
    }

    private async configureAdvertiserTracking(): Promise<void> {
        try {
            const status = await this.getTrackingStatus();
            const enabled = status === 'authorized';
            await FacebookLogin.setAdvertiserTrackingEnabled({ enabled });
            await FacebookLogin.setAutoLogAppEventsEnabled({ enabled: true });
        } catch (error) {
            console.error('Error configuring advertiser tracking:', error);
        }
    }
}
