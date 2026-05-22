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
                    const sx = item.sourceRect.left;
                    const sy = item.sourceRect.top;
                    const sw = item.sourceRect.width;
                    const sh = item.sourceRect.height;
                    const tx = item.targetRect.left;
                    const ty = item.targetRect.top;
                    const tw = item.targetRect.width;
                    const th = item.targetRect.height;

                    const arcPeakY = Math.min(sy, ty) - 50;
                    const midX = (sx + tx) / 2;

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
                                top: sy,
                                left: sx,
                                width: sw,
                                height: sh,
                                borderRadius: 9,
                                opacity: 1,
                            }}
                            animate={{
                                top: [sy, arcPeakY, ty],
                                left: [sx, midX, tx],
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
