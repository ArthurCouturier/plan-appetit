import { useNavigate } from "react-router-dom";
import QuickActionButton from "../buttons/QuickActionButton";
import { useCulinaryProfile } from "../../api/hooks/useCulinaryProfile";

interface QuickActionsProps {
    isMobile?: boolean;
}

export default function QuickActions({
    isMobile = false
}: QuickActionsProps) {
    const navigate = useNavigate();
    const { data: culinaryProfile, isLoading: profileLoading } = useCulinaryProfile();

    const handleRitualClick = () => {
        if (profileLoading) return;
        if (culinaryProfile?.onboardingCompletedAt) {
            navigate("/ritual");
        } else {
            navigate("/onboarding/ritual");
        }
    };

    return (
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
                    onClick={handleRitualClick}
                />
                <QuickActionButton
                    icon="/icons/ImportRecipe.svg"
                    iconSize={16}
                    title="Importer une recette"
                    onClick={() => navigate("/recettes/importer")}
                />
            </div>
        </div>
    );
}
