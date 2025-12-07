import { getToken, onMessage } from "firebase/messaging";
import { Capacitor } from "@capacitor/core";
import { FirebaseMessaging } from "@capacitor-firebase/messaging";
import { initializeMessaging } from "../authentication/firebase";
import { fetchWithTokenRefresh } from "../utils/fetchWithTokenRefresh";

export type DeviceType = "IOS" | "ANDROID" | "WEB";

interface RegisterTokenRequest {
    token: string;
    deviceType: DeviceType;
}

export default class NotificationService {
    static baseUrl: string = import.meta.env.VITE_API_URL;
    static port: string = import.meta.env.VITE_API_PORT;
    static vapidKey: string = import.meta.env.VITE_FIREBASE_VAPID_KEY;

    private static fcmToken: string | null = null;

    public static getDeviceType(): DeviceType {
        const platform = Capacitor.getPlatform();
        if (platform === "ios") return "IOS";
        if (platform === "android") return "ANDROID";
        return "WEB";
    }

    public static async requestPermission(): Promise<boolean> {
        if (Capacitor.isNativePlatform()) {
            try {
                const permStatus = await FirebaseMessaging.checkPermissions();

                if (permStatus.receive === "granted") {
                    return true;
                }

                if (permStatus.receive === "denied") {
                    console.log("Les notifications ont été bloquées par l'utilisateur");
                    return false;
                }

                const requestResult = await FirebaseMessaging.requestPermissions();
                return requestResult.receive === "granted";
            } catch (error) {
                console.error("Erreur lors de la demande de permission:", error);
                return false;
            }
        }

        // Pour le web
        if (!("Notification" in window)) {
            console.log("Ce navigateur ne supporte pas les notifications");
            return false;
        }

        if (Notification.permission === "granted") {
            return true;
        }

        if (Notification.permission === "denied") {
            console.log("Les notifications ont été bloquées par l'utilisateur");
            return false;
        }

        const permission = await Notification.requestPermission();
        return permission === "granted";
    }

    public static async getFcmToken(): Promise<string | null> {
        if (this.fcmToken) {
            return this.fcmToken;
        }

        if (Capacitor.isNativePlatform()) {
            try {
                const result = await FirebaseMessaging.getToken();
                if (result.token) {
                    console.log("Token FCM natif obtenu:", result.token);
                    this.fcmToken = result.token;
                    return result.token;
                }
                console.log("Impossible d'obtenir le token FCM natif");
                return null;
            } catch (error) {
                console.error("Erreur lors de l'obtention du token FCM natif:", error);
                return null;
            }
        }

        // Pour le web
        try {
            const messaging = await initializeMessaging();
            if (!messaging) {
                console.log("Firebase Messaging n'est pas supporté");
                return null;
            }

            // Enregistrer le service worker
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            console.log("Service Worker enregistré:", registration);

            const token = await getToken(messaging, {
                vapidKey: this.vapidKey,
                serviceWorkerRegistration: registration,
            });

            if (token) {
                this.fcmToken = token;
                console.log("FCM Token obtenu");
                return token;
            }

            console.log("Impossible d'obtenir le token FCM");
            return null;
        } catch (error) {
            console.error("Erreur lors de l'obtention du token FCM:", error);
            return null;
        }
    }

    public static async registerTokenWithBackend(
        email: string,
        authToken: string
    ): Promise<boolean> {
        const fcmToken = await this.getFcmToken();
        if (!fcmToken) {
            return false;
        }

        const request: RegisterTokenRequest = {
            token: fcmToken,
            deviceType: this.getDeviceType(),
        };

        try {
            const response = await fetchWithTokenRefresh(
                `${this.baseUrl}:${this.port}/api/v1/notifications/register-token`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${authToken}`,
                        Email: email,
                    },
                    body: JSON.stringify(request),
                }
            );

            if (!response.ok) {
                throw new Error("Erreur lors de l'enregistrement du token");
            }

            console.log("Token FCM enregistré avec succès auprès du backend");
            return true;
        } catch (error) {
            console.error("Erreur lors de l'enregistrement du token FCM:", error);
            return false;
        }
    }

    public static async unregisterToken(
        email: string,
        authToken: string
    ): Promise<boolean> {
        if (!this.fcmToken) {
            return true;
        }

        try {
            const response = await fetchWithTokenRefresh(
                `${this.baseUrl}:${this.port}/api/v1/notifications/unregister-token`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${authToken}`,
                        Email: email,
                    },
                    body: JSON.stringify({ token: this.fcmToken }),
                }
            );

            if (!response.ok) {
                throw new Error("Erreur lors de la suppression du token");
            }

            this.fcmToken = null;
            console.log("Token FCM supprimé avec succès");
            return true;
        } catch (error) {
            console.error("Erreur lors de la suppression du token FCM:", error);
            return false;
        }
    }

    public static async setupForegroundListener(
        onNotification: (payload: { title?: string; body?: string; data?: Record<string, string> }) => void
    ): Promise<void> {
        if (Capacitor.isNativePlatform()) {
            // Listener pour les notifications reçues en foreground (app ouverte)
            await FirebaseMessaging.addListener("notificationReceived", (event) => {
                console.log("Notification native reçue en foreground:", event);
                onNotification({
                    title: event.notification?.title,
                    body: event.notification?.body,
                    data: event.notification?.data as Record<string, string>,
                });
            });

            // Listener pour les actions sur les notifications (tap)
            await FirebaseMessaging.addListener("notificationActionPerformed", (event) => {
                console.log("Action sur notification:", event);
            });

            return;
        }

        // Pour le web
        const messaging = await initializeMessaging();
        if (!messaging) {
            return;
        }

        onMessage(messaging, (payload) => {
            console.log("Notification reçue en foreground:", payload);
            onNotification({
                title: payload.notification?.title,
                body: payload.notification?.body,
                data: payload.data as Record<string, string>,
            });
        });
    }

    public static async initializeNotifications(
        email: string,
        authToken: string
    ): Promise<boolean> {
        const hasPermission = await this.requestPermission();
        if (!hasPermission) {
            console.log("Permission notifications refusée");
            return false;
        }

        const registered = await this.registerTokenWithBackend(email, authToken);
        return registered;
    }

    public static async removeAllListeners(): Promise<void> {
        if (Capacitor.isNativePlatform()) {
            await FirebaseMessaging.removeAllListeners();
        }
    }
}
