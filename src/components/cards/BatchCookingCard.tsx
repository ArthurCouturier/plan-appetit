import { useNavigate } from "react-router-dom";
import { useRecipeImageVisible } from "../../api/hooks/useRecipeImageBatch";
import type { BatchCookingResponse } from "../../api/interfaces/batchcooking/BatchCookingInterfaces";

interface BatchCookingCardProps {
    batch: BatchCookingResponse;
}

function BatchImageCell({ recipeUuid }: { recipeUuid: string }) {
    const { ref, data: imageData } = useRecipeImageVisible(recipeUuid);
    const isLoading = imageData === undefined;

    return (
        <div ref={ref} className="w-full h-full overflow-hidden">
            {isLoading ? (
                <div className="w-full h-full bg-gradient-to-r from-border-color via-secondary to-border-color animate-shimmer bg-[length:200%_100%]" />
            ) : imageData ? (
                <img
                    src={`data:image/png;base64,${imageData}`}
                    alt=""
                    className="w-full h-full object-cover"
                    draggable={false}
                />
            ) : (
                <div className="w-full h-full bg-border-color" />
            )}
        </div>
    );
}

export default function BatchCookingCard({ batch }: BatchCookingCardProps) {
    const navigate = useNavigate();
    const recipeUuids = batch.recipes.slice(0, 4).map((r) => String(r.uuid));

    return (
        <div className="w-full">
            <div
                onClick={() => navigate(`/batch-cooking/${batch.uuid}`)}
                className="bg-primary border border-border-color rounded-xl shadow-[0px_4px_6px_rgba(0,0,0,0.1),0px_2px_4px_rgba(0,0,0,0.1)] w-full flex flex-col pt-px px-0.5 hover:border-cout-base transition-colors duration-200 cursor-pointer"
            >
                <div className="h-9 flex items-center justify-center overflow-hidden px-1">
                    <span className="text-sora text-xs leading-5 text-text-primary text-center line-clamp-1">
                        {batch.name}
                    </span>
                </div>

                <div className="px-[5px] pb-[5px]">
                    <div className="w-full aspect-square rounded-tl-[3px] rounded-tr-[3px] rounded-bl-[9px] rounded-br-[9px] overflow-hidden grid grid-cols-2 grid-rows-2 gap-[2px]">
                        {[0, 1, 2, 3].map((i) => (
                            <div key={i} className="overflow-hidden">
                                {recipeUuids[i] ? (
                                    <BatchImageCell recipeUuid={recipeUuids[i]} />
                                ) : (
                                    <div className="w-full h-full bg-border-color" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
