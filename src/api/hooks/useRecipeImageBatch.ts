import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import BackendService from '../services/BackendService';
import { queryKeys } from '../queryConfig';

const BATCH_DELAY = 80;
const BATCH_MAX_SIZE = 20;
// Image gen v2 latence observée : 20-30s par recette (gpt-image-2 ~22-30s).
// Pour un BC qui déclenche 5 générations en parallèle juste avant l'arrivée sur la page,
// les images peuvent encore être en cours bien après l'ouverture. On donne 2 minutes de
// retry confortable (60 × 2s) pour éviter les "fail" prématurés observés sur RecipeCard.
const RETRY_DELAY = 2000;
const MAX_RETRIES = 60;
const NULL_RECHECK_MS = 30_000;

let pendingUuids: Set<string> = new Set();
let batchTimer: ReturnType<typeof setTimeout> | null = null;
let queryClientRef: ReturnType<typeof useQueryClient> | null = null;
let retryCount: Map<string, number> = new Map();
let nullTimestamps: Map<string, number> = new Map();

function flushBatch() {
    batchTimer = null;
    if (pendingUuids.size === 0 || !queryClientRef) return;

    const uuids = [...pendingUuids];
    pendingUuids.clear();

    const uncached = uuids.filter(uuid =>
        queryClientRef!.getQueryData(queryKeys.recipes.image(uuid)) === undefined
    );

    if (uncached.length === 0) return;

    BackendService.getRecipeImagesBatch(uncached).then(({ images, pending }) => {
        for (const uuid of uncached) {
            if (images[uuid]) {
                queryClientRef!.setQueryData(queryKeys.recipes.image(uuid), images[uuid]);
                retryCount.delete(uuid);
                nullTimestamps.delete(uuid);
            } else if (!pending?.includes(uuid)) {
                queryClientRef!.setQueryData(queryKeys.recipes.image(uuid), null);
                retryCount.delete(uuid);
                nullTimestamps.set(uuid, Date.now());
            }
        }

        if (pending && pending.length > 0) {
            const toRetry = pending.filter(uuid => {
                const count = retryCount.get(uuid) ?? 0;
                if (count >= MAX_RETRIES) {
                    queryClientRef!.setQueryData(queryKeys.recipes.image(uuid), null);
                    retryCount.delete(uuid);
                    nullTimestamps.set(uuid, Date.now());
                    return false;
                }
                retryCount.set(uuid, count + 1);
                return true;
            });

            if (toRetry.length > 0) {
                setTimeout(() => {
                    toRetry.forEach(uuid => pendingUuids.add(uuid));
                    flushBatch();
                }, RETRY_DELAY);
            }
        }
    }).catch(() => { });
}

function recheckNull(uuid: string) {
    const ts = nullTimestamps.get(uuid);
    if (ts && Date.now() - ts < NULL_RECHECK_MS) return;
    if (queryClientRef) {
        queryClientRef.setQueryData(queryKeys.recipes.image(uuid), undefined);
        nullTimestamps.delete(uuid);
    }
    scheduleBatch(uuid);
}

export function scheduleBatch(uuid: string) {
    pendingUuids.add(uuid);

    if (pendingUuids.size >= BATCH_MAX_SIZE) {
        if (batchTimer) clearTimeout(batchTimer);
        flushBatch();
        return;
    }

    if (!batchTimer) {
        batchTimer = setTimeout(flushBatch, BATCH_DELAY);
    }
}

export function useRecipeImageVisible(recipeUuid: string) {
    const queryClient = useQueryClient();
    const ref = useRef<HTMLDivElement>(null);
    const requested = useRef(false);
    const [imageData, setImageData] = useState<string | null | undefined>(() =>
        queryClient.getQueryData(queryKeys.recipes.image(recipeUuid))
    );

    queryClientRef = queryClient;

    useEffect(() => {
        const unsubscribe = queryClient.getQueryCache().subscribe(() => {
            const data = queryClient.getQueryData<string | null>(queryKeys.recipes.image(recipeUuid));
            if (data !== undefined) setImageData(data);
        });
        return unsubscribe;
    }, [recipeUuid, queryClient]);

    const recheckIfNull = useCallback(() => {
        const cached = queryClient.getQueryData<string | null>(queryKeys.recipes.image(recipeUuid));
        if (cached === null) {
            recheckNull(recipeUuid);
        }
    }, [recipeUuid, queryClient]);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        if (imageData !== undefined && imageData !== null) {
            requested.current = true;
            return;
        }

        if (imageData === null) {
            requested.current = false;
        }

        if (requested.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !requested.current) {
                    requested.current = true;
                    if (imageData === null) {
                        recheckIfNull();
                    } else {
                        scheduleBatch(recipeUuid);
                    }
                    observer.disconnect();
                }
            },
            { rootMargin: '200px' }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [recipeUuid, imageData, recheckIfNull]);

    return { ref, data: imageData };
}
