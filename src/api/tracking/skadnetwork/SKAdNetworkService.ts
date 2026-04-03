import { Capacitor } from '@capacitor/core';
import { SKAdNetworkConversionValue } from './SKAdNetworkConversionValue';
import SKAdNetworkNative from './SKAdNetworkPlugin';
import { fetchWithTokenRefresh } from '../../utils/fetchWithTokenRefresh';
import { getAuth } from 'firebase/auth';

export class SKAdNetworkService {
    private static baseUrl = import.meta.env.VITE_API_URL;
    private static port = import.meta.env.VITE_API_PORT;

    private static getApiUrl(): string {
        return this.port ? `${this.baseUrl}:${this.port}` : this.baseUrl;
    }

    static async updateConversionValue(newValue: SKAdNetworkConversionValue): Promise<void> {
        if (Capacitor.getPlatform() !== 'ios') return;

        try {
            await SKAdNetworkNative.updateConversionValue({ value: newValue });
        } catch (e) {
            console.warn('[SKAdNetwork] Failed to update conversion value:', e);
        }
    }

    static async syncFromBackend(): Promise<void> {
        if (Capacitor.getPlatform() !== 'ios') return;

        try {
            const user = getAuth().currentUser;
            if (!user) return;

            const token = await user.getIdToken();
            const response = await fetchWithTokenRefresh(
                `${this.getApiUrl()}/api/v1/users/conversion-value`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Email': user.email || '',
                    },
                },
            );

            if (response.ok) {
                const data = await response.json();
                await SKAdNetworkNative.updateConversionValue({ value: data.value });
            }
        } catch (e) {
            console.warn('[SKAdNetwork] Failed to sync from backend:', e);
        }
    }
}
