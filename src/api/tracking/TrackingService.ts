import { TrackingEvent } from './events/TrackingEvent';
import { AbstractTrackingProvider } from './providers/AbstractTrackingProvider';
import { MetaTrackingProvider } from './providers/meta/MetaTrackingProvider';
import { TikTokTrackingProvider } from './providers/tiktok/TikTokTrackingProvider';

const metaProvider = new MetaTrackingProvider();

const providers: AbstractTrackingProvider[] = [
    metaProvider,
    ...(import.meta.env.VITE_TIKTOK_PIXEL_ID ? [new TikTokTrackingProvider()] : []),
];

export class TrackingService {
    public static async initialize(): Promise<void> {
        await Promise.all(providers.map(p => p.initialize()));
    }

    public static async promptATTIfNeeded(): Promise<string> {
        return metaProvider.promptATTIfNeeded();
    }

    public static async getTrackingStatus(): Promise<string> {
        return metaProvider.getTrackingStatus();
    }

    public static trackPageView(): void {
        providers.forEach(p => p.trackPageView());
    }

    // --- Standard Events ---

    public static async logCompleteRegistration(method: string): Promise<string> {
        const eventId = crypto.randomUUID();
        await Promise.all(providers.map(p =>
            p.trackEvent(TrackingEvent.COMPLETE_REGISTRATION, { content_name: method, status: true }, eventId),
        ));
        return eventId;
    }

    public static async logViewContent(contentId: string): Promise<string> {
        const eventId = crypto.randomUUID();
        await Promise.all(providers.map(p =>
            p.trackEvent(TrackingEvent.VIEW_CONTENT, { content_type: 'recipe', content_ids: [contentId] }, eventId),
        ));
        return eventId;
    }

    public static async logSearch(query: string): Promise<string> {
        const eventId = crypto.randomUUID();
        await Promise.all(providers.map(p =>
            p.trackEvent(TrackingEvent.SEARCH, { search_string: query }, eventId),
        ));
        return eventId;
    }

    public static async logInitiateCheckout(productType: string, value: number, currency: string = 'EUR'): Promise<string> {
        const eventId = crypto.randomUUID();
        await Promise.all(providers.map(p =>
            p.trackEvent(TrackingEvent.INITIATE_CHECKOUT, { content_type: productType, value, currency }, eventId),
        ));
        return eventId;
    }

    public static async logLead(source: string): Promise<string> {
        const eventId = crypto.randomUUID();
        await Promise.all(providers.map(p =>
            p.trackEvent(TrackingEvent.LEAD, { content_name: source }, eventId),
        ));
        return eventId;
    }

    // --- Custom Events ---

    public static async logRecipeGenerated(source: string): Promise<string> {
        const eventId = crypto.randomUUID();
        await Promise.all(providers.map(p =>
            p.trackEvent(TrackingEvent.RECIPE_GENERATED, { source }, eventId),
        ));
        return eventId;
    }

    public static async logRecipeGenerationInitiated(source: string): Promise<string> {
        const eventId = crypto.randomUUID();
        await Promise.all(providers.map(p =>
            p.trackEvent(TrackingEvent.RECIPE_GENERATION_INITIATED, { source }, eventId),
        ));
        return eventId;
    }

    public static async logRecipeGenerationFailed(source: string): Promise<string> {
        const eventId = crypto.randomUUID();
        await Promise.all(providers.map(p =>
            p.trackEvent(TrackingEvent.RECIPE_GENERATION_FAILED, { source }, eventId),
        ));
        return eventId;
    }

    public static async logQuotaLimitReached(source: string): Promise<string> {
        const eventId = crypto.randomUUID();
        await Promise.all(providers.map(p =>
            p.trackEvent(TrackingEvent.QUOTA_LIMIT_REACHED, { source }, eventId),
        ));
        return eventId;
    }

    public static async logCreditPackViewed(source: string): Promise<string> {
        const eventId = crypto.randomUUID();
        await Promise.all(providers.map(p =>
            p.trackEvent(TrackingEvent.CREDIT_PACK_VIEWED, { source }, eventId),
        ));
        return eventId;
    }

    public static async logFridgeFinishedStep3(): Promise<string> {
        const eventId = crypto.randomUUID();
        await Promise.all(providers.map(p =>
            p.trackEvent(TrackingEvent.FRIDGE_FINISHED_STEP3, {}, eventId),
        ));
        return eventId;
    }

    public static async logInstagramImportStarted(): Promise<string> {
        const eventId = crypto.randomUUID();
        await Promise.all(providers.map(p =>
            p.trackEvent(TrackingEvent.INSTAGRAM_IMPORT_STARTED, {}, eventId),
        ));
        return eventId;
    }

    public static async logInstagramImportFinished(): Promise<string> {
        const eventId = crypto.randomUUID();
        await Promise.all(providers.map(p =>
            p.trackEvent(TrackingEvent.INSTAGRAM_IMPORT_FINISHED, {}, eventId),
        ));
        return eventId;
    }
}
