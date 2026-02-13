import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

const screenshots = Object.keys(
  import.meta.glob("/public/onboarding/modal_screenshots/*", { eager: false })
)
  .map((path) => path.replace("/public", ""))
  .sort();

function GlassButton({ onClick, className, children }: {
  onClick: (e: React.MouseEvent) => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-[4vh] h-[4vh] flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white/80 hover:bg-white/30 hover:text-white transition-colors cursor-pointer text-xl ${className ?? ""}`}
    >
      {children}
    </button>
  );
}

function GlassProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="h-[4vh] px-3 flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`rounded-full transition-all duration-300 ${i === current
              ? "w-2 h-2 bg-white"
              : "w-1.5 h-1.5 bg-white/40"
            }`}
        />
      ))}
    </div>
  );
}

export default function LiquidGlassModal() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const touchStartXRef = useRef(0);
  const isDraggingRef = useRef(false);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, screenshots.length - 1));
  }, []);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, []);

  const handleImageClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isDraggingRef.current) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      if (x < rect.width / 2) {
        goPrev();
      } else {
        goNext();
      }
    },
    [goNext, goPrev]
  );

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    isDraggingRef.current = false;
    setSwipeOffset(0);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const delta = e.touches[0].clientX - touchStartXRef.current;
    if (Math.abs(delta) > 5) isDraggingRef.current = true;
    setSwipeOffset(delta);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (swipeOffset < -50) {
      goNext();
    } else if (swipeOffset > 50) {
      goPrev();
    }
    setSwipeOffset(0);
  }, [swipeOffset, goNext, goPrev]);

  const isLast = currentIndex === screenshots.length - 1;

  const handleOpen = useCallback(() => {
    if (!isOpen) {
      setCurrentIndex(0);
      setIsOpen(true);
    }
  }, [isOpen]);

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center z-10 ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      onClick={isOpen ? () => setIsOpen(false) : undefined}
    >
      <div
        onClick={(e) => { e.stopPropagation(); handleOpen(); }}
        className={`
          pointer-events-auto relative
          backdrop-blur-lg
          border border-white/30
          shadow-[0_8px_32px_rgba(0,0,0,0.12)]
          transition-all duration-500 ease-in-out
          overflow-hidden
          ${isOpen
            ? "w-[90vw] h-[80vh] h-[80dvh] bg-white/20 cursor-default"
            : "w-[280px] h-[56px] bg-white/15 cursor-pointer hover:bg-white/25 hover:scale-105 active:scale-95"
          }
        `}
        style={{ borderRadius: isOpen ? "1.5rem" : "1.75rem" }}
      >
        {/* Button label */}
        <span
          className={`
            absolute inset-0 flex items-center justify-center
            text-white font-semibold text-lg whitespace-nowrap select-none
            transition-opacity duration-300
            ${isOpen ? "opacity-0" : "opacity-100"}
          `}
        >
          Générer des recettes
        </span>

        {/* Modal content */}
        <div
          className={`
            absolute inset-0 flex flex-col
            transition-opacity duration-300 delay-200
            ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
          `}
        >
          {/* Screenshot carousel */}
          <div
            className="flex-1 relative overflow-hidden m-4 mb-16 rounded-2xl"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={handleImageClick}
          >
            {screenshots.map((src, i) => (
              <img
                key={src}
                src={src}
                alt=""
                draggable={false}
                className="absolute inset-0 w-full h-full object-contain transition-transform duration-300 ease-in-out select-none"
                style={{
                  transform: `translateX(calc(${(i - currentIndex) * 100}% + ${i === currentIndex ? swipeOffset : 0}px))`,
                }}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <div className={`transition-all duration-[400ms] ${isLast ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
              <GlassButton onClick={(e) => { e.stopPropagation(); goPrev(); }}>
                ‹
              </GlassButton>
            </div>
            <div className="relative flex items-center justify-center">
              <div className={`transition-all duration-[400ms] ${isLast ? "opacity-0 scale-90" : "opacity-100 scale-100"}`}>
                <GlassProgressDots total={screenshots.length} current={currentIndex} />
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); navigate("/profile"); }}
                className={`absolute h-[4vh] px-6 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold whitespace-nowrap cursor-pointer hover:bg-white/30 transition-all duration-[400ms] ${isLast ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"}`}
              >
                Débuter
              </button>
            </div>
            <div className={`transition-all duration-[400ms] ${isLast ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
              <GlassButton onClick={(e) => { e.stopPropagation(); goNext(); }}>
                ›
              </GlassButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
