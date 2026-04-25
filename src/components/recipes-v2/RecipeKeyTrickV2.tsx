import { LightBulbIcon, LifebuoyIcon } from "@heroicons/react/24/outline";

interface RecipeKeyTrickV2Props {
    keyTrickFr: string | null;
    rescuePlanFr: string | null;
}

export default function RecipeKeyTrickV2({
    keyTrickFr,
    rescuePlanFr,
}: RecipeKeyTrickV2Props) {
    if (!keyTrickFr && !rescuePlanFr) return null;

    return (
        <div className="space-y-3">
            {keyTrickFr && (
                <div className="flex gap-3 p-4 rounded-xl bg-cout-base/5 border border-cout-base/20">
                    <div className="flex-shrink-0 text-cout-base">
                        <LightBulbIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-text-primary mb-1">
                            Astuce clé
                        </h3>
                        <p className="text-sm text-text-primary leading-relaxed">
                            {keyTrickFr}
                        </p>
                    </div>
                </div>
            )}
            {rescuePlanFr && (
                <div className="flex gap-3 p-4 rounded-xl bg-orange-500/5 border border-orange-500/20">
                    <div className="flex-shrink-0 text-orange-500">
                        <LifebuoyIcon className="w-6 h-6" />
                    </div>
                    <div>
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
