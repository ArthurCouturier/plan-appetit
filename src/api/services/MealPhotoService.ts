import { Camera, CameraResultType, CameraSource, Photo } from "@capacitor/camera";
import BackendService from "./BackendService";
import { fetchWithTokenRefresh } from "../utils/fetchWithTokenRefresh";

export const MEAL_PHOTO_MAX_SIZE_BYTES = 300 * 1024; // 300 KB — partagé avec le backend
const TARGET_DIMENSION = 1024;
const DEFAULT_QUALITY = 70;
const FALLBACK_QUALITY = 50;

export interface MealPhotoIdentifyResponse {
    mealName: string;
}

export type MealPhotoErrorCode =
    | "quota_exceeded"
    | "image_too_large"
    | "invalid_image"
    | "permission_denied"
    | "compression_failed"
    | "no_statistics"
    | "unknown";

export class MealPhotoError extends Error {
    constructor(public code: MealPhotoErrorCode, message: string) {
        super(message);
    }
}

export default class MealPhotoService {
    /**
     * Ouvre le picker natif (Photothèque ou Appareil photo via CameraSource.Prompt),
     * compresse en JPEG 1024×1024 q70 puis q50 en fallback pour rester sous la limite.
     * Retourne le base64 brut (sans préfixe data URL).
     */
    static async captureAndCompress(): Promise<string> {
        const photo = await this.getPhoto(DEFAULT_QUALITY);
        if (!photo.base64String) {
            throw new MealPhotoError("invalid_image", "Aucune image récupérée.");
        }
        if (this.binarySize(photo.base64String) <= MEAL_PHOTO_MAX_SIZE_BYTES) {
            return photo.base64String;
        }

        // Retry avec qualité plus basse
        const lowerQuality = await this.getPhoto(FALLBACK_QUALITY);
        if (!lowerQuality.base64String) {
            throw new MealPhotoError("compression_failed", "Compression impossible.");
        }
        if (this.binarySize(lowerQuality.base64String) > MEAL_PHOTO_MAX_SIZE_BYTES) {
            throw new MealPhotoError(
                "image_too_large",
                `Photo trop lourde (> ${MEAL_PHOTO_MAX_SIZE_BYTES / 1024} KB). Réessaie avec une photo plus simple.`,
            );
        }
        return lowerQuality.base64String;
    }

    private static async getPhoto(quality: number): Promise<Photo> {
        try {
            return await Camera.getPhoto({
                quality,
                width: TARGET_DIMENSION,
                height: TARGET_DIMENSION,
                allowEditing: false,
                resultType: CameraResultType.Base64,
                source: CameraSource.Prompt,
                promptLabelHeader: "Photo du plat",
                promptLabelPhoto: "Choisir depuis la photothèque",
                promptLabelPicture: "Prendre une photo",
                promptLabelCancel: "Annuler",
            });
        } catch (e) {
            const msg = (e as Error)?.message ?? "";
            if (msg.toLowerCase().includes("permission") || msg.toLowerCase().includes("denied")) {
                throw new MealPhotoError(
                    "permission_denied",
                    "Permission refusée. Active l'accès à la caméra et à la photothèque dans les réglages de ton téléphone.",
                );
            }
            // L'utilisateur a annulé (cas courant) — on remonte sans bruit.
            throw new MealPhotoError("invalid_image", msg || "Action annulée.");
        }
    }

    private static binarySize(base64: string): number {
        // Approximation : 4 chars base64 = 3 octets binaires.
        return Math.floor((base64.length * 3) / 4);
    }

    static async identify(
        email: string,
        token: string,
        imageBase64: string,
    ): Promise<MealPhotoIdentifyResponse> {
        const apiUrl = BackendService.port
            ? `${BackendService.baseUrl}:${BackendService.port}`
            : BackendService.baseUrl;
        const response = await fetchWithTokenRefresh(
            `${apiUrl}/api/v1/ritual/meal-photo/identify`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    Email: email,
                },
                body: JSON.stringify({ imageBase64 }),
            },
        );
        if (response.ok) {
            return response.json();
        }
        if (response.status === 429) {
            throw new MealPhotoError(
                "quota_exceeded",
                "Tu as atteint la limite de 100 analyses photo aujourd'hui. Réessaie demain.",
            );
        }
        if (response.status === 413) {
            throw new MealPhotoError(
                "image_too_large",
                `Photo trop lourde (> ${MEAL_PHOTO_MAX_SIZE_BYTES / 1024} KB).`,
            );
        }
        if (response.status === 400) {
            throw new MealPhotoError("invalid_image", "Image invalide.");
        }
        throw new MealPhotoError("unknown", `Erreur ${response.status}`);
    }
}
