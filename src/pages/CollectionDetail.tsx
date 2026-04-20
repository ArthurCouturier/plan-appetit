import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FolderIcon, ArrowLeftIcon } from "@heroicons/react/24/solid";
import { mediumHaptic } from "../haptics/medium";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import QuickActionButton from "../components/buttons/QuickActionButton";
import CreateCollectionModal from "../components/modals/CreateCollectionModal";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import RecipeCollectionInterface from "../api/interfaces/collections/RecipeCollectionInterface";
import { useCollection } from "../api/hooks/useCollectionQueries";
import DroppableCollectionCard from "../components/dnd/DroppableCollectionCard";
import ParentDropZone from "../components/dnd/ParentDropZone";
import CollectionCard from "../components/cards/CollectionCard";
import BatchCookingCard from "../components/cards/BatchCookingCard";
import QuickActions from "../components/actions/QuickActions";
import EmptyCollectionCTA from "../components/collections/EmptyCollectionCTA";
import EditableCollectionTitle from "../components/collections/EditableCollectionTitle";
import RecipeSection from "../components/collections/RecipeSection";
import useIsMobile from "../hooks/useIsMobile";
import useCollectionDnD from "../hooks/useCollectionDnD";
import { useQuery } from "@tanstack/react-query";
import useAuth from "../api/hooks/useAuth";
import BatchCookingService from "../api/services/BatchCookingService";


interface CollectionDetailProps {
    persistentUuid?: string;
}

export default function CollectionDetail({ persistentUuid }: CollectionDetailProps = {}) {
    const { uuid: paramUuid } = useParams<{ uuid: string }>();
    const uuid = persistentUuid ?? paramUuid;
    const { data: collection, isLoading, isError, refetch } = useCollection(uuid);
    const isMobile = useIsMobile();

    const dnd = useCollectionDnD({ collection, uuid, isMobile, refetch });

    const handleRefresh = useCallback(async () => {
        await refetch();
    }, [refetch]);

    const handleNameChange = (newName: string) => {
        dnd.setCollectionCache(prev => ({ ...prev, name: newName }));
    };

    if (isLoading && !collection) {
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
    const { user } = useAuth();
    const [showCreateCollection, setShowCreateCollection] = useState(false);
    const collUuid = String(collection.uuid);

    const email = user?.email ?? localStorage.getItem("email") ?? "";
    const token = user?.token ?? localStorage.getItem("firebaseIdToken") ?? "";

    const { data: batchCookings } = useQuery({
        queryKey: ["batch-cookings-all"],
        queryFn: () => BatchCookingService.getAll(email, token),
        enabled: !!collection.isDefault && !!user,
    });
    const [subCollectionsCollapsed, setSubCollectionsCollapsed] = useState(
        () => localStorage.getItem(`subcollections-collapsed-${collUuid}`) !== '0'
    );
    const [batchCookingsCollapsed, setBatchCookingsCollapsed] = useState(
        () => localStorage.getItem(`batchcookings-collapsed-${collUuid}`) === '1'
    );

    useEffect(() => {
        setSubCollectionsCollapsed(localStorage.getItem(`subcollections-collapsed-${collUuid}`) !== '0');
        setBatchCookingsCollapsed(localStorage.getItem(`batchcookings-collapsed-${collUuid}`) === '1');
    }, [collUuid]);

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
                        <button
                            onClick={() => {
                                const key = `subcollections-collapsed-${collUuid}`;
                                const next = !subCollectionsCollapsed;
                                setSubCollectionsCollapsed(next);
                                localStorage.setItem(key, next ? '1' : '0');
                                mediumHaptic();
                            }}
                            className="flex items-center gap-2 mb-3 md:mb-4 group"
                        >
                            <FolderIcon className="w-5 h-5 md:w-6 md:h-6 text-cout-yellow" />
                            <h2 className="text-lg md:text-xl font-bold text-text-primary">Sous-collections</h2>
                            <span className="text-text-secondary text-sm">({subCollections.length})</span>
                            <svg
                                className={`w-4 h-4 text-text-secondary transition-transform duration-200 ${subCollectionsCollapsed ? '-rotate-90' : ''}`}
                                viewBox="0 0 20 20" fill="currentColor"
                            >
                                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <div
                            className="grid transition-[grid-template-rows] duration-200 ease-in-out"
                            style={{ gridTemplateRows: subCollectionsCollapsed ? '0fr' : '1fr' }}
                        >
                            <div className="overflow-hidden">
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
                        </div>
                    </div>
                )}

                {/* Batch Cookings (default collection only) */}
                {collection.isDefault && batchCookings && batchCookings.length > 0 && (
                    <div className="mb-6 md:mb-8">
                        <button
                            onClick={() => {
                                const key = `batchcookings-collapsed-${collUuid}`;
                                const next = !batchCookingsCollapsed;
                                setBatchCookingsCollapsed(next);
                                localStorage.setItem(key, next ? '1' : '0');
                                mediumHaptic();
                            }}
                            className="flex items-center gap-2 mb-3 md:mb-4 group"
                        >
                            <span className="text-lg">🍲</span>
                            <h2 className="text-lg md:text-xl font-bold text-text-primary">Batch Cookings</h2>
                            <span className="text-text-secondary text-sm">({batchCookings.length})</span>
                            <svg
                                className={`w-4 h-4 text-text-secondary transition-transform duration-200 ${batchCookingsCollapsed ? '-rotate-90' : ''}`}
                                viewBox="0 0 20 20" fill="currentColor"
                            >
                                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <div
                            className="grid transition-[grid-template-rows] duration-200 ease-in-out"
                            style={{ gridTemplateRows: batchCookingsCollapsed ? '0fr' : '1fr' }}
                        >
                            <div className="overflow-hidden">
                                <div className="grid grid-cols-2 gap-3 md:grid-cols-[repeat(auto-fill,minmax(170px,1fr))] md:gap-4">
                                    {batchCookings.map((batch) => (
                                        <BatchCookingCard key={batch.uuid} batch={batch} />
                                    ))}
                                </div>
                            </div>
                        </div>
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
