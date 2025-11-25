import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FolderIcon, DocumentTextIcon, ArrowLeftIcon } from "@heroicons/react/24/solid";
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
} from "@dnd-kit/core";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from "@dnd-kit/sortable";
import RecipeCollectionInterface from "../api/interfaces/collections/RecipeCollectionInterface";
import RecipeSummaryInterface from "../api/interfaces/recipes/RecipeSummaryInterface";
import CollectionService from "../api/services/CollectionService";
import DraggableRecipeCard from "../components/dnd/DraggableRecipeCard";
import DroppableCollectionCard from "../components/dnd/DroppableCollectionCard";
import ParentDropZone from "../components/dnd/ParentDropZone";
import RecipeCard from "../components/cards/RecipeCard";
import CollectionCard from "../components/cards/CollectionCard";
import QuickActions from "../components/actions/QuickActions";
import Header from "../components/global/Header";
import EditableCollectionTitle from "../components/collections/EditableCollectionTitle";
import useAuth from "../api/hooks/useAuth";

type DragItemType = {
    type: 'recipe' | 'collection';
    recipe?: RecipeSummaryInterface;
    collection?: RecipeCollectionInterface;
};

export default function CollectionDetail() {
    const { uuid } = useParams<{ uuid: string }>();
    const { user } = useAuth();

    const [collection, setCollection] = useState<RecipeCollectionInterface | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    const [activeItem, setActiveItem] = useState<DragItemType | null>(null);

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

    const keyboardSensor = useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
    });

    const sensors = useSensors(
        ...(isMobile ? [touchSensor] : [pointerSensor]),
        keyboardSensor
    );

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

    const refreshCollection = useCallback(async () => {
        if (!uuid || !user) return;

        try {
            const fetchedCollection = await CollectionService.getCollectionById(uuid);
            if (fetchedCollection) {
                setCollection(fetchedCollection);
            }
        } catch (err) {
            console.error('Erreur lors du refresh de la collection:', err);
        }
    }, [uuid, user]);

    useEffect(() => {
        const fetchCollection = async () => {
            if (!uuid || !user) return;

            try {
                setLoading(true);
                setError(null);
                const fetchedCollection = await CollectionService.getCollectionById(uuid);
                if (fetchedCollection) {
                    setCollection(fetchedCollection);
                } else {
                    setError("Collection introuvable");
                }
            } catch (err) {
                console.error('Erreur lors du fetch de la collection:', err);
                setError("Erreur lors du chargement de la collection");
            } finally {
                setLoading(false);
            }
        };

        fetchCollection();
    }, [uuid, user]);

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

        if (overId.startsWith('droppable-collection-') && activeData) {
            const targetCollectionUuid = overId.replace('droppable-collection-', '');

            if (activeData.type === 'recipe' && activeData.recipe) {
                await handleMoveRecipeToCollection(activeData.recipe, targetCollectionUuid);
            } else if (activeData.type === 'collection' && activeData.collection) {
                await handleMoveCollectionToCollection(activeData.collection, targetCollectionUuid);
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

                const updatedRecipes = recipes.map((recipe, index) => ({
                    ...recipe,
                    displayOrder: index,
                }));

                setCollection({
                    ...collection,
                    recipes: updatedRecipes,
                });

                await handleSaveRecipeOrder(updatedRecipes);
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

                setCollection({
                    ...collection,
                    subCollections: updatedCollections,
                });

                await handleSaveCollectionOrder(updatedCollections);
            }
        }
    };

    const handleMoveRecipeToCollection = async (recipe: RecipeSummaryInterface, targetCollectionUuid: string) => {
        if (!collection || !uuid) return;

        const updatedRecipes = (collection.recipes || []).filter(r => r.uuid !== recipe.uuid);
        setCollection({
            ...collection,
            recipes: updatedRecipes,
        });

        try {
            await CollectionService.moveRecipeToCollection(
                String(recipe.uuid),
                uuid,
                targetCollectionUuid
            );
        } catch (err) {
            console.error('Erreur lors du déplacement de la recette:', err);
            refreshCollection();
        }
    };

    const handleMoveCollectionToCollection = async (movedCollection: RecipeCollectionInterface, targetCollectionUuid: string) => {
        if (!collection) return;

        const updatedSubCollections = (collection.subCollections || []).filter(c => c.uuid !== movedCollection.uuid);
        setCollection({
            ...collection,
            subCollections: updatedSubCollections,
        });

        try {
            await CollectionService.moveCollectionToParent(
                String(movedCollection.uuid),
                targetCollectionUuid
            );
        } catch (err) {
            console.error('Erreur lors du déplacement de la collection:', err);
            refreshCollection();
        }
    };

    const handleSaveRecipeOrder = async (recipes: RecipeSummaryInterface[]) => {
        if (!uuid) return;

        const recipeOrders = recipes.map((r, index) => ({
            uuid: String(r.uuid),
            displayOrder: index,
        }));

        try {
            await CollectionService.reorderCollectionItems(uuid, recipeOrders, undefined);
        } catch (err) {
            console.error('Erreur lors de la sauvegarde de l\'ordre des recettes:', err);
            refreshCollection();
        }
    };

    const handleSaveCollectionOrder = async (collections: RecipeCollectionInterface[]) => {
        if (!uuid) return;

        const subCollectionOrders = collections.map((c, index) => ({
            uuid: String(c.uuid),
            displayOrder: index,
        }));

        try {
            await CollectionService.reorderCollectionItems(uuid, undefined, subCollectionOrders);
        } catch (err) {
            console.error('Erreur lors de la sauvegarde de l\'ordre des collections:', err);
            refreshCollection();
        }
    };

    const handleDragCancel = () => {
        setActiveItem(null);
    };

    const handleNameChange = (newName: string) => {
        if (collection) {
            setCollection({
                ...collection,
                name: newName,
            });
        }
    };

    if (loading) {
        return <CollectionDetailSkeleton isMobile={isMobile} />;
    }

    if (error || !collection) {
        return <CollectionNotFound error={error} isMobile={isMobile} />;
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={customCollisionDetection}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
            {isMobile ? (
                <CollectionDetailMobile
                    collection={collection}
                    onCollectionCreated={refreshCollection}
                    onNameChange={handleNameChange}
                    isDragging={activeItem !== null}
                />
            ) : (
                <CollectionDetailDesktop
                    collection={collection}
                    onCollectionCreated={refreshCollection}
                    onNameChange={handleNameChange}
                    isDragging={activeItem !== null}
                />
            )}
            <DragOverlay>
                {activeItem?.type === 'recipe' && activeItem.recipe && (
                    <RecipeCard recipe={activeItem.recipe} isMobile={isMobile} />
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
        <div className={`min-h-screen bg-bg-color ${isMobile ? 'px-4 pt-20 pb-24' : 'p-6'}`}>
            {!isMobile && (
                <Header back={true} home={true} title={true} profile={true} pageName="Collection" />
            )}
            <div className="mt-6 animate-pulse">
                <div className="h-8 bg-border-color rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-border-color rounded w-1/4 mb-8"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-primary rounded-xl border border-border-color p-6 h-40"></div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function CollectionNotFound({ error, isMobile }: { error: string | null; isMobile: boolean }) {
    const navigate = useNavigate();

    return (
        <div className={`min-h-screen bg-bg-color ${isMobile ? 'px-4 pt-20 pb-24' : 'p-6'}`}>
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
};

function CollectionDetailMobile({ collection, onCollectionCreated, onNameChange, isDragging }: CollectionDetailLayoutProps) {
    const subCollections = collection.subCollections || [];
    const recipes = collection.recipes || [];

    const collectionIds = subCollections.map(c => `collection-${c.uuid}`);
    const recipeIds = recipes.map(r => `recipe-${r.uuid}`);

    const hasParent = !!collection.parentCollectionUuid;

    return (
        <div className="min-h-screen bg-bg-color px-4 pt-20 pb-8">
            <div className="mb-6">
                <EditableCollectionTitle
                    collectionUuid={collection.uuid!}
                    name={collection.name}
                    onNameChange={onNameChange}
                    isMobile={true}
                />
                <p className="text-text-secondary text-sm">
                    {recipes.length} recette{recipes.length > 1 ? 's' : ''}
                    {subCollections.length > 0 && ` • ${subCollections.length} sous-collection${subCollections.length > 1 ? 's' : ''}`}
                </p>
            </div>

            <QuickActions
                parentCollectionUuid={collection.uuid}
                onCollectionCreated={onCollectionCreated}
                isMobile={true}
            />

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
                    <h2 className="text-lg font-bold text-text-primary mb-3 flex items-center gap-2">
                        <DocumentTextIcon className="w-5 h-5 text-cout-base" />
                        Recettes
                    </h2>
                    <SortableContext items={recipeIds} strategy={rectSortingStrategy}>
                        <div className="space-y-3">
                            {recipes.map((recipe) => (
                                <DraggableRecipeCard
                                    key={String(recipe.uuid)}
                                    recipe={recipe}
                                    isMobile={true}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </div>
            )}

            {subCollections.length === 0 && recipes.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                    <FolderIcon className="w-16 h-16 text-text-secondary opacity-50 mb-4" />
                    <h3 className="text-xl font-bold text-text-primary mb-2">Collection vide</h3>
                    <p className="text-text-secondary text-center">
                        Cette collection ne contient pas encore de recettes.
                    </p>
                </div>
            )}
        </div>
    );
}

function CollectionDetailDesktop({ collection, onCollectionCreated, onNameChange, isDragging }: CollectionDetailLayoutProps) {
    const subCollections = collection.subCollections || [];
    const recipes = collection.recipes || [];

    const collectionIds = subCollections.map(c => `collection-${c.uuid}`);
    const recipeIds = recipes.map(r => `recipe-${r.uuid}`);

    const hasParent = !!collection.parentCollectionUuid;

    return (
        <div className="min-h-screen bg-bg-color p-6">
            <Header
                back={true}
                home={true}
                title={true}
                profile={true}
                pageName={
                    <EditableCollectionTitle
                        collectionUuid={collection.uuid!}
                        name={collection.name}
                        onNameChange={onNameChange}
                    />
                }
            />

            <div className="mt-6">
                <div className="mb-8">
                    <p className="text-text-secondary ml-14">
                        {recipes.length} recette{recipes.length > 1 ? 's' : ''}
                        {subCollections.length > 0 && ` • ${subCollections.length} sous-collection${subCollections.length > 1 ? 's' : ''}`}
                    </p>
                </div>

                <QuickActions
                    parentCollectionUuid={collection.uuid}
                    onCollectionCreated={onCollectionCreated}
                />

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
                        </div>
                        <SortableContext items={recipeIds} strategy={rectSortingStrategy}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                                {recipes.map((recipe) => (
                                    <DraggableRecipeCard
                                        key={String(recipe.uuid)}
                                        recipe={recipe}
                                        isMobile={false}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </div>
                )}

                {subCollections.length === 0 && recipes.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16">
                        <FolderIcon className="w-24 h-24 text-text-secondary opacity-50 mb-4" />
                        <h3 className="text-2xl font-bold text-text-primary mb-2">Collection vide</h3>
                        <p className="text-text-secondary text-center mb-6">
                            Cette collection ne contient pas encore de recettes.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
