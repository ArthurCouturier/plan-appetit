import { Capacitor } from '@capacitor/core';
import { TrackingEvent } from '../../events/TrackingEvent';
import { AbstractTrackingProvider } from '../AbstractTrackingProvider';
import ConsentService from '../../consent/ConsentService';
import { TikTokPixelService } from './TikTokPixelService';
import TikTokSDK from './TikTokSDKPlugin';

export class TikTokTrackingProvider extends AbstractTrackingProvider {
    private isInitialized = false;

    protected readonly eventMap: Record<TrackingEvent, string> = {
        [TrackingEvent.COMPLETE_REGISTRATION]: 'CompleteRegistration',
        [TrackingEvent.VIEW_CONTENT]: 'ViewContent',
        [TrackingEvent.SEARCH]: 'Search',
        [TrackingEvent.INITIATE_CHECKOUT]: 'InitiateCheckout',
        [TrackingEvent.PURCHASE]: 'CompletePayment',
        [TrackingEvent.SUBSCRIBE]: 'Subscribe',
        [TrackingEvent.ADD_TO_CART]: 'AddToCart',
        [TrackingEvent.LEAD]: 'SubmitForm',
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

        if (!Capacitor.isNativePlatform()) {
            await TikTokPixelService.initialize();
        }
        // Le SDK natif est initialisé dans AppDelegate (iOS)
        this.isInitialized = true;
    }

    disable(): void {
        this.isInitialized = false;
        if (!Capacitor.isNativePlatform()) {
            TikTokPixelService.disable();
        }
    }

    trackPageView(): void {
        if (!Capacitor.isNativePlatform()) {
            TikTokPixelService.trackPageView();
        }
    }

    protected async sendEvent(
        translatedName: string,
        _event: TrackingEvent,
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
                await TikTokSDK.trackEvent({
                    eventName: translatedName,
                    eventId,
                    properties: params,
                });
            } else {
                TikTokPixelService.trackEvent(translatedName, params, eventId);
            }
        } catch (error) {
            console.error('Error logging TikTok event:', error);
        }
    }
}
