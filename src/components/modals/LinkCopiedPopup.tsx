interface LinkCopiedPopupProps {
    position: { x: number; y: number } | null;
}

export default function LinkCopiedPopup({ position }: LinkCopiedPopupProps) {
    if (!position) return null;

    return (
        <div
            className="fixed z-50 pointer-events-none animate-fade-in-up"
            style={{
                left: position.x,
                top: position.y - 60,
                transform: 'translateX(-50%)',
            }}
        >
            <span className="bg-green-600 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap">
                Lien copié dans le presse-papier
            </span>
        </div>
    );
}
