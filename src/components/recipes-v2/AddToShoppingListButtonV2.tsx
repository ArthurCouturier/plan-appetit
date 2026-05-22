import { useCallback, useRef, useState } from "react";
import { CheckIcon } from "@heroicons/react/24/solid";
import { useAddRecipeToShoppingList } from "../../api/hooks/useAddRecipeToShoppingList";
import { useFlyToTarget } from "../../hooks/useFlyToTarget";
import { successHaptic } from "../../haptics/success";
import { errorHaptic } from "../../haptics/error";
import ShoppingCartAddIcon from "../shopping/ShoppingCartAddIcon";
import {
    HEADER_TRANSITION_MS,
    isMobileHeaderVisible,
    requestShowHeader,
} from "../global/HeaderMobile";

interface AddToShoppingListButtonV2Props {
    recipeUuid: string;
    recipeName: string;
}

export default function AddToShoppingListButtonV2({
    recipeUuid,
    recipeName,
}: AddToShoppingListButtonV2Props) {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [added, setAdded] = useState(false);
    const addToList = useAddRecipeToShoppingList();
    const { fly, portal } = useFlyToTarget();

    const handleClick = useCallback(() => {
        if (added || addToList.isPending) return;

        setAdded(true);

        addToList.mutate(
            { recipeUuid },
            {
                onSuccess: () => successHaptic(),
                onError: () => {
                    errorHaptic();
                    setAdded(false);
                },
            },
        );

        const headerWasHidden = !isMobileHeaderVisible();
        if (headerWasHidden) requestShowHeader();
        const delayBeforeFly = headerWasHidden ? HEADER_TRANSITION_MS : 0;

        const launchFly = () => {
            if (!buttonRef.current) return;
            const heroImg = document.querySelector<HTMLImageElement>("[data-recipe-hero-image]");
            const imageSrc = heroImg?.src;
            if (!imageSrc) return;
            const sourceRect = buttonRef.current.getBoundingClientRect();
            fly({
                sourceRect,
                targetSelector: "[data-shopping-cart-target]",
                imageSrc,
                alt: recipeName,
                durationMs: 650,
                startRound: true,
            });
        };

        if (delayBeforeFly === 0) launchFly();
        else setTimeout(launchFly, delayBeforeFly);
    }, [added, addToList, recipeUuid, recipeName, fly]);

    return (
        <>
            <button
                ref={buttonRef}
                type="button"
                onClick={handleClick}
                disabled={added || addToList.isPending}
                aria-label="Ajouter à ma liste de courses"
                className={`mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold shadow-md transition-colors active:scale-95 disabled:cursor-default ${
                    added
                        ? "bg-green-600 text-white"
                        : "bg-cout-yellow text-cout-purple hover:bg-cout-yellow/90"
                }`}
            >
                {added ? (
                    <>
                        <CheckIcon className="w-5 h-5" />
                        Ajouté
                    </>
                ) : (
                    <>
                        <ShoppingCartAddIcon />
                        Ajouter à ma liste de courses
                    </>
                )}
            </button>
            {portal}
        </>
    );
}
