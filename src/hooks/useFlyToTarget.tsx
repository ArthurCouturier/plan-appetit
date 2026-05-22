import { useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";

type FlyParams = {
    sourceRect: DOMRect;
    targetSelector: string;
    imageSrc: string;
    alt?: string;
    durationMs?: number;
    pulseTarget?: boolean;
    startRound?: boolean;
    onArrived?: () => void;
};

type FlyingItem = {
    id: number;
    sourceRect: DOMRect;
    targetRect: DOMRect;
    imageSrc: string;
    alt: string;
    durationMs: number;
    pulseTarget: boolean;
    startRound: boolean;
    targetElement: HTMLElement;
    onArrived?: () => void;
};

let nextId = 0;

export function useFlyToTarget() {
    const [items, setItems] = useState<FlyingItem[]>([]);
    const prefersReduced = useReducedMotion();

    const fly = useCallback((params: FlyParams) => {
        const target = document.querySelector(params.targetSelector) as HTMLElement | null;
        if (!target) {
            params.onArrived?.();
            return;
        }
        if (prefersReduced) {
            target.animate(
                [{ transform: "scale(1)" }, { transform: "scale(1.15)" }, { transform: "scale(1)" }],
                { duration: 250, easing: "ease-out" },
            );
            params.onArrived?.();
            return;
        }
        const targetRect = target.getBoundingClientRect();
        const id = ++nextId;
        setItems((prev) => [
            ...prev,
            {
                id,
                sourceRect: params.sourceRect,
                targetRect,
                imageSrc: params.imageSrc,
                alt: params.alt ?? "",
                durationMs: params.durationMs ?? 650,
                pulseTarget: params.pulseTarget ?? true,
                startRound: params.startRound ?? false,
                targetElement: target,
                onArrived: params.onArrived,
            },
        ]);
    }, [prefersReduced]);

    const handleComplete = useCallback((id: number) => {
        setItems((prev) => {
            const item = prev.find((i) => i.id === id);
            if (item?.pulseTarget) {
                item.targetElement.animate(
                    [{ transform: "scale(1)" }, { transform: "scale(1.15)" }, { transform: "scale(1)" }],
                    { duration: 250, easing: "ease-out" },
                );
            }
            item?.onArrived?.();
            return prev.filter((i) => i.id !== id);
        });
    }, []);

    const portal = items.length === 0
        ? null
        : createPortal(
            <>
                {items.map((item) => {
                    const sw = item.sourceRect.width;
                    const sh = item.sourceRect.height;
                    const startSize = item.startRound ? Math.min(sw, sh) : null;
                    const startWidth = startSize ?? sw;
                    const startHeight = startSize ?? sh;
                    const startLeft = item.sourceRect.left + (sw - startWidth) / 2;
                    const startTop = item.sourceRect.top + (sh - startHeight) / 2;
                    const startRadius = item.startRound ? 9999 : 9;

                    const tx = item.targetRect.left;
                    const ty = item.targetRect.top;
                    const tw = item.targetRect.width;
                    const th = item.targetRect.height;

                    const arcPeakY = Math.min(startTop, ty) - 50;
                    const midX = (startLeft + tx) / 2;

                    return (
                        <motion.img
                            key={item.id}
                            src={item.imageSrc}
                            alt={item.alt}
                            draggable={false}
                            style={{
                                position: "fixed",
                                zIndex: 9999,
                                pointerEvents: "none",
                                objectFit: "cover",
                                willChange: "top, left, width, height",
                            }}
                            initial={{
                                top: startTop,
                                left: startLeft,
                                width: startWidth,
                                height: startHeight,
                                borderRadius: startRadius,
                                opacity: 1,
                            }}
                            animate={{
                                top: [startTop, arcPeakY, ty],
                                left: [startLeft, midX, tx],
                                width: tw,
                                height: th,
                                borderRadius: 9999,
                            }}
                            transition={{
                                duration: item.durationMs / 1000,
                                times: [0, 0.5, 1],
                                ease: [0.4, 0, 0.6, 1],
                            }}
                            onAnimationComplete={() => handleComplete(item.id)}
                        />
                    );
                })}
            </>,
            document.body,
        );

    return { fly, portal };
}
