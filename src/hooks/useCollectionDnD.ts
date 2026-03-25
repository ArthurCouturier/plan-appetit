import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
    pointerWithin,
    rectIntersection,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragEndEvent,
    CollisionDetection,
    MeasuringStrategy,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import RecipeCollectionInterface from "../api/interfaces/collections/RecipeCollectionInterface";
import RecipeSummaryInterface from "../api/interfaces/recipes/RecipeSummaryInterface";
import { useMoveCollectionToParent, useReorderCollectionItems } from "../api/hooks/useCollectionMutations";
import { queryKeys } from "../api/queryConfig";
import { RecipeSortOption, getInitialSort } from "../components/collections/RecipeSortSelect";

export type DragItemType = {
    type: 'recipe' | 'collection';
    recipe?: RecipeSummaryInterface;
    collection?: RecipeCollectionInterface;
};

interface UseCollectionDnDParams {
    collection: RecipeCollectionInterface | null | undefined;
    uuid: string | undefined;
    isMobile: boolean;
    refetch: () => Promise<unknown>;
}

export default function useCollectionDnD({ collection, uuid, isMobile, refetch }: UseCollectionDnDParams) {
    const queryClient = useQueryClient();
    const [activeItem, setActiveItem] = useState<DragItemType | null>(null);
    const [sortOption, setSortOption] = useState<RecipeSortOption>("custom");
    const [isReordering, setIsReordering] = useState(false);
    const recipeSnapshotRef = useRef<RecipeSummaryInterface[] | null>(null);

    const moveCollectionMutation = useMoveCollectionToParent();
    const reorderMutation = useReorderCollectionItems();

    useEffect(() => {
        if (uuid) setSortOption(getInitialSort(uuid));
    }, [uuid]);

    // Sensors
    const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 8 } });
    const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } });
    const reorderTouchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 80, tolerance: 5 } });
    const keyboardSensor = useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates });

    const sensors = useSensors(
        ...(isMobile ? [isReordering ? reorderTouchSensor : touchSensor] : [pointerSensor]),
        keyboardSensor
    );

    const measuring = useMemo(() => ({
        droppable: { strategy: MeasuringStrategy.WhileDragging },
    }), []);

    const collisionDetection: CollisionDetection = useCallback((args) => {
        const dominated = pointerWithin(args);
        const droppableCollision = dominated.find(
            (collision) => String(collision.id).startsWith('droppable-collection-')
        );

        if (droppableCollision) {
            const activeId = String(args.active.id);
            const targetUuid = String(droppableCollision.id).replace('droppable-collection-', '');
            if (activeId !== `collection-${targetUuid}`) {
                return [droppableCollision];
            }
        }

        const rectCollisions = rectIntersection(args);
        return rectCollisions.length > 0 ? rectCollisions : dominated;
    }, []);

    // Cache helper
    const setCollectionCache = useCallback((updater: (prev: RecipeCollectionInterface) => RecipeCollectionInterface) => {
        if (!uuid) return;
        queryClient.setQueryData(
            queryKeys.collections.byId(uuid),
            (prev: RecipeCollectionInterface | null | undefined) => prev ? updater(prev) : prev
        );
    }, [uuid, queryClient]);

    // Drag handlers
    const onDragStart = useCallback((event: DragStartEvent) => {
        const activeData = event.active.data.current;
        if (activeData?.type === 'recipe') {
            setActiveItem({ type: 'recipe', recipe: activeData.recipe });
        } else if (activeData?.type === 'collection') {
            setActiveItem({ type: 'collection', collection: activeData.collection });
        }
    }, []);

    const onDragEnd = useCallback(async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveItem(null);

        if (!over || !collection) return;

        const activeId = String(active.id);
        const overId = String(over.id);
        const activeData = active.data.current;

        if (overId.startsWith('droppable-collection-') && activeData?.type === 'collection' && activeData.collection) {
            const targetCollectionUuid = overId.replace('droppable-collection-', '');
            const updatedSubCollections = (collection.subCollections || []).filter(c => c.uuid !== activeData.collection!.uuid);
            setCollectionCache(prev => ({ ...prev, subCollections: updatedSubCollections }));
            try {
                await moveCollectionMutation.mutateAsync({
                    collectionUuid: String(activeData.collection!.uuid),
                    newParentCollectionUuid: targetCollectionUuid,
                });
            } catch (err) {
                console.error('Erreur lors du déplacement de la collection:', err);
                refetch();
            }
            return;
        }

        if (activeId === overId) return;

        const isActiveRecipe = activeId.startsWith('recipe-');
        const isOverRecipe = overId.startsWith('recipe-');
        const isActiveCollection = activeId.startsWith('collection-');
        const isOverCollection = overId.startsWith('collection-');

        if (isActiveRecipe && isOverRecipe) {
            const recipes = [...(collection.recipes || [])];
            const activeIndex = recipes.findIndex(r => `recipe-${r.uuid}` === activeId);
            const overIndex = recipes.findIndex(r => `recipe-${r.uuid}` === overId);

            if (activeIndex !== -1 && overIndex !== -1) {
                const [movedRecipe] = recipes.splice(activeIndex, 1);
                recipes.splice(overIndex, 0, movedRecipe);
                const updatedRecipes = recipes.map((recipe, index) => ({ ...recipe, displayOrder: index }));
                setCollectionCache(prev => ({ ...prev, recipes: updatedRecipes }));
            }
        } else if (isActiveCollection && isOverCollection) {
            const subCollections = [...(collection.subCollections || [])];
            const activeIndex = subCollections.findIndex(c => `collection-${c.uuid}` === activeId);
            const overIndex = subCollections.findIndex(c => `collection-${c.uuid}` === overId);

            if (activeIndex !== -1 && overIndex !== -1) {
                const [movedCollection] = subCollections.splice(activeIndex, 1);
                subCollections.splice(overIndex, 0, movedCollection);
                const updatedCollections = subCollections.map((coll, index) => ({ ...coll, displayOrder: index }));
                setCollectionCache(prev => ({ ...prev, subCollections: updatedCollections }));

                const subCollectionOrders = updatedCollections.map((c, index) => ({
                    uuid: String(c.uuid), displayOrder: index,
                }));
                try {
                    await reorderMutation.mutateAsync({
                        collectionUuid: uuid!, recipeOrders: undefined, subCollectionOrders,
                    });
                } catch (err) {
                    console.error('Erreur lors de la sauvegarde de l\'ordre des collections:', err);
                    refetch();
                }
            }
        }
    }, [collection, uuid, setCollectionCache, moveCollectionMutation, reorderMutation, refetch]);

    const onDragCancel = useCallback(() => setActiveItem(null), []);

    // Reorder handlers
    const onStartReorder = useCallback(() => {
        if (!collection) return;
        recipeSnapshotRef.current = [...(collection.recipes || [])];
        setSortOption("custom");
        setIsReordering(true);
    }, [collection]);

    const onValidateReorder = useCallback(async () => {
        if (!collection || !uuid) return;
        const recipeOrders = (collection.recipes || []).map((r, index) => ({
            uuid: String(r.uuid), displayOrder: index,
        }));
        try {
            await reorderMutation.mutateAsync({
                collectionUuid: uuid, recipeOrders, subCollectionOrders: undefined,
            });
        } catch (err) {
            console.error('Erreur lors de la sauvegarde de l\'ordre:', err);
            if (recipeSnapshotRef.current) {
                setCollectionCache(prev => ({ ...prev, recipes: recipeSnapshotRef.current! }));
            }
        }
        recipeSnapshotRef.current = null;
        setIsReordering(false);
    }, [collection, uuid, reorderMutation, setCollectionCache]);

    const onCancelReorder = useCallback(() => {
        if (recipeSnapshotRef.current) {
            setCollectionCache(prev => ({ ...prev, recipes: recipeSnapshotRef.current! }));
        }
        recipeSnapshotRef.current = null;
        setIsReordering(false);
    }, [setCollectionCache]);

    return {
        sensors,
        measuring,
        collisionDetection,
        activeItem,
        sortOption,
        setSortOption,
        isReordering,
        setCollectionCache,
        onDragStart,
        onDragEnd,
        onDragCancel,
        onStartReorder,
        onValidateReorder,
        onCancelReorder,
    };
}
