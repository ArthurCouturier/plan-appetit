import { useCallback, useRef, useState } from "react";
import { ClockIcon } from "@heroicons/react/24/outline";

interface RecipeTimeFlipCardV2Props {
    prepTimeMin: number | null;
    cookTimeMin: number | null;
    restTimeMin: number | null;
    totalTimeMin: number | null;
    /** When true, fills its container's height instead of using a fixed aspect ratio. */
    stretchHeight?: boolean;
}

const FLIP_DURATION_MS = 350;

function formatMin(value: number | null): string {
    if (value === null || value === undefined) return "—";
    if (value <= 0) return "—";
    if (value < 60) return `${value} min`;
    const hours = Math.floor(value / 60);
    const minutes = value % 60;
    return minutes === 0 ? `${hours} h` : `${hours} h ${minutes}`;
}

export default function RecipeTimeFlipCardV2({
    prepTimeMin,
    cookTimeMin,
    restTimeMin,
    totalTimeMin,
    stretchHeight = false,
}: RecipeTimeFlipCardV2Props) {
    const [rotation, setRotation] = useState<number>(0);
    const [transitioning, setTransitioning] = useState<boolean>(false);
    const directionRef = useRef<1 | -1>(1);

    const isFlipped = ((rotation % 360) + 360) % 360 === 180;

    const handleClick = useCallback(() => {
        if (transitioning) return;
        const direction = directionRef.current;
        directionRef.current = direction === 1 ? -1 : 1;
        setTransitioning(true);
        setRotation((r) => r + direction * 180);
        setTimeout(() => setTransitioning(false), FLIP_DURATION_MS);
    }, [transitioning]);

    const total = formatMin(totalTimeMin);

    return (
        <div
            className={`w-full max-w-[14rem] mx-auto select-none ${stretchHeight ? "h-full" : ""}`}
            style={{ perspective: "800px" }}
        >
            <div
                role="button"
                tabIndex={0}
                onClick={handleClick}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleClick();
                    }
                }}
                className={`relative w-full cursor-pointer ${stretchHeight ? "h-full" : "aspect-[5/2]"}`}
                style={{
                    transformStyle: "preserve-3d",
                    transform: `rotateY(${rotation}deg)`,
                    transition: `transform ${FLIP_DURATION_MS}ms ease-out`,
                }}
                aria-label={isFlipped ? "Voir le temps total" : "Voir le détail des temps"}
            >
                {/* Front : temps total */}
                <div
                    className="absolute inset-0 bg-primary border border-border-color rounded-xl shadow-md flex items-center justify-center gap-2.5 px-3"
                    style={{ backfaceVisibility: "hidden" }}
                >
                    <ClockIcon className="w-8 h-8 text-cout-base flex-shrink-0" />
                    <div className="flex items-baseline gap-2 min-w-0">
                        <span className="text-xl font-semibold text-text-primary leading-tight">{total}</span>
                        <span className="text-xs text-text-secondary leading-tight">au total</span>
                    </div>
                    <span className="absolute bottom-1.5 left-0 right-0 text-center text-[10px] text-text-secondary leading-tight">
                        touche pour le détail
                    </span>
                </div>

                {/* Back : prép / cuisson / repos */}
                <div
                    className="absolute inset-0 bg-primary border border-border-color rounded-xl shadow-md flex items-stretch justify-around px-2 py-2"
                    style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                    }}
                >
                    <TimeCell label="Prépa" value={formatMin(prepTimeMin)} />
                    <Divider />
                    <TimeCell label="Cuisson" value={formatMin(cookTimeMin)} />
                    <Divider />
                    <TimeCell label="Repos" value={formatMin(restTimeMin)} />
                </div>
            </div>
        </div>
    );
}

function TimeCell({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center">
            <span className="text-[10px] text-text-secondary leading-tight">{label}</span>
            <span className="text-xs font-semibold text-text-primary mt-0.5 leading-tight">{value}</span>
        </div>
    );
}

function Divider() {
    return <div className="w-px bg-border-color/60 my-1.5" />;
}
