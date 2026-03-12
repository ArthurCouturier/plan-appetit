import { useState } from "react";
import { useNavigate } from "react-router-dom";
import QuickActionButton from "../buttons/QuickActionButton";
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
    const navigate = useNavigate();
    const [showCreateCollection, setShowCreateCollection] = useState(false);
    const [showDailyRecipe, setShowDailyRecipe] = useState(false);

    return (
        <>
            <div className={`bg-primary rounded-[12px] shadow-md border border-border-color w-full ${isMobile ? 'py-[17px] px-[17px] mb-4' : 'py-[17px] px-[17px] mb-6'}`}>
                <h3 className="font-semibold text-text-primary text-center text-[16px] leading-[24px]">
                    Actions rapides
                </h3>
                <div className="flex flex-col items-center gap-[18px] mt-[15px] max-w-[280px] mx-auto">
                    <QuickActionButton
                        icon="/icons/NouvelleRecette.svg"
                        iconSize={14}
                        title="Nouvelle Recette"
                        onClick={() => navigate("/recettes/nouvelle")}
                    />
                    <QuickActionButton
                        icon="/icons/RecetteDuJour.svg"
                        title="Recettes du jour"
                        onClick={() => setShowDailyRecipe(true)}
                    />
                    <QuickActionButton
                        icon="/icons/ImportInstagram.svg"
                        iconSize={16}
                        title="Import Instagram"
                        onClick={() => navigate("/instagram")}
                    />
                    <QuickActionButton
                        icon="/icons/AjouterCollection.svg"
                        title="Ajouter Collection"
                        onClick={() => setShowCreateCollection(true)}
                    />
                </div>
            </div>

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
