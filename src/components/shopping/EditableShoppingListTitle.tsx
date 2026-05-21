import { useEffect, useRef, useState } from "react";
import { CheckIcon } from "@heroicons/react/24/solid";
import { SHOPPING_LIST_NAME_MAX_LENGTH } from "../../api/interfaces/shopping/ShoppingListInterface";

interface EditableShoppingListTitleProps {
    name: string;
    onSave: (newName: string) => void;
    className?: string;
}

export default function EditableShoppingListTitle({
    name,
    onSave,
    className = "",
}: EditableShoppingListTitleProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState(name);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isEditing) setDraft(name);
    }, [name, isEditing]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const commit = () => {
        const trimmed = draft.trim();
        if (trimmed && trimmed !== name) {
            onSave(trimmed);
        }
        setIsEditing(false);
    };

    const cancel = () => {
        setDraft(name);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <input
                    ref={inputRef}
                    type="text"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            commit();
                        } else if (e.key === "Escape") {
                            cancel();
                        }
                    }}
                    onBlur={commit}
                    maxLength={SHOPPING_LIST_NAME_MAX_LENGTH}
                    className="text-2xl font-bold text-text-primary bg-secondary border-2 border-cout-base rounded-lg px-3 py-1 outline-none focus:border-cout-yellow flex-1 min-w-0"
                />
                <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={commit}
                    aria-label="Valider"
                    className="p-2 rounded-lg bg-cout-base text-white hover:bg-cout-purple transition-colors flex-shrink-0"
                >
                    <CheckIcon className="w-5 h-5" />
                </button>
            </div>
        );
    }

    return (
        <h1
            onClick={() => setIsEditing(true)}
            className={`text-2xl font-bold text-text-primary hover:text-cout-base transition-colors cursor-pointer ${className}`}
            title="Cliquer pour modifier le nom"
        >
            {name}
        </h1>
    );
}
