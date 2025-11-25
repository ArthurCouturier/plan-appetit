import { useState, useRef, useEffect } from "react";
import { FolderIcon, CheckIcon } from "@heroicons/react/24/solid";
import CollectionService from "../../api/services/CollectionService";

type EditableCollectionTitleProps = {
    collectionUuid: string;
    name: string;
    onNameChange: (newName: string) => void;
};

export default function EditableCollectionTitle({
    collectionUuid,
    name,
    onNameChange,
}: EditableCollectionTitleProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(name);
    const [isSaving, setIsSaving] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleStartEditing = () => {
        setEditedName(name);
        setIsEditing(true);
    };

    const handleSave = async () => {
        const trimmedName = editedName.trim();

        if (!trimmedName || trimmedName === name) {
            setIsEditing(false);
            setEditedName(name);
            return;
        }

        setIsSaving(true);
        setIsEditing(false);
        onNameChange(trimmedName);

        try {
            await CollectionService.updateCollection(collectionUuid, { name: trimmedName });
        } catch (error) {
            console.error("Erreur lors de la mise à jour du nom:", error);
            onNameChange(name);
        } finally {
            setIsSaving(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSave();
        } else if (e.key === "Escape") {
            setIsEditing(false);
            setEditedName(name);
        }
    };

    const handleBlur = () => {
        if (!isSaving) {
            setIsEditing(false);
            setEditedName(name);
        }
    };

    if (isEditing) {
        return (
            <div className="flex items-center gap-3">
                <FolderIcon className="w-10 h-10 text-cout-base flex-shrink-0" />
                <div className="flex items-center gap-2 flex-1">
                    <input
                        ref={inputRef}
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={handleBlur}
                        disabled={isSaving}
                        className="text-2xl font-bold text-text-primary bg-secondary border-2 border-cout-base rounded-lg px-3 py-1 outline-none focus:border-cout-yellow transition-colors flex-1 min-w-0"
                    />
                    <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={handleSave}
                        disabled={isSaving || !editedName.trim()}
                        className="p-2 rounded-lg bg-cout-base text-white hover:bg-cout-purple transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    >
                        <CheckIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-4 mb-2">
            <FolderIcon className="w-10 h-10 text-cout-base" />
            <h1
                onClick={handleStartEditing}
                className="text-2xl font-bold text-text-primary hover:text-cout-base transition-colors cursor-pointer"
                title="Cliquer pour modifier le nom"
            >
                {name}
            </h1>
        </div>
    );
}
