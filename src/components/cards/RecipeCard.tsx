import { useNavigate } from "react-router-dom";
import { useCallback, useRef, useState } from "react";
import RecipeInterface from "../../api/interfaces/recipes/RecipeInterface";
import RecipeSummaryInterface from "../../api/interfaces/recipes/RecipeSummaryInterface";
import { useRecipeImage } from "../../api/hooks/useRecipeImage";
import { UserGroupIcon, CurrencyEuroIcon, ListBulletIcon } from "@heroicons/react/24/solid";

type RecipeCardProps = {
    recipe: RecipeInterface | RecipeSummaryInterface;
};

function getStepsCount(recipe: RecipeInterface | RecipeSummaryInterface): number {
    if ('stepsCount' in recipe) return recipe.stepsCount;
    return recipe.steps.length;
}

const ZONE_THRESHOLD = 0.3;

export default function RecipeCard({ recipe }: RecipeCardProps) {
    const navigate = useNavigate();
    const { data: imageData, isLoading } = useRecipeImage(String(recipe.uuid));

    const [rotation, setRotation] = useState(0);
    const [transitioning, setTransitioning] = useState(false);

    const rotationRef = useRef(0);
    const didSwipeRef = useRef(false);
    const isDraggingRef = useRef(false);
    const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const startRef = useRef<{
        x: number;
        y: number;
        zone: 'left' | 'right';
        cardWidth: number;
        baseRotation: number;
        directionLocked: boolean;
    } | null>(null);

    const stepsCount = getStepsCount(recipe);

    const updateRotation = useCallback((value: number) => {
        rotationRef.current = value;
        setRotation(value);
    }, []);

    const normalizeRotation = useCallback(() => {
        const current = rotationRef.current;
        const normalized = ((current % 360) + 360) % 360;
        const target = normalized < 90 || normalized > 270 ? 0 : 180;
        if (target !== current) {
            rotationRef.current = target;
            setRotation(target);
        }
    }, []);

    const clearTransitionTimeout = useCallback(() => {
        if (transitionTimeoutRef.current) {
            clearTimeout(transitionTimeoutRef.current);
            transitionTimeoutRef.current = null;
        }
    }, []);

    const isCurrentlyFlipped = useCallback(() => {
        const normalized = ((rotationRef.current % 360) + 360) % 360;
        return normalized >= 90 && normalized <= 270;
    }, []);

    const handleStart = useCallback((clientX: number, clientY: number, currentTarget: Element) => {
        if (transitioning) return;

        const rect = currentTarget.getBoundingClientRect();
        const relativeX = clientX - rect.left;
        const cardWidth = rect.width;

        const threshold = isCurrentlyFlipped() ? 0.5 : ZONE_THRESHOLD;

        let zone: 'left' | 'right' | null = null;
        if (relativeX < cardWidth * threshold) zone = 'left';
        else if (relativeX > cardWidth * (1 - threshold)) zone = 'right';

        if (!zone) return;

        startRef.current = {
            x: clientX,
            y: clientY,
            zone,
            cardWidth,
            baseRotation: rotationRef.current,
            directionLocked: false,
        };
        isDraggingRef.current = false;
        didSwipeRef.current = false;
    }, [transitioning, isCurrentlyFlipped]);

    const handleMove = useCallback((clientX: number, clientY: number) => {
        const start = startRef.current;
        if (!start) return;

        const deltaX = clientX - start.x;
        const deltaY = clientY - start.y;

        if (!start.directionLocked) {
            const absDx = Math.abs(deltaX);
            const absDy = Math.abs(deltaY);
            if (absDx < 5 && absDy < 5) return;
            if (absDy > absDx) {
                startRef.current = null;
                return;
            }
            start.directionLocked = true;
        }

        const { zone, cardWidth, baseRotation } = start;
        if (zone === 'right' && deltaX > 0) return;
        if (zone === 'left' && deltaX < 0) return;

        isDraggingRef.current = true;
        didSwipeRef.current = true;

        const progress = Math.min(Math.abs(deltaX) / cardWidth, 1);
        const direction = zone === 'right' ? -1 : 1;
        updateRotation(baseRotation + direction * 180 * progress);
    }, [updateRotation]);

    const handleEnd = useCallback(() => {
        const start = startRef.current;
        if (!start || !isDraggingRef.current) {
            startRef.current = null;
            return;
        }

        const currentRotation = rotationRef.current;
        const deltaRotation = currentRotation - start.baseRotation;
        const progress = Math.abs(deltaRotation) / 180;

        let targetRotation: number;
        if (progress > 0.5) {
            const direction = deltaRotation > 0 ? 1 : -1;
            targetRotation = start.baseRotation + direction * 180;
        } else {
            targetRotation = start.baseRotation;
        }

        startRef.current = null;
        isDraggingRef.current = false;

        if (Math.abs(targetRotation - currentRotation) < 0.5) {
            updateRotation(targetRotation);
            normalizeRotation();
        } else {
            setTransitioning(true);
            updateRotation(targetRotation);
            clearTransitionTimeout();
            transitionTimeoutRef.current = setTimeout(() => {
                setTransitioning(false);
                normalizeRotation();
            }, 350);
        }
    }, [updateRotation, normalizeRotation, clearTransitionTimeout]);

    const handleTransitionEnd = useCallback((e: React.TransitionEvent) => {
        if (e.propertyName !== 'transform') return;
        clearTransitionTimeout();
        setTransitioning(false);
        normalizeRotation();
    }, [normalizeRotation, clearTransitionTimeout]);

    const flipBack = useCallback((direction: 1 | -1) => {
        const targetRotation = rotationRef.current + direction * 180;
        setTransitioning(true);
        updateRotation(targetRotation);
        clearTransitionTimeout();
        transitionTimeoutRef.current = setTimeout(() => {
            setTransitioning(false);
            normalizeRotation();
        }, 350);
    }, [updateRotation, normalizeRotation, clearTransitionTimeout]);

    const handleClick = useCallback((e: React.MouseEvent) => {
        if (didSwipeRef.current) return;
        if (transitioning) return;

        if (!isCurrentlyFlipped()) {
            navigate(`/recettes/${recipe.uuid}`);
            return;
        }

        const rect = e.currentTarget.getBoundingClientRect();
        const relativeX = e.clientX - rect.left;
        const direction: 1 | -1 = relativeX > rect.width / 2 ? -1 : 1;
        flipBack(direction);
    }, [navigate, recipe.uuid, transitioning, isCurrentlyFlipped, flipBack]);

    const onTouchStart = useCallback((e: React.TouchEvent) => {
        const touch = e.touches[0];
        handleStart(touch.clientX, touch.clientY, e.currentTarget);
    }, [handleStart]);

    const onTouchMove = useCallback((e: React.TouchEvent) => {
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
    }, [handleMove]);

    const onTouchEnd = useCallback(() => {
        handleEnd();
    }, [handleEnd]);

    const onMouseDown = useCallback((e: React.MouseEvent) => {
        if (e.button !== 0) return;
        handleStart(e.clientX, e.clientY, e.currentTarget);

        const onMouseMove = (ev: MouseEvent) => handleMove(ev.clientX, ev.clientY);
        const onMouseUp = () => {
            handleEnd();
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    }, [handleStart, handleMove, handleEnd]);

    return (
        <div className="w-full" style={{ perspective: '800px' }}>
            <div
                onClick={handleClick}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onTouchCancel={onTouchEnd}
                onMouseDown={onMouseDown}
                onTransitionEnd={handleTransitionEnd}
                className={`relative w-full select-none ${transitioning ? 'transition-transform duration-300 ease-out' : ''}`}
                style={{
                    transformStyle: 'preserve-3d',
                    transform: `rotateY(${rotation}deg)`,
                    touchAction: 'pan-y',
                }}
            >
                {/* Front face */}
                <div
                    className="bg-primary border border-border-color rounded-xl shadow-[0px_4px_6px_rgba(0,0,0,0.1),0px_2px_4px_rgba(0,0,0,0.1)] w-full flex flex-col pt-px px-0.5 hover:border-cout-base transition-colors duration-200"
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    <div className="h-9 flex items-center justify-center overflow-hidden px-1">
                        <span className="text-sora text-xs leading-5 text-text-primary text-center line-clamp-1">
                            {recipe.name}
                        </span>
                    </div>

                    <div className="px-[5px] pb-[5px]">
                        <div className="w-full aspect-square rounded-tl-[3px] rounded-tr-[3px] rounded-bl-[9px] rounded-br-[9px] overflow-hidden">
                            {isLoading ? (
                                <div className="w-full h-full bg-gradient-to-r from-border-color via-secondary to-border-color animate-shimmer bg-[length:200%_100%]" />
                            ) : imageData ? (
                                <img
                                    src={`data:image/png;base64,${imageData}`}
                                    alt={recipe.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-border-color flex items-center justify-center">
                                    <span className="text-2xl">🍽️</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Back face */}
                <div
                    className="absolute inset-0 bg-primary border border-border-color rounded-xl shadow-[0px_4px_6px_rgba(0,0,0,0.1),0px_2px_4px_rgba(0,0,0,0.1)] w-full flex flex-col pt-px px-0.5"
                    style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                    }}
                >
                    <div className="h-9 flex items-center justify-center overflow-hidden px-1">
                        <span className="text-sora text-xs leading-5 text-text-primary text-center line-clamp-1">
                            {recipe.name}
                        </span>
                    </div>

                    <div className="px-[5px] pb-[5px] flex-1">
                        <div className="w-full h-full rounded-tl-[3px] rounded-tr-[3px] rounded-bl-[9px] rounded-br-[9px] flex flex-col items-center justify-center gap-3 bg-secondary/50">
                            <div className="flex items-center gap-2 text-text-secondary">
                                <UserGroupIcon className="w-4 h-4 text-cout-base flex-shrink-0" />
                                <span className="text-sm font-medium">
                                    {recipe.covers} personne{recipe.covers > 1 ? 's' : ''}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-text-secondary">
                                <ListBulletIcon className="w-4 h-4 text-cout-base flex-shrink-0" />
                                <span className="text-sm font-medium">
                                    {stepsCount} étape{stepsCount > 1 ? 's' : ''}
                                </span>
                            </div>
                            {recipe.buyPrice > 0 && (
                                <div className="flex items-center gap-2 text-text-secondary">
                                    <CurrencyEuroIcon className="w-4 h-4 text-cout-yellow flex-shrink-0" />
                                    <span className="text-sm font-medium">
                                        {Number(recipe.buyPrice).toFixed(2)} €
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
