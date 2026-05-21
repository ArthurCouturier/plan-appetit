import { XMarkIcon } from "@heroicons/react/24/solid";
import {
    ShoppingListItemInterface,
    shoppingListItemDisplayName,
} from "../../api/interfaces/shopping/ShoppingListInterface";
import { lightHaptic } from "../../haptics/light";

interface ShoppingItemRowProps {
    item: ShoppingListItemInterface;
    onToggle: () => void;
    onDelete: () => void;
}

export default function ShoppingItemRow({ item, onToggle, onDelete }: ShoppingItemRowProps) {
    const handleToggle = () => {
        lightHaptic();
        onToggle();
    };

    const displayName = shoppingListItemDisplayName(item);
    const hasQuantity = item.quantity != null && item.quantity > 0;

    return (
        <li
            className="bg-secondary border border-border-color rounded-xl p-3 flex items-center gap-3"
            style={{
                transform: item.checked ? "scale(0.9)" : "scale(1)",
                opacity: item.checked ? 0.6 : 1,
                transformOrigin: "left center",
                transition: "transform 200ms ease-out, opacity 200ms ease-out",
            }}
        >
            <button
                type="button"
                onClick={handleToggle}
                aria-label={item.checked ? "Décocher" : "Cocher"}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    item.checked
                        ? "bg-cout-yellow border-cout-yellow text-cout-purple"
                        : "border-border-color"
                }`}
            >
                {item.checked && (
                    <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="3 8.5 6.5 12 13 5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
            </button>

            <span className="text-xl flex-shrink-0" aria-hidden>
                {item.emoji}
            </span>

            <div className="relative flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary truncate">
                    {displayName}
                    {hasQuantity && (
                        <span className="text-text-secondary font-normal ml-2">
                            {item.quantity}
                            {item.unitCode ? ` ${item.unitCode}` : ""}
                        </span>
                    )}
                </p>
                <span
                    aria-hidden
                    className="pointer-events-none absolute left-0 top-1/2 h-[2px] bg-current text-text-primary"
                    style={{
                        width: item.checked ? "100%" : "0%",
                        transition: "width 200ms ease-out",
                    }}
                />
            </div>

            <button
                type="button"
                onClick={onDelete}
                aria-label="Supprimer"
                className="w-8 h-8 flex items-center justify-center text-text-secondary hover:text-cancel-1 transition-colors flex-shrink-0"
            >
                <XMarkIcon className="w-5 h-5" />
            </button>
        </li>
    );
}
