import { ChevronRightIcon, StarIcon } from "@heroicons/react/24/solid";
import { ShoppingListSummaryInterface } from "../../api/interfaces/shopping/ShoppingListInterface";

interface ShoppingListCardProps {
    list: ShoppingListSummaryInterface;
    isActive: boolean;
    isOffline: boolean;
    onClick: () => void;
}

function defaultBadge(list: ShoppingListSummaryInterface): string {
    if (list.type === "SHARED") return `Partagée · ${list.memberCount}`;
    return "Perso";
}

export default function ShoppingListCard({ list, isActive, isOffline, onClick }: ShoppingListCardProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="w-full bg-secondary border border-border-color rounded-2xl p-4 flex items-center gap-3 hover:bg-primary transition-colors text-left"
        >
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    {isActive && (
                        <StarIcon
                            className="w-4 h-4 text-cout-yellow flex-shrink-0"
                            aria-label="Liste active"
                        />
                    )}
                    <h2 className="text-base font-semibold text-text-primary truncate">
                        {list.name}
                    </h2>
                </div>
                <div className="flex items-center gap-2">
                    <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-cout-purple/10 text-cout-purple">
                        {defaultBadge(list)}
                    </span>
                    {isOffline && (
                        <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-cancel-1/10 text-cancel-1">
                            Hors ligne
                        </span>
                    )}
                </div>
            </div>
            <ChevronRightIcon className="w-5 h-5 text-text-secondary flex-shrink-0" />
        </button>
    );
}
