import { useState } from "react";
import { ArrowUpOnSquareIcon } from "@heroicons/react/24/solid";
import { Capacitor } from "@capacitor/core";
import { Share } from "@capacitor/share";

interface ShareButtonProps {
    url: string;
    title: string;
    text?: string;
    dialogTitle?: string;
    label?: string;
    onShared?: () => void | Promise<void>;
    fullWidth?: boolean;
    className?: string;
}

export default function ShareButton({
    url,
    title,
    text,
    dialogTitle,
    label = "Partager",
    onShared,
    fullWidth = false,
    className = "",
}: ShareButtonProps) {
    const [isSharing, setIsSharing] = useState(false);

    const handleShare = async () => {
        if (isSharing) return;
        setIsSharing(true);
        try {
            if (Capacitor.isNativePlatform()) {
                await Share.share({
                    title,
                    text,
                    url,
                    dialogTitle: dialogTitle ?? title,
                });
                await onShared?.();
            } else if (navigator.share) {
                await navigator.share({ title, text, url });
                await onShared?.();
            } else {
                await navigator.clipboard.writeText(url);
                alert("Lien copié dans le presse-papier !");
                await onShared?.();
            }
        } catch (error) {
            const msg = (error as Error).message || "";
            if (msg !== "Share canceled" && (error as Error).name !== "AbortError") {
                console.error("Erreur lors du partage:", error);
            }
        } finally {
            setIsSharing(false);
        }
    };

    const widthClass = fullWidth ? "w-full" : "";

    return (
        <button
            type="button"
            onClick={handleShare}
            disabled={isSharing}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cout-base to-cout-purple text-white font-semibold rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 ${widthClass} ${className}`}
        >
            <ArrowUpOnSquareIcon className="w-5 h-5" />
            <span>{label}</span>
        </button>
    );
}
