import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../queryConfig';
import CollectionService from '../services/CollectionService';
import useAuth from './useAuth';
import RecipeCollectionInterface from '../interfaces/collections/RecipeCollectionInterface';

const STORAGE_PREFIX = 'collection_cache_';

function getCachedCollection(uuid: string): RecipeCollectionInterface | undefined {
    try {
        const raw = localStorage.getItem(STORAGE_PREFIX + uuid);
        if (!raw) return undefined;
        return JSON.parse(raw);
    } catch {
        return undefined;
    }
}

function setCachedCollection(uuid: string, data: RecipeCollectionInterface) {
    try {
        localStorage.setItem(STORAGE_PREFIX + uuid, JSON.stringify(data));
    } catch {
        // quota exceeded, silently fail
    }
}

export function useDefaultCollection() {
    const { user } = useAuth();

    return useQuery({
        queryKey: queryKeys.collections.default(),
        queryFn: () => CollectionService.getDefaultCollection(),
        enabled: !!user,
    });
}

export function useCollection(uuid: string | undefined) {
    const { user } = useAuth();

    const query = useQuery({
        queryKey: queryKeys.collections.byId(uuid!),
        queryFn: () => CollectionService.getCollectionById(uuid!),
        enabled: !!uuid && !!user,
        placeholderData: () => (uuid ? getCachedCollection(uuid) : undefined) as any,
        refetchInterval: 60_000,
    });

    useEffect(() => {
        if (uuid && query.data && !query.isPlaceholderData) {
            setCachedCollection(uuid, query.data);
        }
    }, [uuid, query.data, query.isPlaceholderData]);

    return query;
}
