import { TrackingEvent } from '../events/TrackingEvent';

export abstract class AbstractTrackingProvider {
    protected abstract readonly eventMap: Partial<Record<TrackingEvent, string>>;

    abstract initialize(): Promise<void>;
    abstract disable(): void;
    abstract trackPageView(): void;

    async trackEvent(
        event: TrackingEvent,
        params?: Record<string, unknown>,
        eventId?: string,
    ): Promise<void> {
        const eventName = this.eventMap[event];
        if (!eventName) return;
        await this.sendEvent(eventName, event, params, eventId);
    }

    protected abstract sendEvent(
        translatedName: string,
        event: TrackingEvent,
        params?: Record<string, unknown>,
        eventId?: string,
    ): Promise<void>;
}
