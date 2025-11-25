import { useDroppable } from "@dnd-kit/core";
import { ArrowUpTrayIcon, FolderIcon } from "@heroicons/react/24/solid";

type ParentDropZoneProps = {
    parentCollectionUuid: string;
    parentCollectionName?: string;
    isMobile?: boolean;
    isVisible: boolean;
};

export default function ParentDropZone({
    parentCollectionUuid,
    parentCollectionName,
    isMobile,
    isVisible,
}: ParentDropZoneProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: `droppable-collection-${parentCollectionUuid}`,
        data: {
            type: 'parent-collection-drop-target',
            parentCollectionUuid,
        },
    });

    if (!isVisible) {
        return null;
    }

    const displayName = parentCollectionName || "collection parente";

    if (isMobile) {
        return (
            <div
                ref={setNodeRef}
                className={`
                    w-full rounded-xl border-2 border-dashed p-4 mb-4 transition-all duration-200
                    ${isOver
                        ? "bg-cout-base/30 border-cout-base scale-[1.02]"
                        : "bg-cout-base/10 border-cout-base/50"
                    }
                `}
            >
                <div className="flex items-center justify-center gap-2">
                    <ArrowUpTrayIcon className={`w-5 h-5 ${isOver ? "text-cout-base" : "text-cout-base/70"}`} />
                    <FolderIcon className={`w-5 h-5 ${isOver ? "text-cout-yellow" : "text-cout-yellow/70"}`} />
                    <span className={`font-bold text-sm ${isOver ? "text-cout-base" : "text-cout-base/70"}`}>
                        Déplacer vers {displayName}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            className={`
                w-full rounded-xl border-2 border-dashed p-6 mb-6 transition-all duration-200
                ${isOver
                    ? "bg-cout-base/30 border-cout-base scale-[1.01]"
                    : "bg-cout-base/10 border-cout-base/50"
                }
            `}
        >
            <div className="flex items-center justify-center gap-3">
                <ArrowUpTrayIcon className={`w-6 h-6 ${isOver ? "text-cout-base" : "text-cout-base/70"}`} />
                <FolderIcon className={`w-6 h-6 ${isOver ? "text-cout-yellow" : "text-cout-yellow/70"}`} />
                <span className={`font-bold ${isOver ? "text-cout-base" : "text-cout-base/70"}`}>
                    Déplacer vers {displayName}
                </span>
            </div>
        </div>
    );
}
