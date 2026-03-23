import { Capacitor } from '@capacitor/core';
import StorageService from './StorageService';

const CONSENT_KEY = 'cookie_consent';
const CONSENT_MAX_AGE_MONTHS = 13;

export interface ConsentPreferences {
    essential: true;
    analytics: boolean;
    marketing: boolean;
    timestamp: string;
}

type ConsentCategory = 'analytics' | 'marketing';

const DEFAULT_CONSENT: ConsentPreferences = {
    essential: true,
    analytics: false,
    marketing: false,
    timestamp: '',
};

export default class ConsentService {
    private static listeners: Array<(consent: ConsentPreferences) => void> = [];

    public static async getConsent(): Promise<ConsentPreferences | null> {
        const consent = await StorageService.getObject<ConsentPreferences>(CONSENT_KEY);
        if (!consent) return null;

        if (this.isExpired(consent.timestamp)) {
            await this.clearConsent();
            return null;
        }

        return consent;
    }

    public static async hasConsented(): Promise<boolean> {
        // Sur native, le consentement est géré par le système (ATT sur iOS)
        if (Capacitor.isNativePlatform()) return true;

        const consent = await this.getConsent();
        return consent !== null;
    }

    public static async hasMarketingConsent(): Promise<boolean> {
        // Sur native, le marketing est autorisé — le SDK Facebook
        // respecte le statut ATT au niveau système (configureAdvertiserTracking)
        if (Capacitor.isNativePlatform()) return true;

        const consent = await this.getConsent();
        return consent?.marketing === true;
    }

    public static async hasAnalyticsConsent(): Promise<boolean> {
        // Sur native, l'analytics first-party (PostHog) est un intérêt légitime
        if (Capacitor.isNativePlatform()) return true;

        const consent = await this.getConsent();
        return consent?.analytics === true;
    }

    public static async acceptAll(): Promise<ConsentPreferences> {
        const consent: ConsentPreferences = {
            essential: true,
            analytics: true,
            marketing: true,
            timestamp: new Date().toISOString(),
        };
        await this.saveConsent(consent);
        return consent;
    }

    public static async rejectNonEssential(): Promise<ConsentPreferences> {
        const consent: ConsentPreferences = {
            ...DEFAULT_CONSENT,
            timestamp: new Date().toISOString(),
        };
        await this.saveConsent(consent);
        return consent;
    }

    public static async setConsent(categories: Record<ConsentCategory, boolean>): Promise<ConsentPreferences> {
        const consent: ConsentPreferences = {
            essential: true,
            analytics: categories.analytics,
            marketing: categories.marketing,
            timestamp: new Date().toISOString(),
        };
        await this.saveConsent(consent);
        return consent;
    }

    public static async revokeConsent(): Promise<void> {
        await this.clearConsent();
        this.notifyListeners(DEFAULT_CONSENT);
    }

    public static onConsentChange(listener: (consent: ConsentPreferences) => void): () => void {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private static async saveConsent(consent: ConsentPreferences): Promise<void> {
        await StorageService.setObject(CONSENT_KEY, consent);
        this.notifyListeners(consent);
    }

    private static async clearConsent(): Promise<void> {
        await StorageService.remove(CONSENT_KEY);
    }

    private static notifyListeners(consent: ConsentPreferences): void {
        this.listeners.forEach(listener => listener(consent));
    }

    private static isExpired(timestamp: string): boolean {
        if (!timestamp) return true;
        const consentDate = new Date(timestamp);
        const expiryDate = new Date(consentDate);
        expiryDate.setMonth(expiryDate.getMonth() + CONSENT_MAX_AGE_MONTHS);
        return new Date() > expiryDate;
    }
}
