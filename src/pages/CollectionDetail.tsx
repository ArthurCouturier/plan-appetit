import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FolderIcon, DocumentTextIcon, ArrowLeftIcon } from "@heroicons/react/24/solid";
import RecipeCollectionInterface from "../api/interfaces/collections/RecipeCollectionInterface";
import CollectionService from "../api/services/CollectionService";
import CollectionCard from "../components/cards/CollectionCard";
import RecipeCard from "../components/cards/RecipeCard";
import QuickActions from "../components/actions/QuickActions";
import Header from "../components/global/Header";
import useAuth from "../api/hooks/useAuth";

export default function CollectionDetail() {
    const { uuid } = useParams<{ uuid: string }>();
    const { user } = useAuth();

    const [collection, setCollection] = useState<RecipeCollectionInterface | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);

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

    if (loading) {
        return <CollectionDetailSkeleton isMobile={isMobile} />;
    }

    if (error || !collection) {
        return <CollectionNotFound error={error} isMobile={isMobile} />;
    }

    return isMobile ? (
        <CollectionDetailMobile collection={collection} onCollectionCreated={refreshCollection} />
    ) : (
        <CollectionDetailDesktop collection={collection} onCollectionCreated={refreshCollection} />
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

function CollectionDetailMobile({ collection, onCollectionCreated }: { collection: RecipeCollectionInterface; onCollectionCreated: () => void }) {
    const navigate = useNavigate();
    const subCollections = collection.subCollections || [];
    const recipes = collection.recipes || [];

    return (
        <div className="min-h-screen bg-bg-color px-4 pt-20 pb-24">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-cout-base mb-4"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                    <span className="font-medium">Retour</span>
                </button>

                <div className="flex items-center gap-3 mb-2">
                    <FolderIcon className="w-8 h-8 text-cout-base" />
                    <h1 className="text-2xl font-bold text-text-primary">{collection.name}</h1>
                </div>
                <p className="text-text-secondary text-sm">
                    {recipes.length} recette{recipes.length > 1 ? 's' : ''}
                    {subCollections.length > 0 && ` • ${subCollections.length} sous-collection${subCollections.length > 1 ? 's' : ''}`}
                </p>
            </div>

            {/* Quick Actions */}
            <QuickActions
                parentCollectionUuid={collection.uuid}
                onCollectionCreated={onCollectionCreated}
                isMobile={true}
            />

            {/* Sub-collections */}
            {subCollections.length > 0 && (
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-text-primary mb-3 flex items-center gap-2">
                        <FolderIcon className="w-5 h-5 text-cout-yellow" />
                        Sous-collections
                    </h2>
                    <div className="space-y-3">
                        {subCollections.map((subCollection) => (
                            <CollectionCard
                                key={subCollection.uuid}
                                collection={subCollection}
                                isMobile={true}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Recipes */}
            {recipes.length > 0 && (
                <div>
                    <h2 className="text-lg font-bold text-text-primary mb-3 flex items-center gap-2">
                        <DocumentTextIcon className="w-5 h-5 text-cout-base" />
                        Recettes
                    </h2>
                    <div className="space-y-3">
                        {recipes.map((recipe) => (
                            <RecipeCard key={String(recipe.uuid)} recipe={recipe} isMobile={true} />
                        ))}
                    </div>
                </div>
            )}

            {/* Empty state */}
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

function CollectionDetailDesktop({ collection, onCollectionCreated }: { collection: RecipeCollectionInterface; onCollectionCreated: () => void }) {
    const subCollections = collection.subCollections || [];
    const recipes = collection.recipes || [];

    return (
        <div className="min-h-screen bg-bg-color p-6">
            <Header
                back={true}
                home={true}
                title={true}
                profile={true}
                pageName={
                    <div className="flex items-center gap-4 mb-2">
                        <FolderIcon className="w-10 h-10 text-cout-base" />
                        <h1 className="text-3xl font-bold text-text-primary">{collection.name}</h1>
                    </div>
                }
            />

            <div className="mt-6">
                {/* Header section */}
                <div className="mb-8">
                    <p className="text-text-secondary ml-14">
                        {recipes.length} recette{recipes.length > 1 ? 's' : ''}
                        {subCollections.length > 0 && ` • ${subCollections.length} sous-collection${subCollections.length > 1 ? 's' : ''}`}
                    </p>
                </div>

                {/* Quick Actions */}
                <QuickActions
                    parentCollectionUuid={collection.uuid}
                    onCollectionCreated={onCollectionCreated}
                />

                {/* Sub-collections */}
                {subCollections.length > 0 && (
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <FolderIcon className="w-6 h-6 text-cout-yellow" />
                            <h2 className="text-xl font-bold text-text-primary">Sous-collections</h2>
                            <span className="text-text-secondary text-sm">({subCollections.length})</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                            {subCollections.map((subCollection) => (
                                <CollectionCard
                                    key={subCollection.uuid}
                                    collection={subCollection}
                                    isMobile={false}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Recipes */}
                {recipes.length > 0 && (
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <DocumentTextIcon className="w-6 h-6 text-cout-base" />
                            <h2 className="text-xl font-bold text-text-primary">Recettes</h2>
                            <span className="text-text-secondary text-sm">({recipes.length})</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                            {recipes.map((recipe) => (
                                <RecipeCard key={String(recipe.uuid)} recipe={recipe} isMobile={false} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {subCollections.length === 0 && recipes.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16">
                        <FolderIcon className="w-24 h-24 text-text-secondary opacity-50 mb-4" />
                        <h3 className="text-2xl font-bold text-text-primary mb-2">Collection vide</h3>
                        <p className="text-text-secondary text-center mb-6">
                            Cette collection ne contient pas encore de recettes ou sous-collections.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
