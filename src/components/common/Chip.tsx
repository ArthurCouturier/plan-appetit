import { lightHaptic } from "../../haptics/light";

interface ChipProps {
    label: string;
    emoji?: string;
    active: boolean;
    onToggle: () => void;
}

export default function Chip({ label, emoji, active, onToggle }: ChipProps) {
    return (
        <button
            onClick={() => { onToggle(); lightHaptic(); }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-x-1.5 ${
                active
                    ? "bg-cout-yellow text-cout-purple shadow-md"
                    : "bg-secondary text-text-primary border-border-color hover:border-cout-base"
            }`}
        >
            {emoji && <span>{emoji}</span>}
            <span>{label}</span>
        </button>
    );
}
