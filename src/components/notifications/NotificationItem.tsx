import { useRef, useState, useCallback } from "react";
import type { NotificationInterface } from "../../api/interfaces/notifications/NotificationInterface";

interface NotificationItemProps {
    notif: NotificationInterface;
    onClick: (notif: NotificationInterface) => void;
    onToggleRead: (notif: NotificationInterface) => void;
    onDismiss: (notif: NotificationInterface) => void;
}

const SNAP_PERCENT = 25;
const AUTO_TRIGGER_PERCENT = 50;
const SLOW_RATIO = 0.15;

export default function NotificationItem({ notif, onClick, onToggleRead, onDismiss }: NotificationItemProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const touchStartX = useRef(0);
    const touchStartY = useRef(0);
    const startOffsetX = useRef(0);
    // offsetX: positive = swipe left (toggle read), negative = swipe right (dismiss)
    const [offsetX, setOffsetX] = useState(0);
    const [snapped, setSnapped] = useState(false);
    const [transitioning, setTransitioning] = useState(false);
    const isHorizontalSwipe = useRef<boolean | null>(null);

    const getWidth = () => containerRef.current?.offsetWidth ?? 300;

    const computeOffset = (rawDelta: number): number => {
        const width = getWidth();
        const snapPx = width * SNAP_PERCENT / 100;
        if (rawDelta <= snapPx) return rawDelta;
        const excess = rawDelta - snapPx;
        const maxExtra = width * (AUTO_TRIGGER_PERCENT - SNAP_PERCENT) / 100;
        return snapPx + Math.min(excess * SLOW_RATIO, maxExtra);
    };

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
        startOffsetX.current = offsetX;
        isHorizontalSwipe.current = null;
        setTransitioning(false);
    }, [offsetX]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        const dx = touchStartX.current - e.touches[0].clientX; // positive = swipe left
        const dy = e.touches[0].clientY - touchStartY.current;

        if (isHorizontalSwipe.current === null) {
            if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                isHorizontalSwipe.current = Math.abs(dx) > Math.abs(dy);
            }
            return;
        }

        if (!isHorizontalSwipe.current) return;

        const newOffset = startOffsetX.current + dx;

        if (newOffset >= 0) {
            // Swipe left: toggle read
            setOffsetX(snapped ? Math.max(0, newOffset) : computeOffset(newOffset));
        } else {
            // Swipe right: dismiss
            setOffsetX(-computeOffset(Math.abs(newOffset)));
        }
    }, [snapped]);

    const handleTouchEnd = useCallback(() => {
        if (!isHorizontalSwipe.current) return;

        const width = getWidth();
        const absOffset = Math.abs(offsetX);
        const rawPercent = (absOffset / width) * 100;

        setTransitioning(true);

        if (offsetX > 0) {
            // Swipe left: toggle read
            if (rawPercent >= AUTO_TRIGGER_PERCENT * 0.6) {
                setOffsetX(0);
                setSnapped(false);
                onToggleRead(notif);
            } else if (rawPercent >= SNAP_PERCENT * 0.8) {
                setOffsetX(width * SNAP_PERCENT / 100);
                setSnapped(true);
            } else {
                setOffsetX(0);
                setSnapped(false);
            }
        } else {
            // Swipe right: dismiss
            if (rawPercent >= AUTO_TRIGGER_PERCENT * 0.6) {
                setOffsetX(0);
                setSnapped(false);
                onDismiss(notif);
            } else if (rawPercent >= SNAP_PERCENT * 0.8) {
                setOffsetX(-(width * SNAP_PERCENT / 100));
                setSnapped(true);
            } else {
                setOffsetX(0);
                setSnapped(false);
            }
        }
    }, [offsetX, notif, onToggleRead, onDismiss]);

    const handleActionClick = useCallback(() => {
        setTransitioning(true);
        setOffsetX(0);
        setSnapped(false);
        if (offsetX > 0) {
            onToggleRead(notif);
        } else {
            onDismiss(notif);
        }
    }, [offsetX, notif, onToggleRead, onDismiss]);

    const handleContentClick = useCallback(() => {
        if (snapped) {
            setTransitioning(true);
            setOffsetX(0);
            setSnapped(false);
            return;
        }
        onClick(notif);
    }, [snapped, notif, onClick]);

    const toggleReadLabel = notif.read ? "Non lue" : "Lue";
    const absOffset = Math.abs(offsetX);

    return (
        <div ref={containerRef} className="relative rounded-xl overflow-hidden">
            {/* Bouton bleu a droite (swipe left = toggle read) */}
            {offsetX > 0 && (
                <div
                    className="absolute top-0 bottom-0 right-0 flex items-center justify-center rounded-xl bg-blue-500"
                    style={{ width: absOffset }}
                >
                    <button
                        onClick={handleActionClick}
                        className="h-full w-full flex items-center justify-center text-white text-xs font-semibold px-2"
                    >
                        {toggleReadLabel}
                    </button>
                </div>
            )}

            {/* Bouton rouge a gauche (swipe right = dismiss) */}
            {offsetX < 0 && (
                <div
                    className="absolute top-0 bottom-0 left-0 flex items-center justify-center rounded-xl bg-red-500"
                    style={{ width: absOffset }}
                >
                    <button
                        onClick={handleActionClick}
                        className="h-full w-full flex items-center justify-center text-white text-xs font-semibold px-2"
                    >
                        Retirer
                    </button>
                </div>
            )}

            {/* Contenu de la notification */}
            <div
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={handleContentClick}
                className={`relative w-full text-left p-3 rounded-xl ${
                    notif.read
                        ? "bg-white/5"
                        : "bg-white/15"
                } ${transitioning ? "transition-transform duration-300 ease-out" : ""}`}
                style={{ transform: `translateX(${-offsetX}px)` }}
            >
                <div className="flex items-start gap-3">
                    {!notif.read && (
                        <span className="mt-1.5 w-2 h-2 rounded-full bg-red-400 shrink-0" />
                    )}
                    <div className={`flex-1 min-w-0 ${notif.read ? "pl-5" : ""}`}>
                        <p className={`text-sm truncate ${notif.read ? "text-white/60" : "text-white font-medium"}`}>
                            {notif.title}
                        </p>
                        <p className="text-xs text-white/50 mt-0.5 line-clamp-2">
                            {notif.body}
                        </p>
                        <p className="text-[10px] text-white/30 mt-1">
                            {formatDate(notif.createdAt)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function formatDate(isoString: string): string {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffH = Math.floor(diffMin / 60);
    const diffD = Math.floor(diffH / 24);

    if (diffMin < 1) return "A l'instant";
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    if (diffH < 24) return `Il y a ${diffH}h`;
    if (diffD < 7) return `Il y a ${diffD}j`;
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}
