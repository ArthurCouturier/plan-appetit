import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../queryConfig';
import CollectionService from '../services/CollectionService';

export function useCreateCollection() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params: { name: string; isPublic: boolean; parentCollectionUuid?: string | null }) =>
            CollectionService.createCollection(params.name, params.isPublic, params.parentCollectionUuid),
        onSuccess: (_data, variables) => {
            if (variables.parentCollectionUuid) {
                queryClient.invalidateQueries({ queryKey: queryKeys.collections.byId(variables.parentCollectionUuid) });
            }
            queryClient.invalidateQueries({ queryKey: queryKeys.collections.default() });
        },
    });
}

export function useDeleteCollection() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (uuid: string) => CollectionService.deleteCollection(uuid),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.collections.all() });
        },
    });
}

export function useAddRecipeToCollection() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params: { collectionUuid: string; recipeUuid: string }) =>
            CollectionService.addRecipeToCollection(params.collectionUuid, params.recipeUuid),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.collections.byId(variables.collectionUuid) });
        },
    });
}

export function useRemoveRecipeFromCollection() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params: { collectionUuid: string; recipeUuid: string }) =>
            CollectionService.removeRecipeFromCollection(params.collectionUuid, params.recipeUuid),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.collections.byId(variables.collectionUuid) });
        },
    });
}

export function useMoveRecipeToCollection() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params: { recipeUuid: string; sourceCollectionUuid: string; targetCollectionUuid: string }) =>
            CollectionService.moveRecipeToCollection(params.recipeUuid, params.sourceCollectionUuid, params.targetCollectionUuid),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.collections.byId(variables.sourceCollectionUuid) });
            queryClient.invalidateQueries({ queryKey: queryKeys.collections.byId(variables.targetCollectionUuid) });
        },
    });
}

export function useMoveCollectionToParent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params: { collectionUuid: string; newParentCollectionUuid: string }) =>
            CollectionService.moveCollectionToParent(params.collectionUuid, params.newParentCollectionUuid),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.collections.all() });
        },
    });
}

export function useReorderCollectionItems() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params: {
            collectionUuid: string;
            recipeOrders?: Array<{ uuid: string; displayOrder: number }>;
            subCollectionOrders?: Array<{ uuid: string; displayOrder: number }>;
        }) => CollectionService.reorderCollectionItems(params.collectionUuid, params.recipeOrders, params.subCollectionOrders),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.collections.byId(variables.collectionUuid) });
        },
    });
}
