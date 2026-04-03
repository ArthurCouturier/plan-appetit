import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import BackendService from '../services/BackendService';
import { queryKeys } from '../queryConfig';

const BATCH_DELAY = 80;
const BATCH_MAX_SIZE = 20;
const RETRY_DELAY = 1000;
const MAX_RETRIES = 20;

let pendingUuids: Set<string> = new Set();
let batchTimer: ReturnType<typeof setTimeout> | null = null;
let queryClientRef: ReturnType<typeof useQueryClient> | null = null;
let retryCount: Map<string, number> = new Map();

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
            } else if (!pending?.includes(uuid)) {
                queryClientRef!.setQueryData(queryKeys.recipes.image(uuid), null);
                retryCount.delete(uuid);
            }
        }

        // Re-poll for images still being generated
        if (pending && pending.length > 0) {
            const toRetry = pending.filter(uuid => {
                const count = retryCount.get(uuid) ?? 0;
                if (count >= MAX_RETRIES) {
                    queryClientRef!.setQueryData(queryKeys.recipes.image(uuid), null);
                    retryCount.delete(uuid);
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

function scheduleBatch(uuid: string) {
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

    useEffect(() => {
        const el = ref.current;
        if (!el || requested.current) return;

        if (imageData !== undefined) {
            requested.current = true;
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !requested.current) {
                    requested.current = true;
                    scheduleBatch(recipeUuid);
                    observer.disconnect();
                }
            },
            { rootMargin: '200px' }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [recipeUuid, imageData]);

    return { ref, data: imageData };
}
