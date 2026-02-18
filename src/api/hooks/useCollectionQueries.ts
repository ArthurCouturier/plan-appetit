import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../queryConfig';
import CollectionService from '../services/CollectionService';
import useAuth from './useAuth';

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

    return useQuery({
        queryKey: queryKeys.collections.byId(uuid!),
        queryFn: () => CollectionService.getCollectionById(uuid!),
        enabled: !!uuid && !!user,
    });
}
