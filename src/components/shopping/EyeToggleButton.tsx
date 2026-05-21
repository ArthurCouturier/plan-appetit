import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import { lightHaptic } from "../../haptics/light";

interface EyeToggleButtonProps {
    showChecked: boolean;
    onToggle: (next: boolean) => void;
    className?: string;
}

export default function EyeToggleButton({
    showChecked,
    onToggle,
    className = "",
}: EyeToggleButtonProps) {
    const handleClick = () => {
        lightHaptic();
        onToggle(!showChecked);
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            aria-label={showChecked ? "Masquer les articles cochés" : "Afficher les articles cochés"}
            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors shadow-sm ${
                showChecked
                    ? "bg-secondary text-text-primary"
                    : "bg-border-color/50 text-text-secondary"
            } ${className}`}
        >
            {showChecked ? (
                <EyeIcon className="w-5 h-5" />
            ) : (
                <EyeSlashIcon className="w-5 h-5" />
            )}
        </button>
    );
}
