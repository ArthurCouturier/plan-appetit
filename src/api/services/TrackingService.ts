import { Capacitor } from '@capacitor/core';
import { AppTrackingTransparency, AppTrackingStatusResponse } from 'capacitor-plugin-app-tracking-transparency';
import { FacebookLogin } from '@capacitor-community/facebook-login';

export class TrackingService {
    private static isInitialized = false;

    public static async initialize(): Promise<void> {
        if (this.isInitialized) return;

        if (Capacitor.getPlatform() === 'ios') {
            await this.requestTrackingPermission();
            await this.enableAdvertiserTracking();
        }

        this.isInitialized = true;
    }

    public static async requestTrackingPermission(): Promise<string> {
        if (Capacitor.getPlatform() !== 'ios') {
            return 'not-applicable';
        }

        try {
            const status = await AppTrackingTransparency.getStatus();

            if (status.status === 'notDetermined') {
                const response: AppTrackingStatusResponse = await AppTrackingTransparency.requestPermission();
                console.log('ATT permission response:', response.status);
                return response.status;
            }

            console.log('ATT status:', status.status);
            return status.status;
        } catch (error) {
            console.error('Error requesting ATT permission:', error);
            return 'error';
        }
    }

    public static async enableAdvertiserTracking(): Promise<void> {
        try {
            const status = await this.getTrackingStatus();
            const enabled = status === 'authorized';
            await FacebookLogin.setAdvertiserTrackingEnabled({ enabled });
            await FacebookLogin.setAutoLogAppEventsEnabled({ enabled: true });
            console.log('Advertiser tracking enabled:', enabled);
        } catch (error) {
            console.error('Error enabling advertiser tracking:', error);
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

    public static async logEvent(eventName: string): Promise<void> {
        try {
            if (Capacitor.isNativePlatform()) {
                await FacebookLogin.logEvent({ eventName });
                console.log('Facebook event logged:', eventName);
            }
        } catch (error) {
            console.error('Error logging Facebook event:', error);
        }
    }

    public static async logPurchase(): Promise<void> {
        await this.logEvent('fb_mobile_purchase');
    }

    public static async logSubscription(): Promise<void> {
        await this.logEvent('Subscribe');
    }

    public static async logRecipeGenerated(): Promise<void> {
        await this.logEvent('RecipeGenerated');
    }

    public static async logSignUp(): Promise<void> {
        await this.logEvent('fb_mobile_complete_registration');
    }
}
