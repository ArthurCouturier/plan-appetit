import { useState } from "react";
import { GenerateAIRecipeButton, CreateCollectionButton } from "../buttons/NewRecipeButton";
import RecipeGenerationChoiceModal from "../popups/RecipeGenerationChoiceModal";
import CreateCollectionModal from "../popups/CreateCollectionModal";

interface QuickActionsProps {
    parentCollectionUuid?: string;
    onCollectionCreated?: () => void;
    isMobile?: boolean;
}

export default function QuickActions({
    parentCollectionUuid,
    onCollectionCreated,
    isMobile = false
}: QuickActionsProps) {
    const [showGenerationChoice, setShowGenerationChoice] = useState(false);
    const [showCreateCollection, setShowCreateCollection] = useState(false);

    if (isMobile) {
        return (
            <QuickActionsMobile
                showGenerationChoice={showGenerationChoice}
                setShowGenerationChoice={setShowGenerationChoice}
                showCreateCollection={showCreateCollection}
                setShowCreateCollection={setShowCreateCollection}
                parentCollectionUuid={parentCollectionUuid}
                onCollectionCreated={onCollectionCreated}
            />
        );
    }

    return (
        <QuickActionsDesktop
            showGenerationChoice={showGenerationChoice}
            setShowGenerationChoice={setShowGenerationChoice}
            showCreateCollection={showCreateCollection}
            setShowCreateCollection={setShowCreateCollection}
            parentCollectionUuid={parentCollectionUuid}
            onCollectionCreated={onCollectionCreated}
        />
    );
}

interface QuickActionsInternalProps {
    showGenerationChoice: boolean;
    setShowGenerationChoice: (show: boolean) => void;
    showCreateCollection: boolean;
    setShowCreateCollection: (show: boolean) => void;
    parentCollectionUuid?: string;
    onCollectionCreated?: () => void;
}

function QuickActionsDesktop({
    showGenerationChoice,
    setShowGenerationChoice,
    showCreateCollection,
    setShowCreateCollection,
    parentCollectionUuid,
    onCollectionCreated
}: QuickActionsInternalProps) {
    return (
        <>
            <div className="bg-primary rounded-xl p-6 shadow-md border border-border-color mb-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Actions rapides</h3>
                <div className="flex flex-wrap gap-3">
                    <GenerateAIRecipeButton disabled={false} onClick={() => setShowGenerationChoice(true)} />
                    <CreateCollectionButton disabled={false} onClick={() => setShowCreateCollection(true)} />
                </div>
            </div>

            <RecipeGenerationChoiceModal
                isOpen={showGenerationChoice}
                onClose={() => setShowGenerationChoice(false)}
            />

            <CreateCollectionModal
                isOpen={showCreateCollection}
                onClose={() => setShowCreateCollection(false)}
                parentCollectionUuid={parentCollectionUuid}
                onCollectionCreated={onCollectionCreated}
            />
        </>
    );
}

function QuickActionsMobile({
    showGenerationChoice,
    setShowGenerationChoice,
    showCreateCollection,
    setShowCreateCollection,
    parentCollectionUuid,
    onCollectionCreated
}: QuickActionsInternalProps) {
    return (
        <>
            <div className="bg-primary rounded-xl p-4 shadow-md border border-border-color mb-4">
                <h3 className="text-base font-semibold text-text-primary mb-3">Actions rapides</h3>
                <div className="flex flex-wrap gap-2">
                    <GenerateAIRecipeButton disabled={false} onClick={() => setShowGenerationChoice(true)} />
                    <CreateCollectionButton disabled={false} onClick={() => setShowCreateCollection(true)} />
                </div>
            </div>

            <RecipeGenerationChoiceModal
                isOpen={showGenerationChoice}
                onClose={() => setShowGenerationChoice(false)}
            />

            <CreateCollectionModal
                isOpen={showCreateCollection}
                onClose={() => setShowCreateCollection(false)}
                parentCollectionUuid={parentCollectionUuid}
                onCollectionCreated={onCollectionCreated}
            />
        </>
    );
}
