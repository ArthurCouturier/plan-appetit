import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

/**
 * Service de stockage unifié pour web et mobile.
 * Utilise Capacitor Preferences sur mobile et localStorage sur web.
 */
export default class StorageService {
    private static isNative(): boolean {
        return Capacitor.isNativePlatform();
    }

    public static async get(key: string): Promise<string | null> {
        if (this.isNative()) {
            const { value } = await Preferences.get({ key });
            return value;
        }
        return localStorage.getItem(key);
    }

    public static async set(key: string, value: string): Promise<void> {
        if (this.isNative()) {
            await Preferences.set({ key, value });
        } else {
            localStorage.setItem(key, value);
        }
    }

    public static async remove(key: string): Promise<void> {
        if (this.isNative()) {
            await Preferences.remove({ key });
        } else {
            localStorage.removeItem(key);
        }
    }

    public static async clear(): Promise<void> {
        if (this.isNative()) {
            await Preferences.clear();
        } else {
            localStorage.clear();
        }
    }

    public static async getObject<T>(key: string): Promise<T | null> {
        const value = await this.get(key);
        if (!value) return null;
        try {
            return JSON.parse(value) as T;
        } catch {
            return null;
        }
    }

    public static async setObject<T>(key: string, value: T): Promise<void> {
        await this.set(key, JSON.stringify(value));
    }
}
