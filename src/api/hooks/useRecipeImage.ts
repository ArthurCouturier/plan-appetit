import { useQuery } from '@tanstack/react-query';
import BackendService from '../services/BackendService';
import { queryKeys } from '../queryConfig';

export function useRecipeImage(recipeUuid: string) {
    return useQuery({
        queryKey: queryKeys.recipes.image(recipeUuid),
        queryFn: async () => {
            const email = localStorage.getItem("email");
            const token = localStorage.getItem("firebaseIdToken");
            const response = await BackendService.getRecipeImage(recipeUuid, email, token);

            if (!response || !response.imageData) {
                return null;
            }
            return response.imageData;
        },
        staleTime: 60 * 60 * 1000, // 1h - les images changent rarement
        gcTime: 30 * 60 * 1000, // 30min en garbage collection
        retry: 1,
    });
}
