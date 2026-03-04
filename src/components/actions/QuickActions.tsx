import { useState } from "react";
import { GenerateAIRecipeButton, CreateCollectionButton, DailyRecipeButton } from "../buttons/NewRecipeButton";
import RecipeGenerationChoiceModal from "../popups/RecipeGenerationChoiceModal";
import CreateCollectionModal from "../popups/CreateCollectionModal";
import DailyRecipeModal from "../popups/DailyRecipeModal";

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
    const [showDailyRecipe, setShowDailyRecipe] = useState(false);

    if (isMobile) {
        return (
            <QuickActionsMobile
                showGenerationChoice={showGenerationChoice}
                setShowGenerationChoice={setShowGenerationChoice}
                showCreateCollection={showCreateCollection}
                setShowCreateCollection={setShowCreateCollection}
                showDailyRecipe={showDailyRecipe}
                setShowDailyRecipe={setShowDailyRecipe}
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
            showDailyRecipe={showDailyRecipe}
            setShowDailyRecipe={setShowDailyRecipe}
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
    showDailyRecipe: boolean;
    setShowDailyRecipe: (show: boolean) => void;
    parentCollectionUuid?: string;
    onCollectionCreated?: () => void;
}

function QuickActionsDesktop({
    showGenerationChoice,
    setShowGenerationChoice,
    showCreateCollection,
    setShowCreateCollection,
    showDailyRecipe,
    setShowDailyRecipe,
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
                    <DailyRecipeButton onClick={() => setShowDailyRecipe(true)} />
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

            <DailyRecipeModal
                isOpen={showDailyRecipe}
                onClose={() => setShowDailyRecipe(false)}
            />
        </>
    );
}

function QuickActionsMobile({
    showGenerationChoice,
    setShowGenerationChoice,
    showCreateCollection,
    setShowCreateCollection,
    showDailyRecipe,
    setShowDailyRecipe,
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
                    <DailyRecipeButton onClick={() => setShowDailyRecipe(true)} />
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

            <DailyRecipeModal
                isOpen={showDailyRecipe}
                onClose={() => setShowDailyRecipe(false)}
            />
        </>
    );
}
