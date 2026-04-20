import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Modal from "./Modal";
import CollectionService from "../../api/services/CollectionService";
import RecipeCollectionInterface from "../../api/interfaces/collections/RecipeCollectionInterface";
import { FolderIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { queryKeys } from "../../api/queryConfig";

export interface SavedCollectionInfo {
    uuid: string;
    name: string;
}

interface SaveToCollectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipeUuid: string;
    onSaved?: (collection: SavedCollectionInfo) => void;
}

interface BreadcrumbItem {
    uuid: string;
    name: string;
}

export default function SaveToCollectionModal({
    isOpen,
    onClose,
    recipeUuid,
    onSaved,
}: SaveToCollectionModalProps) {
    const queryClient = useQueryClient();
    const [currentCollection, setCurrentCollection] = useState<RecipeCollectionInterface | null>(null);
    const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadCollection = useCallback(async (uuid: string) => {
        setLoading(true);
        setError(null);
        try {
            const collection = await CollectionService.getCollectionById(uuid);
            setCurrentCollection(collection);
        } catch {
            setError("Impossible de charger les collections");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        const init = async () => {
            setLoading(true);
            setError(null);
            setBreadcrumb([]);
            setCurrentCollection(null);
            try {
                const defaultCol = await CollectionService.getDefaultCollection();
                const collection = await CollectionService.getCollectionById(defaultCol.uuid);
                setCurrentCollection(collection);
                setBreadcrumb([{ uuid: defaultCol.uuid, name: collection?.name || "Mes recettes" }]);
            } catch {
                setError("Impossible de charger les collections");
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [isOpen]);

    const navigateToSubCollection = async (subCollection: RecipeCollectionInterface) => {
        if (!subCollection.uuid) return;
        setBreadcrumb(prev => [...prev, { uuid: subCollection.uuid!, name: subCollection.name }]);
        await loadCollection(subCollection.uuid);
    };

    const navigateToBreadcrumb = async (index: number) => {
        const target = breadcrumb[index];
        setBreadcrumb(prev => prev.slice(0, index + 1));
        await loadCollection(target.uuid);
    };

    const handleSave = async () => {
        if (!currentCollection?.uuid) return;

        setSaving(true);
        setError(null);
        try {
            await CollectionService.addRecipeToCollection(currentCollection.uuid, recipeUuid);
            queryClient.invalidateQueries({ queryKey: queryKeys.collections.byId(currentCollection.uuid) });
            onSaved?.({ uuid: currentCollection.uuid, name: currentCollection.name });
            onClose();
        } catch {
            setError("Impossible d'enregistrer la recette dans cette collection");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Enregistrer dans..."
            size="md"
        >
            <div className="space-y-4">
                {/* Breadcrumb */}
                {breadcrumb.length > 1 && (
                    <div className="flex items-center gap-1 flex-wrap text-sm">
                        {breadcrumb.map((item, index) => (
                            <span key={item.uuid} className="flex items-center gap-1">
                                {index > 0 && <ChevronRightIcon className="w-3 h-3 text-text-secondary" />}
                                <button
                                    onClick={() => navigateToBreadcrumb(index)}
                                    className={`hover:underline transition-colors ${
                                        index === breadcrumb.length - 1
                                            ? "text-text-primary font-semibold"
                                            : "text-text-secondary hover:text-text-primary"
                                    }`}
                                    disabled={index === breadcrumb.length - 1}
                                >
                                    {item.name}
                                </button>
                            </span>
                        ))}
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin w-8 h-8 border-4 border-cout-base border-t-transparent rounded-full"></div>
                    </div>
                )}

                {/* Sub-collections list */}
                {!loading && currentCollection && (
                    <div className="space-y-2">
                        {currentCollection.subCollections && currentCollection.subCollections.length > 0 ? (
                            currentCollection.subCollections.map((sub) => (
                                <button
                                    key={sub.uuid}
                                    onClick={() => navigateToSubCollection(sub)}
                                    className="w-full flex items-center gap-3 p-3 bg-secondary rounded-lg border border-border-color hover:bg-secondary/80 hover:border-cout-base/30 transition-all duration-200"
                                >
                                    <FolderIcon className="w-5 h-5 text-cout-base flex-shrink-0" />
                                    <span className="text-text-primary font-medium text-left flex-1">{sub.name}</span>
                                    <ChevronRightIcon className="w-4 h-4 text-text-secondary flex-shrink-0" />
                                </button>
                            ))
                        ) : (
                            <p className="text-text-secondary text-sm text-center py-4">
                                Aucune sous-collection
                            </p>
                        )}
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <p className="text-sm text-red-500">{error}</p>
                    </div>
                )}

                {/* Save button */}
                {!loading && currentCollection && (
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full px-6 py-3 bg-gradient-to-r from-cout-base to-cout-purple text-white font-semibold rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving
                            ? "Enregistrement..."
                            : `Enregistrer dans "${currentCollection.name}"`}
                    </button>
                )}
            </div>
        </Modal>
    );
}
