import { Camera, CameraResultType, CameraSource, Photo } from "@capacitor/camera";

/** Limite par défaut alignée avec le backend (analyse vision). */
export const DEFAULT_PHOTO_MAX_SIZE_BYTES = 300 * 1024; // 300 KB

const DEFAULT_TARGET_DIMENSION = 1024;
const DEFAULT_QUALITY = 70;
const DEFAULT_FALLBACK_QUALITY = 50;

export type CameraPickerErrorCode =
    | "invalid_image"
    | "permission_denied"
    | "compression_failed"
    | "image_too_large";

export class CameraPickerError extends Error {
    constructor(public code: CameraPickerErrorCode, message: string) {
        super(message);
    }
}

export interface CameraPickerOptions {
    /** Titre de la feuille d'action native ("Photo du plat", "Photo de la recette"...). */
    promptHeader?: string;
    promptLabelPhoto?: string;
    promptLabelPicture?: string;
    promptLabelCancel?: string;
    maxSizeBytes?: number;
    targetDimension?: number;
    quality?: number;
    fallbackQuality?: number;
}

/**
 * Picker photo natif générique et réutilisable (Photothèque OU Appareil photo via
 * `CameraSource.Prompt`), avec compression JPEG et garde-fou de taille.
 *
 * Centralise la logique partagée par toutes les features qui capturent une photo
 * destinée à une analyse vision côté backend (mode Ritual, Import Photo, ...).
 * Retourne le base64 brut (sans préfixe `data:`).
 */
export default class CameraPickerService {
    static async captureAndCompress(options: CameraPickerOptions = {}): Promise<string> {
        const maxSize = options.maxSizeBytes ?? DEFAULT_PHOTO_MAX_SIZE_BYTES;
        const quality = options.quality ?? DEFAULT_QUALITY;
        const fallbackQuality = options.fallbackQuality ?? DEFAULT_FALLBACK_QUALITY;

        const photo = await this.getPhoto(quality, options);
        if (!photo.base64String) {
            throw new CameraPickerError("invalid_image", "Aucune image récupérée.");
        }
        if (this.binarySize(photo.base64String) <= maxSize) {
            return photo.base64String;
        }

        // Retry avec une qualité plus basse pour passer sous la limite.
        const lowerQuality = await this.getPhoto(fallbackQuality, options);
        if (!lowerQuality.base64String) {
            throw new CameraPickerError("compression_failed", "Compression impossible.");
        }
        if (this.binarySize(lowerQuality.base64String) > maxSize) {
            throw new CameraPickerError(
                "image_too_large",
                `Photo trop lourde (> ${Math.round(maxSize / 1024)} KB). Réessaie avec une photo plus simple.`,
            );
        }
        return lowerQuality.base64String;
    }

    private static async getPhoto(quality: number, options: CameraPickerOptions): Promise<Photo> {
        try {
            return await Camera.getPhoto({
                quality,
                width: options.targetDimension ?? DEFAULT_TARGET_DIMENSION,
                height: options.targetDimension ?? DEFAULT_TARGET_DIMENSION,
                allowEditing: false,
                resultType: CameraResultType.Base64,
                source: CameraSource.Prompt,
                promptLabelHeader: options.promptHeader ?? "Photo",
                promptLabelPhoto: options.promptLabelPhoto ?? "Choisir depuis la photothèque",
                promptLabelPicture: options.promptLabelPicture ?? "Prendre une photo",
                promptLabelCancel: options.promptLabelCancel ?? "Annuler",
            });
        } catch (e) {
            const msg = (e as Error)?.message ?? "";
            if (msg.toLowerCase().includes("permission") || msg.toLowerCase().includes("denied")) {
                throw new CameraPickerError(
                    "permission_denied",
                    "Permission refusée. Active l'accès à la caméra et à la photothèque dans les réglages de ton téléphone.",
                );
            }
            // L'utilisateur a annulé (cas courant) — on remonte sans bruit.
            throw new CameraPickerError("invalid_image", msg || "Action annulée.");
        }
    }

    static binarySize(base64: string): number {
        // Approximation : 4 chars base64 = 3 octets binaires.
        return Math.floor((base64.length * 3) / 4);
    }
}
