import ConsentService from '../../consent/ConsentService';

declare global {
    interface Window {
        ttq: {
            load: (pixelId: string) => void;
            page: () => void;
            track: (eventName: string, params?: Record<string, unknown>, options?: { event_id?: string }) => void;
            instance: (pixelId: string) => Window['ttq'];
            identify: (params: Record<string, unknown>) => void;
        };
        TiktokAnalyticsObject: string;
    }
}

const PIXEL_ID = import.meta.env.VITE_TIKTOK_PIXEL_ID as string | undefined;

export class TikTokPixelService {
    private static isLoaded = false;
    private static isInitialized = false;

    public static async initialize(): Promise<void> {
        if (this.isInitialized || !PIXEL_ID) return;

        const hasConsent = await ConsentService.hasMarketingConsent();
        if (!hasConsent) return;

        await this.loadScript();
        window.ttq.load(PIXEL_ID);
        window.ttq.page();
        this.isInitialized = true;
    }

    public static trackPageView(): void {
        if (!this.isInitialized || !window.ttq) return;
        window.ttq.page();
    }

    public static trackEvent(
        eventName: string,
        params?: Record<string, unknown>,
        eventId?: string,
    ): void {
        if (!this.isInitialized || !window.ttq) return;

        window.ttq.track(eventName, params || {}, eventId ? { event_id: eventId } : undefined);
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
            const ttq: any = (window.ttq = window.ttq || []);
            ttq.methods = [
                'page', 'track', 'identify', 'instances',
                'debug', 'on', 'off', 'once', 'ready',
                'alias', 'group', 'enableCookie', 'disableCookie',
                'holdConsent', 'revokeConsent', 'grantConsent',
            ];
            ttq.setAndDefer = function (t: any, e: string) {
                t[e] = function () {
                    t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
                };
            };
            for (let i = 0; i < ttq.methods.length; i++) {
                ttq.setAndDefer(ttq, ttq.methods[i]);
            }
            ttq.instance = function (t: string) {
                const e = ttq._i[t] || [];
                for (let n = 0; n < ttq.methods.length; n++) {
                    ttq.setAndDefer(e, ttq.methods[n]);
                }
                return e;
            };
            ttq.load = function (e: string, n?: unknown) {
                const r = 'https://analytics.tiktok.com/i18n/pixel/events.js';
                ttq._i = ttq._i || {};
                ttq._i[e] = [];
                ttq._i[e]._u = r;
                ttq._t = ttq._t || {};
                ttq._t[e] = +new Date();
                ttq._o = ttq._o || {};
                ttq._o[e] = n || {};
            };
            /* eslint-enable */

            window.TiktokAnalyticsObject = 'ttq';

            const script = document.createElement('script');
            script.async = true;
            script.src = 'https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=' + PIXEL_ID;
            script.onload = () => {
                this.isLoaded = true;
                resolve();
            };
            script.onerror = () => reject(new Error('Failed to load TikTok Pixel'));
            document.head.appendChild(script);
        });
    }
}
