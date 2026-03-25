import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { BellIcon } from "@heroicons/react/24/outline";
import { Capacitor } from "@capacitor/core";

interface NotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
    originRect: DOMRect | null;
}

export default function NotificationPanel({ isOpen, onClose, originRect }: NotificationPanelProps) {
    const [mounted, setMounted] = useState(false);
    const [animating, setAnimating] = useState(false);

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

    return createPortal(
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-[998] bg-black/30 transition-opacity duration-500 ease-in-out ${animating ? "opacity-100" : "opacity-0"}`}
                onClick={onClose}
            />

            {/* Panel liquid glass */}
            <div
                className="fixed z-[999] backdrop-blur-xl bg-white/20 border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden transition-all duration-500 ease-in-out"
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
                    <div className="flex items-center justify-between px-5 pb-4 border-b border-white/20">
                        <h2 className="text-white font-semibold text-lg">Notifications</h2>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white/80 hover:bg-white/30 hover:text-white transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 flex flex-col items-center justify-center px-5 overflow-y-auto">
                        <div className="flex flex-col items-center gap-3 text-center">
                            <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                                <BellIcon className="w-8 h-8 text-white/50" />
                            </div>
                            <p className="text-white/70 text-sm font-medium">Aucune notification</p>
                            <p className="text-white/40 text-xs max-w-[200px]">
                                Tes notifications apparaitront ici
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
}
