import { useState } from "react";

export default function LiquidGlassModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      <div
        onClick={() => !isOpen && setIsOpen(true)}
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
            absolute inset-0
            transition-opacity duration-300 delay-200
            ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
          `}
        >
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white/80 hover:bg-white/30 hover:text-white transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
