import BackendService from "./BackendService";
import { fetchWithTokenRefresh } from "../utils/fetchWithTokenRefresh";
import CameraPickerService, { CameraPickerError } from "./CameraPickerService";

export const MEAL_PHOTO_MAX_SIZE_BYTES = 300 * 1024; // 300 KB — partagé avec le backend

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
     * compresse pour rester sous la limite et retourne le base64 brut.
     * Délègue au CameraPickerService générique en mappant ses erreurs vers MealPhotoError.
     */
    static async captureAndCompress(): Promise<string> {
        try {
            return await CameraPickerService.captureAndCompress({
                promptHeader: "Photo du plat",
                maxSizeBytes: MEAL_PHOTO_MAX_SIZE_BYTES,
            });
        } catch (e) {
            if (e instanceof CameraPickerError) {
                throw new MealPhotoError(e.code, e.message);
            }
            throw e;
        }
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
