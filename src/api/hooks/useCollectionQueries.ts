import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../queryConfig';
import RecipeCollectionV2Service, { RecipeCollectionV2NotFoundError } from '../services/RecipeCollectionV2Service';
import {
    RecipeCollectionV2BasicInfoDTO,
    RecipeCollectionV2DTO,
} from '../interfaces/v2/RecipeCollectionV2';
import { RecipeV2CardSummaryDTO } from '../interfaces/v2/RecipeV2';
import useAuth from './useAuth';
import RecipeCollectionInterface from '../interfaces/collections/RecipeCollectionInterface';
import CollectionBasicInfoInterface from '../interfaces/collections/CollectionBasicInfoInterface';
import RecipeSummaryInterface from '../interfaces/recipes/RecipeSummaryInterface';

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

function mapV2BasicInfoToV0(basic: RecipeCollectionV2BasicInfoDTO): CollectionBasicInfoInterface {
    return {
        uuid: basic.uuid,
        name: basic.name,
        level: basic.level,
        isDefault: basic.isDefault,
        displayOrder: basic.displayOrder,
        parentCollectionUuid: basic.parentCollectionUuid,
    };
}

function mapV2BasicInfoToV0Collection(basic: RecipeCollectionV2BasicInfoDTO): RecipeCollectionInterface {
    return {
        uuid: basic.uuid,
        name: basic.name,
        level: basic.level,
        isDefault: basic.isDefault,
        isPublic: false,
        displayOrder: basic.displayOrder,
        createdAt: '',
        lastUpdated: '',
        parentCollectionUuid: basic.parentCollectionUuid,
        parentCollectionName: null,
        subCollections: [],
        recipes: [],
    };
}

function mapV2RecipeSummaryToV0(summary: RecipeV2CardSummaryDTO, index: number): RecipeSummaryInterface {
    return {
        uuid: summary.uuid,
        name: summary.name,
        covers: summary.covers,
        buyPrice: summary.buyPrice ?? 0,
        isPublic: false,
        displayOrder: index,
        creationDate: summary.creationDate,
        totalTimeMin: summary.totalTimeMin,
        restTimeMin: summary.restTimeMin,
    };
}

function mapV2CollectionToV0(v2: RecipeCollectionV2DTO): RecipeCollectionInterface {
    return {
        uuid: v2.uuid,
        name: v2.name,
        level: v2.level,
        isDefault: v2.isDefault,
        isPublic: v2.isPublic,
        displayOrder: v2.displayOrder,
        createdAt: '',
        lastUpdated: '',
        parentCollectionUuid: v2.parentCollectionUuid,
        parentCollectionName: null,
        subCollections: v2.subCollections.map((sub) => mapV2BasicInfoToV0Collection(sub)),
        recipes: v2.recipes.map((r, i) => mapV2RecipeSummaryToV0(r, i)),
    };
}

export function useDefaultCollection() {
    const { user } = useAuth();

    return useQuery<CollectionBasicInfoInterface>({
        queryKey: queryKeys.collections.default(),
        queryFn: async () => {
            const dto = await RecipeCollectionV2Service.getDefaultCollection();
            return mapV2BasicInfoToV0(dto);
        },
        enabled: !!user,
    });
}

export function useCollection(uuid: string | undefined) {
    const { user } = useAuth();

    const query = useQuery<RecipeCollectionInterface | null>({
        queryKey: queryKeys.collections.byId(uuid!),
        queryFn: async () => {
            try {
                const dto = await RecipeCollectionV2Service.getCollection(uuid!);
                return mapV2CollectionToV0(dto);
            } catch (err) {
                if (err instanceof RecipeCollectionV2NotFoundError) {
                    return null;
                }
                throw err;
            }
        },
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
