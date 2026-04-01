import { App } from '@capacitor/app';
import PlatformService from './PlatformService';

interface VersionCheckResponse {
    minimumVersion: string;
    latestVersion: string;
    storeUrl: string;
}

export type UpdateStatus = 'up_to_date' | 'update_recommended' | 'update_required';

export interface VersionCheckResult {
    status: UpdateStatus;
    latestVersion: string;
    storeUrl: string;
}

export default class AppVersionService {
    private static baseUrl: string = import.meta.env.VITE_API_URL;
    private static port: string = import.meta.env.VITE_API_PORT;

    private static getApiUrl(): string {
        if (this.port) {
            return `${this.baseUrl}:${this.port}`;
        }
        return this.baseUrl;
    }

    static isVersionLower(current: string, target: string): boolean {
        const c = current.split('.').map(Number);
        const t = target.split('.').map(Number);
        for (let i = 0; i < 3; i++) {
            if ((c[i] || 0) < (t[i] || 0)) return true;
            if ((c[i] || 0) > (t[i] || 0)) return false;
        }
        return false;
    }

    static async checkVersion(): Promise<VersionCheckResult | null> {
        if (!PlatformService.isNative()) return null;

        try {
            const platform = PlatformService.getPlatform();
            const { version: currentVersion } = await App.getInfo();

            const response = await fetch(
                `${this.getApiUrl()}/api/v1/app/version-check?platform=${platform}`
            );

            if (!response.ok) return null;

            const data: VersionCheckResponse = await response.json();

            if (this.isVersionLower(currentVersion, data.minimumVersion)) {
                return { status: 'update_required', latestVersion: data.latestVersion, storeUrl: data.storeUrl };
            }

            if (this.isVersionLower(currentVersion, data.latestVersion)) {
                return { status: 'update_recommended', latestVersion: data.latestVersion, storeUrl: data.storeUrl };
            }

            return { status: 'up_to_date', latestVersion: data.latestVersion, storeUrl: data.storeUrl };
        } catch {
            return null;
        }
    }
}
