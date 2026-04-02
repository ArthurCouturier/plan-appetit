import { useState, useRef, useCallback, useImperativeHandle, forwardRef } from "react";
import { lightHaptic } from "../../haptics/light";

interface TabSliderProps {
    tabs: { id: string; label: string }[];
    activeTab: string;
    onChange: (tabId: string) => void;
}

export interface TabSliderHandle {
    animateTransition: () => void;
}

type Mode = "rest" | "dragging" | "contracting" | "expanding";

const TabSlider = forwardRef<TabSliderHandle, TabSliderProps>(({ tabs, activeTab, onChange }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [mode, setMode] = useState<Mode>("rest");
    const [dragX, setDragX] = useState(0);
    const prevIndexRef = useRef(tabs.findIndex((t) => t.id === activeTab));

    const activeIndex = tabs.findIndex((t) => t.id === activeTab);
    const tabWidthPercent = 100 / tabs.length;
    const PADDING = 4;

    const getContainerRect = () => containerRef.current?.getBoundingClientRect();

    useImperativeHandle(ref, () => ({
        animateTransition: () => {
            // Contract from previous position, then expand on new
            setMode("contracting");
            setTimeout(() => {
                prevIndexRef.current = activeIndex;
                setMode("expanding");
                setTimeout(() => setMode("rest"), 160);
            }, 130);
        },
    }), [activeIndex]);

    const displayIndex = mode === "contracting" ? prevIndexRef.current : activeIndex;

    const getIndicatorStyle = (): React.CSSProperties => {
        const rect = getContainerRect();
        const containerH = rect?.height ?? 44;
        const containerW = rect?.width ?? 300;
        const circleSize = containerH - PADDING * 2;
        const tabW = (containerW - PADDING * 2) / tabs.length;

        if (mode === "dragging") {
            const minX = PADDING;
            const maxX = containerW - circleSize - PADDING;
            const clampedX = Math.max(minX, Math.min(maxX, dragX - circleSize / 2));
            return {
                position: "absolute",
                top: PADDING,
                left: clampedX,
                width: circleSize,
                height: circleSize,
                borderRadius: "50%",
                transition: "none",
            };
        }

        if (mode === "contracting") {
            const centerX = PADDING + displayIndex * tabW + tabW / 2 - circleSize / 2;
            return {
                position: "absolute",
                top: PADDING,
                left: centerX,
                width: circleSize,
                height: circleSize,
                borderRadius: "50%",
                transition: "width 120ms ease-in, border-radius 120ms ease-in, left 120ms ease-in",
            };
        }

        if (mode === "expanding") {
            return {
                position: "absolute",
                top: PADDING,
                bottom: PADDING,
                left: `calc(${activeIndex * tabWidthPercent}% + ${PADDING}px)`,
                width: `calc(${tabWidthPercent}% - ${PADDING * 2}px)`,
                borderRadius: "0.5rem",
                transition: "width 150ms ease-out, border-radius 150ms ease-out, left 150ms ease-out",
            };
        }

        // rest
        return {
            position: "absolute",
            top: PADDING,
            bottom: PADDING,
            left: `calc(${activeIndex * tabWidthPercent}% + ${PADDING}px)`,
            width: `calc(${tabWidthPercent}% - ${PADDING * 2}px)`,
            borderRadius: "0.5rem",
            transition: "left 250ms ease-in-out",
        };
    };

    const handleTabClick = (tabId: string) => {
        if (mode === "dragging") return;
        const targetIndex = tabs.findIndex((t) => t.id === tabId);
        if (targetIndex === activeIndex) return;

        prevIndexRef.current = activeIndex;
        setMode("contracting");
        setTimeout(() => {
            onChange(tabId);
            lightHaptic();
            setMode("expanding");
            setTimeout(() => setMode("rest"), 160);
        }, 130);
    };

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        const rect = getContainerRect();
        if (!rect) return;
        const x = e.touches[0].clientX - rect.left;
        setDragX(x);
        setMode("dragging");
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (mode !== "dragging") return;
        const rect = getContainerRect();
        if (!rect) return;
        setDragX(e.touches[0].clientX - rect.left);
    }, [mode]);

    const handleTouchEnd = useCallback(() => {
        if (mode !== "dragging") return;
        const rect = getContainerRect();
        if (!rect) return;

        const tabWidth = rect.width / tabs.length;
        const targetIndex = Math.max(0, Math.min(tabs.length - 1, Math.floor(dragX / tabWidth)));
        const targetTab = tabs[targetIndex].id;

        onChange(targetTab);
        lightHaptic();
        setMode("expanding");
        setTimeout(() => setMode("rest"), 160);
    }, [mode, dragX, tabs, onChange]);

    return (
        <div
            ref={containerRef}
            className="relative flex bg-secondary rounded-xl p-1 mb-6 max-w-md mx-auto select-none overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ touchAction: "none" }}
        >
            {/* Sliding indicator */}
            <div className="bg-cout-yellow shadow-sm" style={getIndicatorStyle()} />

            {/* Labels */}
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`relative z-10 flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-150 ${
                        tab.id === activeTab ? "text-cout-purple" : "text-text-secondary"
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
});

TabSlider.displayName = "TabSlider";
export default TabSlider;
