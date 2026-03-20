import { registerPlugin } from '@capacitor/core';

export interface TikTokSDKPluginInterface {
    initialize(options: { appId: string }): Promise<void>;
    trackEvent(options: {
        eventName: string;
        eventId?: string;
        properties?: Record<string, unknown>;
    }): Promise<void>;
}

const TikTokSDK = registerPlugin<TikTokSDKPluginInterface>('TikTokSDK');

export default TikTokSDK;
