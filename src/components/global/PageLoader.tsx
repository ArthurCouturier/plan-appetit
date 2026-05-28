interface PageLoaderProps {
    message?: string;
    /** Si false, le loader prend la hauteur de son parent au lieu de min-h-screen. */
    fullScreen?: boolean;
}

export default function PageLoader({
    message = "Chargement...",
    fullScreen = true,
}: PageLoaderProps) {
    return (
        <div
            className={`flex items-center justify-center bg-bg-color px-4 ${
                fullScreen ? "min-h-screen" : "py-12"
            }`}
        >
            <p className="text-text-secondary text-sm animate-pulse">{message}</p>
        </div>
    );
}
