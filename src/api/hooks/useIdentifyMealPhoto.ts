import { useMutation } from "@tanstack/react-query";
import MealPhotoService, {
    MealPhotoError,
    MealPhotoIdentifyResponse,
} from "../services/MealPhotoService";

function getAuthHeaders(): { email: string | null; token: string | null } {
    return {
        email: localStorage.getItem("email"),
        token: localStorage.getItem("firebaseIdToken"),
    };
}

/**
 * Mutation pour analyser une photo de plat et obtenir le nom détecté.
 * Le composant appelant doit fournir le base64 (déjà compressé via
 * MealPhotoService.captureAndCompress()).
 */
export function useIdentifyMealPhoto() {
    return useMutation<MealPhotoIdentifyResponse, MealPhotoError, string>({
        mutationFn: async (imageBase64) => {
            const { email, token } = getAuthHeaders();
            if (!email || !token) {
                throw new MealPhotoError("unknown", "Non authentifié.");
            }
            return MealPhotoService.identify(email, token, imageBase64);
        },
        retry: 0,
    });
}
