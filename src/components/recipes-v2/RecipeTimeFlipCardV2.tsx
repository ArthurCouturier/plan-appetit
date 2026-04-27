import { useCallback, useRef, useState } from "react";
import { ClockIcon } from "@heroicons/react/24/outline";

interface RecipeTimeFlipCardV2Props {
    prepTimeMin: number | null;
    cookTimeMin: number | null;
    restTimeMin: number | null;
    totalTimeMin: number | null;
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
            className="w-full max-w-md mx-auto select-none"
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
                className="relative w-full aspect-[3/1] cursor-pointer"
                style={{
                    transformStyle: "preserve-3d",
                    transform: `rotateY(${rotation}deg)`,
                    transition: `transform ${FLIP_DURATION_MS}ms ease-out`,
                }}
                aria-label={isFlipped ? "Voir le temps total" : "Voir le détail des temps"}
            >
                {/* Front : temps total */}
                <div
                    className="absolute inset-0 bg-primary border border-border-color rounded-2xl shadow-md flex items-center justify-center gap-3 px-4"
                    style={{ backfaceVisibility: "hidden" }}
                >
                    <ClockIcon className="w-6 h-6 text-cout-base" />
                    <div className="flex flex-col items-start">
                        <span className="text-xl font-semibold text-text-primary">{total}</span>
                        <span className="text-xs text-text-secondary">au total · touche pour le détail</span>
                    </div>
                </div>

                {/* Back : prép / cuisson / repos */}
                <div
                    className="absolute inset-0 bg-primary border border-border-color rounded-2xl shadow-md flex items-stretch justify-around px-3 py-3"
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
            <span className="text-xs text-text-secondary">{label}</span>
            <span className="text-base font-semibold text-text-primary mt-0.5">{value}</span>
        </div>
    );
}

function Divider() {
    return <div className="w-px bg-border-color/60 my-1.5" />;
}
