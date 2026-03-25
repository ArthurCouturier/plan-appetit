import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FolderIcon, ArrowLeftIcon } from "@heroicons/react/24/solid";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import QuickActionButton from "../components/buttons/QuickActionButton";
import CreateCollectionModal from "../components/popups/CreateCollectionModal";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import RecipeCollectionInterface from "../api/interfaces/collections/RecipeCollectionInterface";
import { useCollection } from "../api/hooks/useCollectionQueries";
import DroppableCollectionCard from "../components/dnd/DroppableCollectionCard";
import ParentDropZone from "../components/dnd/ParentDropZone";
import CollectionCard from "../components/cards/CollectionCard";
import QuickActions from "../components/actions/QuickActions";
import EmptyCollectionCTA from "../components/collections/EmptyCollectionCTA";
import EditableCollectionTitle from "../components/collections/EditableCollectionTitle";
import RecipeSection from "../components/collections/RecipeSection";
import useIsMobile from "../hooks/useIsMobile";
import useCollectionDnD from "../hooks/useCollectionDnD";

export default function CollectionDetail() {
    const { uuid } = useParams<{ uuid: string }>();
    const { data: collection, isLoading, isError, refetch } = useCollection(uuid);
    const isMobile = useIsMobile();

    const [isRefreshing, setIsRefreshing] = useState(false);

    const dnd = useCollectionDnD({ collection, uuid, isMobile, refetch });

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try { await refetch(); } finally { setIsRefreshing(false); }
    }, [refetch]);

    const handleNameChange = (newName: string) => {
        dnd.setCollectionCache(prev => ({ ...prev, name: newName }));
    };

    if (isLoading || isRefreshing) {
        return <CollectionDetailSkeleton isMobile={isMobile} />;
    }

    if (isError || !collection) {
        return <CollectionNotFound error={isError ? "Erreur lors du chargement de la collection" : null} isMobile={isMobile} />;
    }

    const isDragging = dnd.activeItem !== null;

    return (
        <DndContext
            sensors={dnd.sensors}
            collisionDetection={dnd.collisionDetection}
            onDragStart={dnd.onDragStart}
            onDragEnd={dnd.onDragEnd}
            onDragCancel={dnd.onDragCancel}
            measuring={dnd.measuring}
        >
            <CollectionDetailContent
                collection={collection}
                isMobile={isMobile}
                isDragging={isDragging}
                onRefresh={handleRefresh}
                onNameChange={handleNameChange}
                sortOption={dnd.sortOption}
                onSortChange={dnd.setSortOption}
                isReordering={dnd.isReordering}
                onStartReorder={dnd.onStartReorder}
                onValidateReorder={dnd.onValidateReorder}
                onCancelReorder={dnd.onCancelReorder}
                onCollectionCreated={handleRefresh}
            />
            <DragOverlay>
                {dnd.activeItem?.type === 'recipe' && dnd.activeItem.recipe && (
                    <div className="flex items-center gap-3 bg-primary border border-cout-base rounded-xl px-4 py-3 shadow-lg select-none cursor-grabbing">
                        <span className="text-sm font-medium text-text-primary truncate">{dnd.activeItem.recipe.name}</span>
                    </div>
                )}
                {dnd.activeItem?.type === 'collection' && dnd.activeItem.collection && (
                    <CollectionCard collection={dnd.activeItem.collection} isMobile={isMobile} />
                )}
            </DragOverlay>
        </DndContext>
    );
}

// --- Responsive unified layout ---

type CollectionDetailContentProps = {
    collection: RecipeCollectionInterface;
    isMobile: boolean;
    isDragging: boolean;
    onRefresh: () => void;
    onNameChange: (name: string) => void;
    sortOption: import("../components/collections/RecipeSortSelect").RecipeSortOption;
    onSortChange: (sort: import("../components/collections/RecipeSortSelect").RecipeSortOption) => void;
    isReordering: boolean;
    onStartReorder: () => void;
    onValidateReorder: () => void;
    onCancelReorder: () => void;
    onCollectionCreated: () => void;
};

function CollectionDetailContent({
    collection, isMobile, isDragging, onRefresh, onNameChange,
    sortOption, onSortChange, isReordering, onStartReorder, onValidateReorder, onCancelReorder, onCollectionCreated,
}: CollectionDetailContentProps) {
    const [showCreateCollection, setShowCreateCollection] = useState(false);

    const subCollections = collection.subCollections || [];
    const recipes = collection.recipes || [];
    const collectionIds = subCollections.map(c => `collection-${c.uuid}`);
    const hasParent = !!collection.parentCollectionUuid;
    const isEmpty = subCollections.length === 0 && recipes.length === 0;
    const showEmptyCTA = isEmpty && collection.isDefault;

    if (showEmptyCTA) {
        return (
            <div className={`min-h-screen bg-bg-color flex flex-col ${isMobile ? 'px-4 pb-8 mobile-content-with-header' : 'p-6'}`}>
                <div className="flex-1 flex items-center justify-center">
                    <EmptyCollectionCTA />
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen bg-bg-color ${isMobile ? 'px-4 pb-8 mobile-content-with-header' : 'p-6'}`}>
            {/* Mobile Header */}
            {isMobile && (
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
                </div>
            )}

            <div className={isMobile ? '' : 'mt-6'}>
                {/* Stats */}
                <p className={`text-text-secondary text-sm mb-4 ${!isMobile ? 'ml-14 mb-8' : ''}`}>
                    {recipes.length} recette{recipes.length > 1 ? 's' : ''}
                    {subCollections.length > 0 && ` • ${subCollections.length} sous-collection${subCollections.length > 1 ? 's' : ''}`}
                </p>

                <QuickActions isMobile={isMobile} />

                {hasParent && (
                    <ParentDropZone
                        parentCollectionUuid={collection.parentCollectionUuid!}
                        parentCollectionName={collection.parentCollectionName || undefined}
                        isMobile={isMobile}
                        isVisible={isDragging}
                    />
                )}

                {/* Sub-collections */}
                {subCollections.length > 0 && (
                    <div className="mb-6 md:mb-8">
                        <div className="flex items-center gap-2 mb-3 md:mb-4">
                            <FolderIcon className="w-5 h-5 md:w-6 md:h-6 text-cout-yellow" />
                            <h2 className="text-lg md:text-xl font-bold text-text-primary">Sous-collections</h2>
                            <span className="text-text-secondary text-sm">({subCollections.length})</span>
                        </div>
                        <SortableContext items={collectionIds} strategy={rectSortingStrategy}>
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 md:gap-6">
                                {subCollections.map((subCollection) => (
                                    <DroppableCollectionCard
                                        key={subCollection.uuid}
                                        collection={subCollection}
                                        isMobile={isMobile}
                                        isDraggingItem={isDragging}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </div>
                )}

                {/* Recipes */}
                <RecipeSection
                    recipes={recipes}
                    collectionUuid={String(collection.uuid)}
                    sortOption={sortOption}
                    onSortChange={onSortChange}
                    isReordering={isReordering}
                    onStartReorder={onStartReorder}
                    onValidateReorder={onValidateReorder}
                    onCancelReorder={onCancelReorder}
                />
            </div>

            <CreateCollectionModal
                isOpen={showCreateCollection}
                onClose={() => setShowCreateCollection(false)}
                parentCollectionUuid={collection.uuid}
                onCollectionCreated={onCollectionCreated}
            />
        </div>
    );
}

// --- Utility components ---

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
