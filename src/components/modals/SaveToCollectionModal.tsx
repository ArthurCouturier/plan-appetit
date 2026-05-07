import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Modal from "./Modal";
import CollectionService from "../../api/services/CollectionService";
import RecipeCollectionV2Service from "../../api/services/RecipeCollectionV2Service";
import { RecipeCollectionV2BasicInfoDTO } from "../../api/interfaces/v2/RecipeCollectionV2";
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
    const [allCollections, setAllCollections] = useState<RecipeCollectionV2BasicInfoDTO[]>([]);
    const [currentUuid, setCurrentUuid] = useState<string | null>(null);
    const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const collectionsByUuid = useMemo(() => {
        const map = new Map<string, RecipeCollectionV2BasicInfoDTO>();
        allCollections.forEach((c) => map.set(c.uuid, c));
        return map;
    }, [allCollections]);

    const childrenByParent = useMemo(() => {
        const map = new Map<string | null, RecipeCollectionV2BasicInfoDTO[]>();
        allCollections.forEach((c) => {
            const parentKey = c.parentCollectionUuid;
            if (!map.has(parentKey)) map.set(parentKey, []);
            map.get(parentKey)!.push(c);
        });
        map.forEach((list) => list.sort((a, b) => a.displayOrder - b.displayOrder));
        return map;
    }, [allCollections]);

    const currentCollection = currentUuid ? collectionsByUuid.get(currentUuid) ?? null : null;
    const subCollections = useMemo(() => {
        if (!currentUuid) return [];
        return childrenByParent.get(currentUuid) ?? [];
    }, [currentUuid, childrenByParent]);

    useEffect(() => {
        if (!isOpen) return;

        const init = async () => {
            setLoading(true);
            setError(null);
            setBreadcrumb([]);
            setCurrentUuid(null);
            try {
                const collections = await RecipeCollectionV2Service.getAllCollections();
                setAllCollections(collections);

                const defaultCol = collections.find((c) => c.isDefault);
                if (!defaultCol) {
                    setError("Aucune collection par défaut trouvée");
                    return;
                }
                setCurrentUuid(defaultCol.uuid);
                setBreadcrumb([{ uuid: defaultCol.uuid, name: defaultCol.name }]);
            } catch {
                setError("Impossible de charger les collections");
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [isOpen]);

    const navigateToSubCollection = useCallback((sub: RecipeCollectionV2BasicInfoDTO) => {
        setBreadcrumb((prev) => [...prev, { uuid: sub.uuid, name: sub.name }]);
        setCurrentUuid(sub.uuid);
    }, []);

    const navigateToBreadcrumb = useCallback((index: number) => {
        const target = breadcrumb[index];
        setBreadcrumb((prev) => prev.slice(0, index + 1));
        setCurrentUuid(target.uuid);
    }, [breadcrumb]);

    const handleSave = async () => {
        if (!currentCollection) return;

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
                        {subCollections.length > 0 ? (
                            subCollections.map((sub) => (
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
