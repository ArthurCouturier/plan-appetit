import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowsUpDownIcon } from "@heroicons/react/24/outline";
import { CheckIcon } from "@heroicons/react/24/solid";
import RecipeSummaryInterface from "../../api/interfaces/recipes/RecipeSummaryInterface";

export type RecipeSortOption = "custom" | "date-asc" | "date-desc" | "name-asc" | "name-desc";

const SORT_OPTIONS: { value: RecipeSortOption; label: string }[] = [
    { value: "custom", label: "Personnalis\u00e9" },
    { value: "date-desc", label: "Date de cr\u00e9ation \u2193" },
    { value: "date-asc", label: "Date de cr\u00e9ation \u2191" },
    { value: "name-asc", label: "Nom A \u2192 Z" },
    { value: "name-desc", label: "Nom Z \u2192 A" },
];

const STORAGE_KEY = "recipeSortPreferences";

export function getInitialSort(collectionUuid: string): RecipeSortOption {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const prefs = JSON.parse(stored);
            return prefs[collectionUuid] || "custom";
        }
    } catch { /* ignore */ }
    return "custom";
}

function saveSort(collectionUuid: string, sort: RecipeSortOption) {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const prefs = stored ? JSON.parse(stored) : {};
        prefs[collectionUuid] = sort;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch { /* ignore */ }
}

export function sortRecipes(recipes: RecipeSummaryInterface[], sortOption: RecipeSortOption): RecipeSummaryInterface[] {
    if (sortOption === "custom") return recipes;

    const sorted = [...recipes];
    switch (sortOption) {
        case "date-asc":
            return sorted.sort((a, b) => {
                if (!a.creationDate || !b.creationDate) return 0;
                return new Date(a.creationDate).getTime() - new Date(b.creationDate).getTime();
            });
        case "date-desc":
            return sorted.sort((a, b) => {
                if (!a.creationDate || !b.creationDate) return 0;
                return new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime();
            });
        case "name-asc":
            return sorted.sort((a, b) => a.name.localeCompare(b.name, "fr"));
        case "name-desc":
            return sorted.sort((a, b) => b.name.localeCompare(a.name, "fr"));
        default:
            return recipes;
    }
}

type RecipeSortSelectProps = {
    collectionUuid: string;
    currentSort: RecipeSortOption;
    onSortChange: (sort: RecipeSortOption) => void;
};

export default function RecipeSortSelect({ collectionUuid, currentSort, onSortChange }: RecipeSortSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
    const buttonRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    const handleToggle = useCallback(() => {
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const popoverHeight = SORT_OPTIONS.length * 44 + 16;
            const shouldOpenUp = spaceBelow < popoverHeight;

            setPopoverStyle({
                position: "fixed",
                left: "5px",
                ...(shouldOpenUp
                    ? { bottom: `${window.innerHeight - rect.top + 8}px` }
                    : { top: `${rect.bottom + 8}px` }
                ),
            });
        }
        setIsOpen(prev => !prev);
    }, [isOpen]);

    const handleSelect = (sort: RecipeSortOption) => {
        onSortChange(sort);
        saveSort(collectionUuid, sort);
        setIsOpen(false);
    };

    useEffect(() => {
        if (!isOpen) return;

        const close = () => setIsOpen(false);

        const handleClickOutside = (e: MouseEvent | TouchEvent) => {
            const target = e.target as Node;
            if (
                popoverRef.current && !popoverRef.current.contains(target) &&
                buttonRef.current && !buttonRef.current.contains(target)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);
        window.addEventListener("scroll", close, true);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
            window.removeEventListener("scroll", close, true);
        };
    }, [isOpen]);

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={handleToggle}
                className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                title="Trier les recettes"
            >
                <ArrowsUpDownIcon className="w-5 h-5 text-cout-base" />
            </button>

            {isOpen && (
                <div
                    ref={popoverRef}
                    style={popoverStyle}
                    className="z-50 w-56 bg-primary border border-border-color rounded-xl shadow-lg overflow-hidden"
                >
                    {SORT_OPTIONS.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => handleSelect(option.value)}
                            className={`w-full px-4 py-3 text-left text-sm flex items-center justify-between transition-colors ${
                                currentSort === option.value
                                    ? "bg-cout-base/10 text-cout-base font-medium"
                                    : "text-text-primary hover:bg-secondary"
                            }`}
                        >
                            {option.label}
                            {currentSort === option.value && (
                                <CheckIcon className="w-4 h-4 text-cout-base flex-shrink-0" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
