import { useNavigate } from "react-router-dom";
import RecipeCollectionInterface from "../../api/interfaces/collections/RecipeCollectionInterface";
import { FolderIcon, DocumentTextIcon, ChevronRightIcon, LockClosedIcon, GlobeAltIcon } from "@heroicons/react/24/solid";

export default function CollectionCard({
    collection,
    isMobile
}: {
    collection: RecipeCollectionInterface;
    isMobile?: boolean;
}) {
    return (
        isMobile ? <CollectionCardMobile collection={collection} /> : <CollectionCardDesktop collection={collection} />
    );
}

function CollectionCardMobile({
    collection
}: {
    collection: RecipeCollectionInterface
}) {
    const navigate = useNavigate();
    const recipeCount = collection.recipes?.length ?? 0;
    const subCollectionCount = collection.subCollections?.length ?? 0;

    return (
        <button
            onClick={() => navigate(`/collections/${collection.uuid}`)}
            className="w-full bg-primary rounded-xl shadow-md border border-border-color p-4 hover:shadow-lg hover:border-cout-base transition-all duration-200 active:scale-[0.98]"
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
        </button>
    );
}

function CollectionCardDesktop({
    collection
}: {
    collection: RecipeCollectionInterface
}) {
    const navigate = useNavigate();
    const recipeCount = collection.recipes?.length ?? 0;
    const subCollectionCount = collection.subCollections?.length ?? 0;

    return (
        <button
            onClick={() => navigate(`/collections/${collection.uuid}`)}
            className="group bg-gradient-to-br from-primary to-secondary rounded-xl shadow-lg border-2 border-border-color hover:border-cout-base p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 text-left h-full flex flex-col"
        >
            {/* Header */}
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

            {/* Info section */}
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

            {/* Footer badge */}
            <div className="mt-4 pt-4 border-t border-border-color">
                <div className="flex items-center justify-center gap-2 px-3 py-2 bg-cout-yellow/20 rounded-lg">
                    <span className="text-sm font-bold text-cout-base">
                        Voir la collection
                    </span>
                </div>
            </div>
        </button>
    );
}
