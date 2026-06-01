import RecipeGenerationActionButton from "../components/buttons/RecipeGenerationActionButton";
import type { RecipeGenerationType } from "../components/buttons/RecipeGenerationActionButton";

const IMPORT_TYPES: RecipeGenerationType[] = [
    "instagram",
    "photo",
    "website",
    "tiktok",
];

export default function ImportRecipePage() {
    return (
        <div
            className="h-[100dvh] bg-primary px-5 flex flex-col"
            style={{
                paddingTop: "calc(env(safe-area-inset-top, 0px) + 57px)",
                paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)",
            }}
        >
            <div className="flex-1 max-w-md mx-auto w-full flex flex-col gap-3 min-h-0">
                {IMPORT_TYPES.map((type) => (
                    <div key={type} className="flex-1 min-h-0">
                        <RecipeGenerationActionButton type={type} />
                    </div>
                ))}
            </div>
        </div>
    );
}
