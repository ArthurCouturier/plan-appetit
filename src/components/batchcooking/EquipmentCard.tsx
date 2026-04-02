import { lightHaptic } from "../../haptics/light";

interface EquipmentCardProps {
    name: string;
    icon: string;
    selected: boolean;
    onToggle: () => void;
}

export default function EquipmentCard({ name, icon, selected, onToggle }: EquipmentCardProps) {
    return (
        <button
            onClick={() => { onToggle(); lightHaptic(); }}
            className={`flex flex-col items-center justify-between gap-1.5 p-2.5 rounded-xl aspect-square transition-all duration-200 ${selected
                ? "bg-cout-yellow/20 border-2 border-cout-yellow shadow-sm"
                : "bg-secondary border border-border-color hover:border-cout-base"
                }`}
        >
            <span className="text-xs font-semibold text-text-primary text-center leading-tight line-clamp-2">
                {name}
            </span>
            <img
                src={icon}
                alt={name}
                className="w-full flex-1 min-h-0 object-contain"
                style={{ filter: selected ? "none" : "opacity(0.5)" }}
                draggable={false}
            />
        </button>
    );
}
