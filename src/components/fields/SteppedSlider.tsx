import NumberFlow from "@number-flow/react";
import { useCallback, useRef, useState } from "react";
import { lightHaptic } from "../../haptics/light";

interface SteppedSliderProps {
    label?: string;
    value: number;
    onChange: (value: number) => void;
    steps: number[];
    suffix?: string;
    className?: string;
    htmlFor?: string;
}

export default function SteppedSlider({
    label,
    value,
    onChange,
    steps,
    suffix = "",
    className = "",
    htmlFor = "steppedSlider",
}: SteppedSliderProps) {
    const trackRef = useRef<HTMLDivElement | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const sortedSteps = [...steps].sort((a, b) => a - b);
    const currentIndex = nearestStepIndex(sortedSteps, value);

    const snapFromClientX = useCallback((clientX: number) => {
        const track = trackRef.current;
        if (!track) return;
        const rect = track.getBoundingClientRect();
        const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
        const targetIndex = Math.round(ratio * (sortedSteps.length - 1));
        const targetValue = sortedSteps[targetIndex];
        if (targetValue !== value) {
            onChange(targetValue);
            lightHaptic();
        }
    }, [sortedSteps, value, onChange]);

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        e.preventDefault();
        trackRef.current?.setPointerCapture(e.pointerId);
        setIsDragging(true);
        snapFromClientX(e.clientX);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging) return;
        snapFromClientX(e.clientX);
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging) return;
        setIsDragging(false);
        trackRef.current?.releasePointerCapture(e.pointerId);
        snapFromClientX(e.clientX);
    };

    return (
        <div className={`flex flex-col gap-6 ${className}`} id={htmlFor}>
            {label && (
                <label htmlFor={htmlFor} className="text-sm font-semibold text-text-secondary text-center">
                    {label}
                </label>
            )}

            <div className="text-center">
                <span className="text-3xl font-bold text-text-primary">
                    <NumberFlow value={sortedSteps[currentIndex]} />
                    {suffix && <span className="text-xl font-semibold text-text-secondary ml-1">{suffix}</span>}
                </span>
            </div>

            <div
                ref={trackRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className="relative h-12 flex items-center cursor-pointer touch-none select-none"
                role="slider"
                aria-valuemin={sortedSteps[0]}
                aria-valuemax={sortedSteps[sortedSteps.length - 1]}
                aria-valuenow={sortedSteps[currentIndex]}
            >
                <div className="absolute left-0 right-0 h-1 bg-border-color rounded-full" />
                <div
                    className="absolute h-1 bg-cout-yellow rounded-full"
                    style={{
                        left: 0,
                        width: `${(currentIndex / (sortedSteps.length - 1)) * 100}%`,
                    }}
                />

                {sortedSteps.map((step, i) => {
                    const left = (i / (sortedSteps.length - 1)) * 100;
                    const isActive = i === currentIndex;
                    return (
                        <div
                            key={step}
                            aria-hidden
                            className={`absolute -translate-x-1/2 -translate-y-1/2 top-1/2 transition-all duration-150 rounded-full pointer-events-none ${
                                isActive
                                    ? "w-6 h-6 bg-cout-yellow shadow-md"
                                    : "w-2.5 h-2.5 bg-border-color"
                            }`}
                            style={{ left: `${left}%` }}
                        />
                    );
                })}
            </div>

            <div className="flex justify-between px-1 text-xs text-text-secondary">
                <span>{sortedSteps[0]}{suffix}</span>
                <span>{sortedSteps[sortedSteps.length - 1]}{suffix}</span>
            </div>
        </div>
    );
}

function nearestStepIndex(steps: number[], value: number): number {
    if (steps.length === 0) return 0;
    let best = 0;
    let bestDist = Math.abs(steps[0] - value);
    for (let i = 1; i < steps.length; i++) {
        const d = Math.abs(steps[i] - value);
        if (d < bestDist) {
            bestDist = d;
            best = i;
        }
    }
    return best;
}
