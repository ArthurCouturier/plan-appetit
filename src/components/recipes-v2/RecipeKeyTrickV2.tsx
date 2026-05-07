import { LightBulbIcon, LifebuoyIcon } from "@heroicons/react/24/outline";
import { isMeaningfulText } from "./isMeaningfulText";

interface RecipeKeyTrickV2Props {
    keyTrickFr: string | null;
    rescuePlanFr: string | null;
}

export default function RecipeKeyTrickV2({
    keyTrickFr,
    rescuePlanFr,
}: RecipeKeyTrickV2Props) {
    const hasKeyTrick = isMeaningfulText(keyTrickFr);
    const hasRescuePlan = isMeaningfulText(rescuePlanFr);
    if (!hasKeyTrick && !hasRescuePlan) return null;

    return (
        <div className="space-y-3">
            {hasKeyTrick && (
                <div className="flex gap-3 p-4 rounded-xl bg-cout-base/5 border border-cout-base/20">
                    <div className="flex-shrink-0 text-cout-base">
                        <LightBulbIcon className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                        <h3 className="font-semibold text-text-primary mb-1">
                            Astuce clé
                        </h3>
                        <p className="text-sm text-text-primary leading-relaxed">
                            {keyTrickFr}
                        </p>
                    </div>
                </div>
            )}
            {hasRescuePlan && (
                <div className="flex gap-3 p-4 rounded-xl bg-orange-500/5 border border-orange-500/20">
                    <div className="flex-shrink-0 text-orange-500">
                        <LifebuoyIcon className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                        <h3 className="font-semibold text-text-primary mb-1">
                            Plan de secours
                        </h3>
                        <p className="text-sm text-text-primary leading-relaxed">
                            {rescuePlanFr}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
