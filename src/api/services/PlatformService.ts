import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Network } from '@capacitor/network';
import { Keyboard } from '@capacitor/keyboard';
import { StatusBar, Style } from '@capacitor/status-bar';

export type PlatformType = 'web' | 'ios' | 'android';

export default class PlatformService {
    public static getPlatform(): PlatformType {
        const platform = Capacitor.getPlatform();
        if (platform === 'ios') return 'ios';
        if (platform === 'android') return 'android';
        return 'web';
    }

    public static isNative(): boolean {
        return Capacitor.isNativePlatform();
    }

    public static isIOS(): boolean {
        return Capacitor.getPlatform() === 'ios';
    }

    public static isAndroid(): boolean {
        return Capacitor.getPlatform() === 'android';
    }

    public static isWeb(): boolean {
        return !Capacitor.isNativePlatform();
    }

    public static async hapticFeedback(style: 'light' | 'medium' | 'heavy' = 'medium'): Promise<void> {
        if (!this.isNative()) return;

        const impactStyle = {
            light: ImpactStyle.Light,
            medium: ImpactStyle.Medium,
            heavy: ImpactStyle.Heavy
        }[style];

        await Haptics.impact({ style: impactStyle });
    }

    public static async hapticNotification(type: 'success' | 'warning' | 'error' = 'success'): Promise<void> {
        if (!this.isNative()) return;

        const notificationType: NotificationType = {
            success: NotificationType.Success,
            warning: NotificationType.Warning,
            error: NotificationType.Error
        }[type];

        await Haptics.notification({ type: notificationType });
    }

    public static async isOnline(): Promise<boolean> {
        if (!this.isNative()) {
            return navigator.onLine;
        }
        const status = await Network.getStatus();
        return status.connected;
    }

    public static onNetworkChange(callback: (connected: boolean) => void): void {
        if (this.isNative()) {
            Network.addListener('networkStatusChange', (status) => {
                callback(status.connected);
            });
        } else {
            window.addEventListener('online', () => callback(true));
            window.addEventListener('offline', () => callback(false));
        }
    }

    public static async hideKeyboard(): Promise<void> {
        if (this.isNative()) {
            await Keyboard.hide();
        }
    }

    public static onKeyboardShow(callback: (height: number) => void): void {
        if (this.isNative()) {
            Keyboard.addListener('keyboardWillShow', (info) => {
                callback(info.keyboardHeight);
            });
        }
    }

    public static onKeyboardHide(callback: () => void): void {
        if (this.isNative()) {
            Keyboard.addListener('keyboardWillHide', () => {
                callback();
            });
        }
    }

    public static async setStatusBarStyle(style: 'light' | 'dark'): Promise<void> {
        if (!this.isNative()) return;

        await StatusBar.setStyle({
            style: style === 'light' ? Style.Light : Style.Dark
        });
    }

    public static async setStatusBarBackgroundColor(color: string): Promise<void> {
        if (!this.isNative()) return;

        if (this.isAndroid()) {
            await StatusBar.setBackgroundColor({ color });
        }
    }

    public static onAppStateChange(callback: (isActive: boolean) => void): void {
        if (this.isNative()) {
            App.addListener('appStateChange', ({ isActive }) => {
                callback(isActive);
            });
        } else {
            document.addEventListener('visibilitychange', () => {
                callback(document.visibilityState === 'visible');
            });
        }
    }

    public static onBackButton(callback: () => void): void {
        if (this.isAndroid()) {
            App.addListener('backButton', () => {
                callback();
            });
        }
    }
}
