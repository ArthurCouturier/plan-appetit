import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Capacitor } from '@capacitor/core';
import { WatchBridge } from '../api/plugins/WatchBridge';
import { queryKeys } from '../api/queryConfig';
import BackendService from '../api/services/BackendService';

export function useWatchRecipeSync(recipeUuid: string | undefined, recipeName: string | undefined) {
    const isIOS = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';

    useEffect(() => {
        if (!isIOS || !recipeUuid) return;
        console.log('[WatchSync] pinging native plugin to verify registration');
        (WatchBridge as unknown as { ping: () => Promise<unknown> }).ping()
            .then((res) => console.log('[WatchSync] ping OK', res))
            .catch((err) => console.warn('[WatchSync] ping FAILED - plugin not registered?', err));
    }, [isIOS, recipeUuid]);

    const { data: imageBase64, status, error, fetchStatus } = useQuery<string | null>({
        queryKey: recipeUuid ? queryKeys.recipes.image(recipeUuid) : ['recipes', 'noop', 'image'],
        queryFn: async () => {
            const email = localStorage.getItem('email');
            const token = localStorage.getItem('firebaseIdToken');
            console.log('[WatchSync] fetching image', { recipeUuid, hasEmail: !!email, hasToken: !!token });
            const response = await BackendService.getRecipeImage(recipeUuid!, email, token);
            console.log('[WatchSync] fetch response', { hasImageData: !!response?.imageData, generated: response?.generated });
            return response?.imageData ?? null;
        },
        enabled: isIOS && !!recipeUuid,
        staleTime: 60 * 60 * 1000,
    });

    console.log('[WatchSync] state', {
        isIOS,
        recipeUuid,
        recipeName,
        status,
        fetchStatus,
        hasImage: !!imageBase64,
        imageLength: imageBase64?.length,
        error: error?.toString(),
    });

    useEffect(() => {
        if (!isIOS) {
            console.log('[WatchSync] skip: not iOS');
            return;
        }
        if (!recipeName) {
            console.log('[WatchSync] skip: no recipeName yet');
            return;
        }
        if (!imageBase64) {
            console.log('[WatchSync] skip: no imageBase64 yet');
            return;
        }

        console.log('[WatchSync] calling setCurrentRecipe', { name: recipeName, imageLength: imageBase64.length });

        WatchBridge.setCurrentRecipe({ name: recipeName, imageBase64 })
            .then(() => console.log('[WatchSync] setCurrentRecipe OK'))
            .catch((err) => console.warn('[WatchSync] setCurrentRecipe failed', err));

        return () => {
            console.log('[WatchSync] cleanup: calling clearCurrentRecipe');
            WatchBridge.clearCurrentRecipe()
                .then(() => console.log('[WatchSync] clearCurrentRecipe OK'))
                .catch((err) => console.warn('[WatchSync] clearCurrentRecipe failed', err));
        };
    }, [isIOS, recipeName, imageBase64]);
}
