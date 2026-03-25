import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FolderIcon, DocumentTextIcon, ArrowLeftIcon, CheckIcon, XMarkIcon, PencilIcon } from "@heroicons/react/24/solid";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import QuickActionButton from "../components/buttons/QuickActionButton";
import CreateCollectionModal from "../components/popups/CreateCollectionModal";
import SortableRecipeCard from "../components/dnd/SortableRecipeCard";
import { useQueryClient } from "@tanstack/react-query";
import {
    DndContext,
    DragOverlay,
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
import {
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import RecipeCollectionInterface from "../api/interfaces/collections/RecipeCollectionInterface";
import RecipeSummaryInterface from "../api/interfaces/recipes/RecipeSummaryInterface";
import { useCollection } from "../api/hooks/useCollectionQueries";
import { useMoveCollectionToParent, useReorderCollectionItems } from "../api/hooks/useCollectionMutations";
import { queryKeys } from "../api/queryConfig";
import DroppableCollectionCard from "../components/dnd/DroppableCollectionCard";
import ParentDropZone from "../components/dnd/ParentDropZone";
import RecipeCard from "../components/cards/RecipeCard";
import CollectionCard from "../components/cards/CollectionCard";
import QuickActions from "../components/actions/QuickActions";
import EmptyCollectionCTA from "../components/collections/EmptyCollectionCTA";
import Header from "../components/global/Header";
import EditableCollectionTitle from "../components/collections/EditableCollectionTitle";
import RecipeSortSelect, { RecipeSortOption, getInitialSort, sortRecipes } from "../components/collections/RecipeSortSelect";

type DragItemType = {
    type: 'recipe' | 'collection';
    recipe?: RecipeSummaryInterface;
    collection?: RecipeCollectionInterface;
};

export default function CollectionDetail() {
    const { uuid } = useParams<{ uuid: string }>();
    const queryClient = useQueryClient();

    const { data: collection, isLoading, isError, refetch } = useCollection(uuid);

    const [isMobile, setIsMobile] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activeItem, setActiveItem] = useState<DragItemType | null>(null);
    const [sortOption, setSortOption] = useState<RecipeSortOption>("custom");
    const [isReordering, setIsReordering] = useState(false);
    const recipeSnapshotRef = useRef<RecipeSummaryInterface[] | null>(null);

    useEffect(() => {
        if (uuid) setSortOption(getInitialSort(uuid));
    }, [uuid]);

    const moveCollectionMutation = useMoveCollectionToParent();
    const reorderMutation = useReorderCollectionItems();

    const pointerSensor = useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8,
        },
    });

    const touchSensor = useSensor(TouchSensor, {
        activationConstraint: {
            delay: 250,
            tolerance: 5,
        },
    });

    const reorderTouchSensor = useSensor(TouchSensor, {
        activationConstraint: {
            delay: 80,
            tolerance: 5,
        },
    });

    const keyboardSensor = useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
    });

    const sensors = useSensors(
        ...(isMobile ? [isReordering ? reorderTouchSensor : touchSensor] : [pointerSensor]),
        keyboardSensor
    );

    const measuring = useMemo(() => ({
        droppable: {
            strategy: MeasuringStrategy.WhileDragging,
        },
    }), []);

    const customCollisionDetection: CollisionDetection = useCallback((args) => {
        const dominated = pointerWithin(args);

        const droppableCollision = dominated.find(
            (collision) => String(collision.id).startsWith('droppable-collection-')
        );

        if (droppableCollision) {
            const activeId = String(args.active.id);
            const droppableId = String(droppableCollision.id);
            const targetUuid = droppableId.replace('droppable-collection-', '');

            const isActiveThisCollection = activeId === `collection-${targetUuid}`;

            if (!isActiveThisCollection) {
                return [droppableCollision];
            }
        }

        const rectCollisions = rectIntersection(args);
        return rectCollisions.length > 0 ? rectCollisions : dominated;
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const setCollectionCache = useCallback((updater: (prev: RecipeCollectionInterface) => RecipeCollectionInterface) => {
        if (!uuid) return;
        queryClient.setQueryData(
            queryKeys.collections.byId(uuid),
            (prev: RecipeCollectionInterface | null | undefined) => prev ? updater(prev) : prev
        );
    }, [uuid, queryClient]);

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const activeData = active.data.current;

        if (activeData?.type === 'recipe') {
            setActiveItem({ type: 'recipe', recipe: activeData.recipe });
        } else if (activeData?.type === 'collection') {
            setActiveItem({ type: 'collection', collection: activeData.collection });
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        setActiveItem(null);

        if (!over || !collection) return;

        const activeId = String(active.id);
        const overId = String(over.id);
        const activeData = active.data.current;

        if (overId.startsWith('droppable-collection-') && activeData?.type === 'collection' && activeData.collection) {
            const targetCollectionUuid = overId.replace('droppable-collection-', '');
            await handleMoveCollectionToCollection(activeData.collection, targetCollectionUuid);
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

                const updatedRecipes = recipes.map((recipe, index) => ({
                    ...recipe,
                    displayOrder: index,
                }));

                setCollectionCache(prev => ({ ...prev, recipes: updatedRecipes }));
            }
        } else if (isActiveCollection && isOverCollection) {
            const subCollections = [...(collection.subCollections || [])];
            const activeIndex = subCollections.findIndex(c => `collection-${c.uuid}` === activeId);
            const overIndex = subCollections.findIndex(c => `collection-${c.uuid}` === overId);

            if (activeIndex !== -1 && overIndex !== -1) {
                const [movedCollection] = subCollections.splice(activeIndex, 1);
                subCollections.splice(overIndex, 0, movedCollection);

                const updatedCollections = subCollections.map((coll, index) => ({
                    ...coll,
                    displayOrder: index,
                }));

                setCollectionCache(prev => ({ ...prev, subCollections: updatedCollections }));

                await handleSaveCollectionOrder(updatedCollections);
            }
        }
    };

    const handleMoveCollectionToCollection = async (movedCollection: RecipeCollectionInterface, targetCollectionUuid: string) => {
        if (!collection) return;

        const updatedSubCollections = (collection.subCollections || []).filter(c => c.uuid !== movedCollection.uuid);
        setCollectionCache(prev => ({ ...prev, subCollections: updatedSubCollections }));

        try {
            await moveCollectionMutation.mutateAsync({
                collectionUuid: String(movedCollection.uuid),
                newParentCollectionUuid: targetCollectionUuid,
            });
        } catch (err) {
            console.error('Erreur lors du déplacement de la collection:', err);
            refetch();
        }
    };

    const handleSaveCollectionOrder = async (collections: RecipeCollectionInterface[]) => {
        if (!uuid) return;

        const subCollectionOrders = collections.map((c, index) => ({
            uuid: String(c.uuid),
            displayOrder: index,
        }));

        try {
            await reorderMutation.mutateAsync({
                collectionUuid: uuid,
                recipeOrders: undefined,
                subCollectionOrders,
            });
        } catch (err) {
            console.error('Erreur lors de la sauvegarde de l\'ordre des collections:', err);
            refetch();
        }
    };

    const handleDragCancel = () => {
        setActiveItem(null);
    };

    const handleNameChange = (newName: string) => {
        setCollectionCache(prev => ({ ...prev, name: newName }));
    };

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await refetch();
        } finally {
            setIsRefreshing(false);
        }
    }, [refetch]);

    const handleStartReorder = useCallback(() => {
        if (!collection) return;
        recipeSnapshotRef.current = [...(collection.recipes || [])];
        setSortOption("custom");
        setIsReordering(true);
    }, [collection]);

    const handleValidateReorder = useCallback(async () => {
        if (!collection || !uuid) return;
        const recipes = collection.recipes || [];
        const recipeOrders = recipes.map((r, index) => ({
            uuid: String(r.uuid),
            displayOrder: index,
        }));
        try {
            await reorderMutation.mutateAsync({
                collectionUuid: uuid,
                recipeOrders,
                subCollectionOrders: undefined,
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

    const handleCancelReorder = useCallback(() => {
        if (recipeSnapshotRef.current) {
            setCollectionCache(prev => ({ ...prev, recipes: recipeSnapshotRef.current! }));
        }
        recipeSnapshotRef.current = null;
        setIsReordering(false);
    }, [setCollectionCache]);

    if (isLoading || isRefreshing) {
        return <CollectionDetailSkeleton isMobile={isMobile} />;
    }

    if (isError || !collection) {
        return <CollectionNotFound error={isError ? "Erreur lors du chargement de la collection" : null} isMobile={isMobile} />;
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={customCollisionDetection}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
            measuring={measuring}
        >
            {isMobile ? (
                <CollectionDetailMobile
                    collection={collection}
                    onCollectionCreated={handleRefresh}
                    onNameChange={handleNameChange}
                    isDragging={activeItem !== null}
                    onRefresh={handleRefresh}
                    sortOption={sortOption}
                    onSortChange={setSortOption}
                    isReordering={isReordering}
                    onStartReorder={handleStartReorder}
                    onValidateReorder={handleValidateReorder}
                    onCancelReorder={handleCancelReorder}
                />
            ) : (
                <CollectionDetailDesktop
                    collection={collection}
                    onCollectionCreated={handleRefresh}
                    onNameChange={handleNameChange}
                    isDragging={activeItem !== null}
                    onRefresh={handleRefresh}
                    sortOption={sortOption}
                    onSortChange={setSortOption}
                    isReordering={isReordering}
                    onStartReorder={handleStartReorder}
                    onValidateReorder={handleValidateReorder}
                    onCancelReorder={handleCancelReorder}
                />
            )}
            <DragOverlay>
                {activeItem?.type === 'recipe' && activeItem.recipe && (
                    <div className="flex items-center gap-3 bg-primary border border-cout-base rounded-xl px-4 py-3 shadow-lg select-none cursor-grabbing">
                        <span className="text-sm font-medium text-text-primary truncate">{activeItem.recipe.name}</span>
                    </div>
                )}
                {activeItem?.type === 'collection' && activeItem.collection && (
                    <CollectionCard collection={activeItem.collection} isMobile={isMobile} />
                )}
            </DragOverlay>
        </DndContext>
    );
}

function CollectionDetailSkeleton({ isMobile }: { isMobile: boolean }) {
    return (
        <div className={`min-h-screen bg-bg-color flex items-center justify-center ${isMobile ? 'px-4 pb-24 mobile-content-with-header' : 'p-6'}`}>
            <div className="animate-pulse text-text-secondary">Chargement en cours...</div>
        </div>
    );
}

function CollectionNotFound({ error, isMobile }: { error: string | null; isMobile: boolean }) {
    const navigate = useNavigate();

    return (
        <div className={`min-h-screen bg-bg-color ${isMobile ? 'px-4 pb-24 mobile-content-with-header' : 'p-6'}`}>
            {!isMobile && (
                <Header back={true} home={true} title={true} profile={true} pageName="Collection" />
            )}
            <div className="flex flex-col items-center justify-center py-16">
                <FolderIcon className="w-24 h-24 text-text-secondary opacity-50 mb-4" />
                <h2 className="text-2xl font-bold text-text-primary mb-2">
                    {error || "Collection introuvable"}
                </h2>
                <p className="text-text-secondary mb-6">
                    Cette collection n'existe pas ou vous n'avez pas les droits pour y accéder.
                </p>
                <button
                    onClick={() => navigate('/recettes')}
                    className="flex items-center gap-2 px-6 py-3 bg-cout-base text-white font-bold rounded-xl hover:bg-cout-purple transition-colors"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                    Retour à mes recettes
                </button>
            </div>
        </div>
    );
}

type CollectionDetailLayoutProps = {
    collection: RecipeCollectionInterface;
    onCollectionCreated: () => void;
    onNameChange: (newName: string) => void;
    isDragging: boolean;
    onRefresh: () => void;
    sortOption: RecipeSortOption;
    onSortChange: (sort: RecipeSortOption) => void;
    isReordering: boolean;
    onStartReorder: () => void;
    onValidateReorder: () => void;
    onCancelReorder: () => void;
};

function CollectionDetailMobile({ collection, onCollectionCreated, onNameChange, isDragging, onRefresh, sortOption, onSortChange, isReordering, onStartReorder, onValidateReorder, onCancelReorder }: CollectionDetailLayoutProps) {
    const [showCreateCollection, setShowCreateCollection] = useState(false);
    const subCollections = collection.subCollections || [];
    const recipes = collection.recipes || [];
    const sortedRecipes = useMemo(() => sortRecipes(recipes, sortOption), [recipes, sortOption]);

    const collectionIds = subCollections.map(c => `collection-${c.uuid}`);

    const hasParent = !!collection.parentCollectionUuid;

    const isEmpty = subCollections.length === 0 && recipes.length === 0;

    return (
        <div className={`min-h-screen bg-bg-color px-4 pb-8 mobile-content-with-header ${isEmpty && collection.isDefault ? 'flex flex-col' : ''}`}>
            {isEmpty && collection.isDefault ? (
                <div className="flex-1 flex items-center justify-center">
                    <EmptyCollectionCTA />
                </div>
            ) : (
                <>
                    <div className="mb-6">
                        <div className="flex items-center gap-2">
                            <EditableCollectionTitle
                                collectionUuid={collection.uuid!}
                                name={collection.name}
                                onNameChange={onNameChange}
                                isMobile={true}
                            />
                            <button
                                onClick={onRefresh}
                                className="p-1.5 rounded-lg hover:bg-secondary transition-colors mb-2 font-bold"
                                title="Rafraîchir"
                            >
                                <ArrowPathIcon className="w-5 h-5 text-cout-base" />
                            </button>
                            <div className="mb-2 ml-auto">
                                <QuickActionButton
                                    icon="/icons/AjouterCollection.svg"
                                    iconSize={22}
                                    title="Ajouter Collection"
                                    onClick={() => setShowCreateCollection(true)}
                                    mini
                                />
                            </div>
                        </div>
                        <p className="text-text-secondary text-sm">
                            {recipes.length} recette{recipes.length > 1 ? 's' : ''}
                            {subCollections.length > 0 && ` • ${subCollections.length} sous-collection${subCollections.length > 1 ? 's' : ''}`}
                        </p>
                    </div>

                    <QuickActions isMobile={true} />
                </>
            )}

            {hasParent && (
                <ParentDropZone
                    parentCollectionUuid={collection.parentCollectionUuid!}
                    parentCollectionName={collection.parentCollectionName || undefined}
                    isMobile={true}
                    isVisible={isDragging}
                />
            )}

            {subCollections.length > 0 && (
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-text-primary mb-3 flex items-center gap-2">
                        <FolderIcon className="w-5 h-5 text-cout-yellow" />
                        Sous-collections
                    </h2>
                    <SortableContext items={collectionIds} strategy={rectSortingStrategy}>
                        <div className="space-y-3">
                            {subCollections.map((subCollection) => (
                                <DroppableCollectionCard
                                    key={subCollection.uuid}
                                    collection={subCollection}
                                    isMobile={true}
                                    isDraggingItem={isDragging}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </div>
            )}

            {recipes.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <DocumentTextIcon className="w-5 h-5 text-cout-base" />
                        <h2 className="text-lg font-bold text-text-primary">Recettes</h2>
                        {!isReordering && (
                            <RecipeSortSelect
                                collectionUuid={String(collection.uuid)}
                                currentSort={sortOption}
                                onSortChange={onSortChange}
                            />
                        )}
                        {isReordering ? (
                            <div className="flex items-center gap-2 ml-auto">
                                <button
                                    onClick={onCancelReorder}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-cancel-1 text-white text-sm font-bold rounded-lg hover:brightness-110 transition-all"
                                >
                                    <XMarkIcon className="w-4 h-4" />
                                    Annuler
                                </button>
                                <button
                                    onClick={onValidateReorder}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-confirmation-1 text-white text-sm font-bold rounded-lg hover:brightness-110 transition-all"
                                >
                                    <CheckIcon className="w-4 h-4" />
                                    Valider
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={onStartReorder}
                                className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                                title="Réorganiser les recettes"
                            >
                                <PencilIcon className="w-4 h-4 text-cout-base" />
                            </button>
                        )}
                    </div>
                    {isReordering ? (
                        <SortableContext
                            items={recipes.map(r => `recipe-${r.uuid}`)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="flex flex-col gap-2">
                                {recipes.map((recipe) => (
                                    <SortableRecipeCard
                                        key={String(recipe.uuid)}
                                        recipe={recipe}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            {sortedRecipes.map((recipe) => (
                                <RecipeCard
                                    key={String(recipe.uuid)}
                                    recipe={recipe}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            <CreateCollectionModal
                isOpen={showCreateCollection}
                onClose={() => setShowCreateCollection(false)}
                parentCollectionUuid={collection.uuid}
                onCollectionCreated={onCollectionCreated}
            />
        </div>
    );
}

function CollectionDetailDesktop({ collection, onCollectionCreated, onNameChange, isDragging, onRefresh, sortOption, onSortChange, isReordering, onStartReorder, onValidateReorder, onCancelReorder }: CollectionDetailLayoutProps) {
    const [showCreateCollection, setShowCreateCollection] = useState(false);
    const subCollections = collection.subCollections || [];
    const recipes = collection.recipes || [];
    const sortedRecipes = useMemo(() => sortRecipes(recipes, sortOption), [recipes, sortOption]);

    const collectionIds = subCollections.map(c => `collection-${c.uuid}`);

    const hasParent = !!collection.parentCollectionUuid;
    const isEmpty = subCollections.length === 0 && recipes.length === 0;

    const showEmptyCTA = isEmpty && collection.isDefault;

    return (
        <div className={`min-h-screen bg-bg-color p-6 ${showEmptyCTA ? 'flex flex-col' : ''}`}>
            {showEmptyCTA ? (
                <div className="flex-1 flex items-center justify-center">
                    <EmptyCollectionCTA />
                </div>
            ) : (
                <>
                    <Header
                        back={true}
                        home={true}
                        title={true}
                        profile={true}
                        pageName={
                            <div className="flex items-center gap-2">
                                <EditableCollectionTitle
                                    collectionUuid={collection.uuid!}
                                    name={collection.name}
                                    onNameChange={onNameChange}
                                />
                                <button
                                    onClick={onRefresh}
                                    className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                                    title="Rafraîchir"
                                >
                                    <ArrowPathIcon className="w-5 h-5 text-cout-base" />
                                </button>
                                <QuickActionButton
                                    icon="/icons/AjouterCollection.svg"
                                    iconSize={19}
                                    title="Ajouter Collection"
                                    onClick={() => setShowCreateCollection(true)}
                                    mini
                                />
                            </div>
                        }
                    />

                    <div className="mt-6">
                        <div className="mb-8">
                            <p className="text-text-secondary ml-14">
                                {recipes.length} recette{recipes.length > 1 ? 's' : ''}
                                {subCollections.length > 0 && ` • ${subCollections.length} sous-collection${subCollections.length > 1 ? 's' : ''}`}
                            </p>
                        </div>

                        <QuickActions />

                        {hasParent && (
                            <ParentDropZone
                                parentCollectionUuid={collection.parentCollectionUuid!}
                                parentCollectionName={collection.parentCollectionName || undefined}
                                isMobile={false}
                                isVisible={isDragging}
                            />
                        )}

                        {subCollections.length > 0 && (
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-4">
                                    <FolderIcon className="w-6 h-6 text-cout-yellow" />
                                    <h2 className="text-xl font-bold text-text-primary">Sous-collections</h2>
                                    <span className="text-text-secondary text-sm">({subCollections.length})</span>
                                </div>
                                <SortableContext items={collectionIds} strategy={rectSortingStrategy}>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                                        {subCollections.map((subCollection) => (
                                            <DroppableCollectionCard
                                                key={subCollection.uuid}
                                                collection={subCollection}
                                                isMobile={false}
                                                isDraggingItem={isDragging}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </div>
                        )}

                        {recipes.length > 0 && (
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-4">
                                    <DocumentTextIcon className="w-6 h-6 text-cout-base" />
                                    <h2 className="text-xl font-bold text-text-primary">Recettes</h2>
                                    <span className="text-text-secondary text-sm">({recipes.length})</span>
                                    {!isReordering && (
                                        <RecipeSortSelect
                                            collectionUuid={String(collection.uuid)}
                                            currentSort={sortOption}
                                            onSortChange={onSortChange}
                                        />
                                    )}
                                    {isReordering ? (
                                        <div className="flex items-center gap-2 ml-auto">
                                            <button
                                                onClick={onCancelReorder}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-cancel-1 text-white text-sm font-bold rounded-lg hover:brightness-110 transition-all"
                                            >
                                                <XMarkIcon className="w-4 h-4" />
                                                Annuler
                                            </button>
                                            <button
                                                onClick={onValidateReorder}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-confirmation-1 text-white text-sm font-bold rounded-lg hover:brightness-110 transition-all"
                                            >
                                                <CheckIcon className="w-4 h-4" />
                                                Valider
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={onStartReorder}
                                            className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                                            title="Réorganiser les recettes"
                                        >
                                            <PencilIcon className="w-4 h-4 text-cout-base" />
                                        </button>
                                    )}
                                </div>
                                {isReordering ? (
                                    <SortableContext
                                        items={recipes.map(r => `recipe-${r.uuid}`)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <div className="flex flex-col gap-2 max-w-lg">
                                            {recipes.map((recipe) => (
                                                <SortableRecipeCard
                                                    key={String(recipe.uuid)}
                                                    recipe={recipe}
                                                />
                                            ))}
                                        </div>
                                    </SortableContext>
                                ) : (
                                    <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-4">
                                        {sortedRecipes.map((recipe) => (
                                            <RecipeCard
                                                key={String(recipe.uuid)}
                                                recipe={recipe}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                </>
            )}

            <CreateCollectionModal
                isOpen={showCreateCollection}
                onClose={() => setShowCreateCollection(false)}
                parentCollectionUuid={collection.uuid}
                onCollectionCreated={onCollectionCreated}
            />
        </div>
    );
}
