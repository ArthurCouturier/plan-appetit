import { TrackingEvent } from '../../events/TrackingEvent';
import { AbstractTrackingProvider } from '../AbstractTrackingProvider';
import ConsentService from '../../consent/ConsentService';
import { TikTokPixelService } from './TikTokPixelService';

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

        // Le SDK natif TikTok est initialisé dans AppDelegate (iOS) / MainActivity (Android)
        // Ici on initialise le Pixel JS qui fonctionne dans la WebView (web ET mobile)
        await TikTokPixelService.initialize();
        this.isInitialized = true;
    }

    disable(): void {
        this.isInitialized = false;
        TikTokPixelService.disable();
    }

    trackPageView(): void {
        TikTokPixelService.trackPageView();
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
            TikTokPixelService.trackEvent(translatedName, params, eventId);
        } catch (error) {
            console.error('Error logging TikTok event:', error);
        }
    }
}
