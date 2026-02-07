import ConsentService from './ConsentService';

declare global {
    interface Window {
        fbq: ((...args: unknown[]) => void) & {
            callMethod?: (...args: unknown[]) => void;
            queue: unknown[][];
            loaded: boolean;
            version: string;
            push: (...args: unknown[]) => void;
        };
        _fbq: typeof Window.prototype.fbq;
    }
}

const PIXEL_ID = import.meta.env.VITE_FACEBOOK_PIXEL_ID as string | undefined;

export class FacebookPixelService {
    private static isLoaded = false;
    private static isInitialized = false;

    public static async initialize(): Promise<void> {
        if (this.isInitialized || !PIXEL_ID) return;

        const hasConsent = await ConsentService.hasMarketingConsent();
        if (!hasConsent) return;

        await this.loadScript();
        window.fbq('init', PIXEL_ID);
        window.fbq('track', 'PageView');
        this.isInitialized = true;
    }

    public static trackPageView(): void {
        if (!this.isInitialized || !window.fbq) return;
        window.fbq('track', 'PageView');
    }

    public static trackEvent(
        eventName: string,
        params?: Record<string, unknown>,
        eventId?: string,
    ): void {
        if (!this.isInitialized || !window.fbq) return;

        if (eventId) {
            window.fbq('track', eventName, params || {}, { eventID: eventId });
        } else {
            window.fbq('track', eventName, params || {});
        }
    }

    public static trackCustomEvent(
        eventName: string,
        params?: Record<string, unknown>,
        eventId?: string,
    ): void {
        if (!this.isInitialized || !window.fbq) return;

        if (eventId) {
            window.fbq('trackCustom', eventName, params || {}, { eventID: eventId });
        } else {
            window.fbq('trackCustom', eventName, params || {});
        }
    }

    public static disable(): void {
        this.isInitialized = false;
    }

    public static getIsInitialized(): boolean {
        return this.isInitialized;
    }

    private static loadScript(): Promise<void> {
        if (this.isLoaded) return Promise.resolve();

        return new Promise((resolve, reject) => {
            /* eslint-disable */
            const n: any = (window.fbq = function () {
                n.callMethod
                    ? n.callMethod.apply(n, arguments)
                    : n.queue.push(arguments);
            } as any);
            if (!window._fbq) window._fbq = n;
            n.push = n;
            n.loaded = true;
            n.version = '2.0';
            n.queue = [];
            /* eslint-enable */

            const script = document.createElement('script');
            script.async = true;
            script.src = 'https://connect.facebook.net/en_US/fbevents.js';
            script.onload = () => {
                this.isLoaded = true;
                resolve();
            };
            script.onerror = () => reject(new Error('Failed to load Facebook Pixel'));
            document.head.appendChild(script);
        });
    }
}
