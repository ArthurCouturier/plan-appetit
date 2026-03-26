import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { BellIcon, CheckIcon } from "@heroicons/react/24/outline";
import { Capacitor } from "@capacitor/core";
import InAppNotificationService from "../../api/services/InAppNotificationService";
import type { NotificationInterface, NotificationPageInterface } from "../../api/interfaces/notifications/NotificationInterface";
import NotificationItem from "./NotificationItem";

interface NotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
    originRect: DOMRect | null;
}

const PULL_THRESHOLD = 60;

export default function NotificationPanel({ isOpen, onClose, originRect }: NotificationPanelProps) {
    const navigate = useNavigate();
    const [mounted, setMounted] = useState(false);
    const [animating, setAnimating] = useState(false);
    const [notifications, setNotifications] = useState<NotificationInterface[]>([]);
    const [pageInfo, setPageInfo] = useState<{ totalPages: number; unreadCount: number }>({ totalPages: 0, unreadCount: 0 });
    const [currentPage, setCurrentPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);
    const touchStartY = useRef(0);
    const isPulling = useRef(false);

    useEffect(() => {
        if (isOpen) {
            setMounted(true);
            document.body.style.overflow = "hidden";
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setAnimating(true);
                });
            });
        } else {
            setAnimating(false);
            document.body.style.overflow = "";
            const timer = setTimeout(() => setMounted(false), 500);
            return () => clearTimeout(timer);
        }
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    const [isLargeScreen, setIsLargeScreen] = useState(() => window.innerWidth >= 768);

    useEffect(() => {
        const onResize = () => setIsLargeScreen(window.innerWidth >= 768);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    const fetchPage = useCallback(async (page: number, reset: boolean = false) => {
        setLoading(true);
        try {
            const data: NotificationPageInterface = await InAppNotificationService.getNotifications(page);
            setNotifications(prev => reset ? data.content : [...prev, ...data.content]);
            setPageInfo({ totalPages: data.totalPages, unreadCount: data.unreadCount });
            setCurrentPage(page);
        } catch {
            // silently fail
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchPage(0, true);
        }
    }, [isOpen, fetchPage]);

    // Infinite scroll
    const handleScroll = useCallback(() => {
        const el = scrollRef.current;
        if (!el || loading) return;
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 50) {
            if (currentPage + 1 < pageInfo.totalPages) {
                fetchPage(currentPage + 1);
            }
        }
    }, [loading, currentPage, pageInfo.totalPages, fetchPage]);

    // Pull-to-refresh touch handlers
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        const el = scrollRef.current;
        if (el && el.scrollTop <= 0 && !refreshing) {
            touchStartY.current = e.touches[0].clientY;
            isPulling.current = true;
        }
    }, [refreshing]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!isPulling.current || refreshing) return;
        const el = scrollRef.current;
        if (el && el.scrollTop > 0) {
            isPulling.current = false;
            setPullDistance(0);
            return;
        }
        const delta = e.touches[0].clientY - touchStartY.current;
        if (delta > 0) {
            setPullDistance(Math.min(delta * 0.5, PULL_THRESHOLD * 1.5));
        }
    }, [refreshing]);

    const handleTouchEnd = useCallback(async () => {
        if (!isPulling.current) return;
        isPulling.current = false;

        if (pullDistance >= PULL_THRESHOLD) {
            setRefreshing(true);
            setPullDistance(PULL_THRESHOLD);
            await fetchPage(0, true);
            setRefreshing(false);
        }
        setPullDistance(0);
    }, [pullDistance, fetchPage]);

    const handleNotificationClick = useCallback(async (notif: NotificationInterface) => {
        if (!notif.read) {
            try {
                await InAppNotificationService.markAsRead(notif.id);
                setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
                setPageInfo(prev => ({ ...prev, unreadCount: Math.max(0, prev.unreadCount - 1) }));
            } catch { /* */ }
        }
        if (notif.actionUrl) {
            onClose();
            navigate(notif.actionUrl);
        }
    }, [navigate, onClose]);

    const handleToggleRead = useCallback(async (notif: NotificationInterface) => {
        try {
            if (notif.read) {
                await InAppNotificationService.markAsUnread(notif.id);
                setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: false } : n));
                setPageInfo(prev => ({ ...prev, unreadCount: prev.unreadCount + 1 }));
            } else {
                await InAppNotificationService.markAsRead(notif.id);
                setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
                setPageInfo(prev => ({ ...prev, unreadCount: Math.max(0, prev.unreadCount - 1) }));
            }
        } catch { /* */ }
    }, []);

    const handleMarkAllRead = useCallback(async () => {
        try {
            await InAppNotificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setPageInfo(prev => ({ ...prev, unreadCount: 0 }));
        } catch { /* */ }
    }, []);

    if (!mounted || !originRect) return null;

    const closedRadius = originRect.width / 2;

    const closedStyle: React.CSSProperties = {
        top: originRect.top,
        left: originRect.left,
        width: originRect.width,
        height: originRect.height,
        borderRadius: closedRadius,
    };

    const openStyle: React.CSSProperties = isLargeScreen
        ? {
            width: "min(480px, 45vw)",
            height: "60dvh",
            top: "20dvh",
            left: "calc((100vw - min(480px, 45vw)) / 2)",
            borderRadius: "1.5rem",
        }
        : (() => {
            const isIOS = Capacitor.isNativePlatform() && Capacitor.getPlatform() === "ios";
            return {
                top: `calc(env(safe-area-inset-top, 0px) + 4px)`,
                left: "5vw",
                width: "90vw",
                height: `calc(100dvh - env(safe-area-inset-top, 0px) - 5vw - 4px)`,
                borderRadius: isIOS ? "1.5rem 1.5rem 2.8rem 2.8rem" : "1.5rem",
            };
        })();

    const style = animating ? openStyle : closedStyle;

    const isEmpty = notifications.length === 0 && !loading;
    const showPullIndicator = pullDistance > 0 || refreshing;
    const pullProgress = Math.min(pullDistance / PULL_THRESHOLD, 1);

    return createPortal(
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-[998] bg-black/30 transition-opacity duration-500 ease-in-out ${animating ? "opacity-100" : "opacity-0"}`}
                onClick={onClose}
            />

            {/* Panel liquid glass */}
            <div
                className="fixed z-[999] backdrop-blur-xl bg-black/40 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.25)] overflow-hidden transition-all duration-500 ease-in-out"
                style={style}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Icone cloche visible quand ferme */}
                <div
                    className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${animating ? "opacity-0 pointer-events-none" : "opacity-100"}`}
                >
                    <BellIcon className="w-5 h-5 text-white" />
                </div>

                {/* Contenu visible quand ouvert */}
                <div
                    className={`absolute inset-0 flex flex-col pt-3 transition-opacity duration-300 ${animating ? "opacity-100 delay-200" : "opacity-0 pointer-events-none"}`}
                >
                    {/* Header du panneau */}
                    <div className="flex items-center justify-between px-5 pb-3 border-b border-white/20">
                        <h2 className="text-white font-semibold text-lg">Notifications</h2>
                        <div className="flex items-center gap-2">
                            {pageInfo.unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="h-8 px-3 flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white/80 hover:bg-white/30 hover:text-white transition-colors text-xs"
                                >
                                    <CheckIcon className="w-3.5 h-3.5" />
                                    Tout lire
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white/80 hover:bg-white/30 hover:text-white transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Pull-to-refresh indicator */}
                    {showPullIndicator && (
                        <div
                            className="flex justify-center overflow-hidden transition-all duration-200"
                            style={{ height: refreshing ? 40 : pullDistance * 0.6 }}
                        >
                            <div className="flex items-center justify-center py-2">
                                <div
                                    className={`w-5 h-5 border-2 border-white/30 border-t-white/80 rounded-full ${refreshing ? "animate-spin" : ""}`}
                                    style={!refreshing ? { transform: `rotate(${pullProgress * 360}deg)` } : undefined}
                                />
                            </div>
                        </div>
                    )}

                    {/* Liste des notifications */}
                    <div
                        ref={scrollRef}
                        onScroll={handleScroll}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        className="flex-1 overflow-y-auto overscroll-contain px-3"
                    >
                        {isEmpty ? (
                            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                                <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                                    <BellIcon className="w-8 h-8 text-white/50" />
                                </div>
                                <p className="text-white/70 text-sm font-medium">Aucune notification</p>
                                <p className="text-white/40 text-xs max-w-[200px]">
                                    Tes notifications apparaitront ici
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2 py-2">
                                {notifications.map((notif) => (
                                    <NotificationItem
                                        key={notif.id}
                                        notif={notif}
                                        onClick={handleNotificationClick}
                                        onToggleRead={handleToggleRead}
                                    />
                                ))}
                                {loading && (
                                    <div className="flex justify-center py-3">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white/80 rounded-full animate-spin" />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
}
