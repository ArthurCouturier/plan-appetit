import { useDroppable, DraggableAttributes } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useNavigate } from "react-router-dom";
import RecipeCollectionInterface from "../../api/interfaces/collections/RecipeCollectionInterface";
import { FolderIcon, DocumentTextIcon, ChevronRightIcon, LockClosedIcon, GlobeAltIcon, ArrowDownTrayIcon } from "@heroicons/react/24/solid";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import DropPlaceholder from "./DropPlaceholder";

type DroppableCollectionCardProps = {
    collection: RecipeCollectionInterface;
    isMobile?: boolean;
    isDraggingItem: boolean;
};

export default function DroppableCollectionCard({ collection, isMobile, isDraggingItem }: DroppableCollectionCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef: setSortableRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: `collection-${collection.uuid}`,
        data: {
            type: 'collection',
            collection,
        },
    });

    const { setNodeRef: setDroppableRef, isOver } = useDroppable({
        id: `droppable-collection-${collection.uuid}`,
        data: {
            type: 'collection-drop-target',
            collection,
        },
    });

    const setRefs = (node: HTMLElement | null) => {
        setSortableRef(node);
        setDroppableRef(node);
    };

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const showDropState = isOver && isDraggingItem && !isDragging;

    if (isDragging) {
        return (
            <div ref={setRefs} style={style}>
                <DropPlaceholder isMobile={isMobile} />
            </div>
        );
    }

    return isMobile ? (
        <DroppableCollectionCardMobile
            collection={collection}
            style={style}
            attributes={attributes}
            listeners={listeners}
            setNodeRef={setRefs}
            showDropState={showDropState}
        />
    ) : (
        <DroppableCollectionCardDesktop
            collection={collection}
            style={style}
            attributes={attributes}
            listeners={listeners}
            setNodeRef={setRefs}
            showDropState={showDropState}
        />
    );
}

type DroppableCardInnerProps = {
    collection: RecipeCollectionInterface;
    style: React.CSSProperties;
    attributes: DraggableAttributes;
    listeners: SyntheticListenerMap | undefined;
    setNodeRef: (node: HTMLElement | null) => void;
    showDropState: boolean;
};

function DroppableCollectionCardMobile({
    collection,
    style,
    attributes,
    listeners,
    setNodeRef,
    showDropState,
}: DroppableCardInnerProps) {
    const navigate = useNavigate();
    const recipeCount = collection.recipes?.length ?? 0;
    const subCollectionCount = collection.subCollections?.length ?? 0;

    const handleClick = () => {
        navigate(`/collections/${collection.uuid}`);
    };

    if (showDropState) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="w-full bg-cout-base/20 rounded-xl border-2 border-cout-base p-4 transition-all duration-200 scale-105"
            >
                <div className="flex items-center justify-center gap-2">
                    <ArrowDownTrayIcon className="w-5 h-5 text-cout-base" />
                    <span className="text-cout-base font-bold text-sm">
                        Déplacer dans {collection.name}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={handleClick}
            className="w-full bg-primary rounded-xl shadow-md border border-border-color p-4 hover:shadow-lg hover:border-cout-base transition-all duration-200 active:scale-[0.98] cursor-grab active:cursor-grabbing touch-none"
        >
            <div className="flex items-center justify-between">
                <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-2">
                        <FolderIcon className="w-5 h-5 text-cout-base" />
                        <h3 className="text-lg font-bold text-text-primary line-clamp-1">
                            {collection.name}
                        </h3>
                        {collection.isPublic ? (
                            <GlobeAltIcon className="w-4 h-4 text-green-500" />
                        ) : (
                            <LockClosedIcon className="w-4 h-4 text-text-secondary" />
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
                        <div className="flex items-center gap-1">
                            <DocumentTextIcon className="w-4 h-4 text-cout-base" />
                            <span>{recipeCount} recette{recipeCount > 1 ? 's' : ''}</span>
                        </div>

                        {subCollectionCount > 0 && (
                            <div className="flex items-center gap-1">
                                <FolderIcon className="w-4 h-4 text-cout-yellow" />
                                <span>{subCollectionCount} sous-collection{subCollectionCount > 1 ? 's' : ''}</span>
                            </div>
                        )}
                    </div>
                </div>

                <ChevronRightIcon className="w-6 h-6 text-cout-base flex-shrink-0 ml-2" />
            </div>
        </div>
    );
}

function DroppableCollectionCardDesktop({
    collection,
    style,
    attributes,
    listeners,
    setNodeRef,
    showDropState,
}: DroppableCardInnerProps) {
    const navigate = useNavigate();
    const recipeCount = collection.recipes?.length ?? 0;
    const subCollectionCount = collection.subCollections?.length ?? 0;

    const handleClick = () => {
        navigate(`/collections/${collection.uuid}`);
    };

    if (showDropState) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="bg-cout-base/20 rounded-xl border-2 border-cout-base p-6 transition-all duration-200 scale-105 h-full flex flex-col items-center justify-center min-h-[200px]"
            >
                <ArrowDownTrayIcon className="w-10 h-10 text-cout-base mb-3" />
                <span className="text-cout-base font-bold text-center">
                    Déplacer dans {collection.name}
                </span>
            </div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={handleClick}
            className="group bg-gradient-to-br from-primary to-secondary rounded-xl shadow-lg border-2 border-border-color hover:border-cout-base p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 text-left h-full flex flex-col cursor-grab active:cursor-grabbing touch-none"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2 flex-1">
                    <FolderIcon className="w-6 h-6 text-cout-base flex-shrink-0" />
                    <h3 className="text-xl font-bold text-text-primary group-hover:text-cout-base transition-colors line-clamp-2">
                        {collection.name}
                    </h3>
                </div>
                <div className="ml-2 flex-shrink-0">
                    {collection.isPublic ? (
                        <div className="px-2 py-1 bg-green-500/20 rounded-lg">
                            <GlobeAltIcon className="w-4 h-4 text-green-500" />
                        </div>
                    ) : (
                        <div className="px-2 py-1 bg-cout-purple/20 rounded-lg">
                            <LockClosedIcon className="w-4 h-4 text-text-secondary" />
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2 text-text-secondary">
                    <DocumentTextIcon className="w-5 h-5 text-cout-base" />
                    <span className="text-sm font-medium">{recipeCount} recette{recipeCount > 1 ? 's' : ''}</span>
                </div>

                {subCollectionCount > 0 && (
                    <div className="flex items-center gap-2 text-text-secondary">
                        <FolderIcon className="w-5 h-5 text-cout-yellow" />
                        <span className="text-sm font-medium">{subCollectionCount} sous-collection{subCollectionCount > 1 ? 's' : ''}</span>
                    </div>
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-border-color">
                <div className="flex items-center justify-center gap-2 px-3 py-2 bg-cout-yellow/20 rounded-lg">
                    <span className="text-sm font-bold text-cout-base">
                        Voir la collection
                    </span>
                </div>
            </div>
        </div>
    );
}
