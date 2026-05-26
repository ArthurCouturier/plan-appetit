import { useState } from "react";
import Modal from "../modals/Modal";
import { lightHaptic } from "../../haptics/light";

const MAX_LENGTH = 150;

interface MealPhotoConfirmModalProps {
    initialText: string;
    onCancel: () => void;
    onConfirm: (text: string) => void;
}

export default function MealPhotoConfirmModal({
    initialText,
    onCancel,
    onConfirm,
}: MealPhotoConfirmModalProps) {
    const [text, setText] = useState(initialText);
    const trimmed = text.trim();

    return (
        <Modal isOpen onClose={onCancel} title="C'est bien ça ?" size="sm">
            <div>
                <p className="text-sm text-text-secondary mb-3">
                    On a identifié ton plat. Modifie le texte si besoin, puis confirme.
                </p>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    maxLength={MAX_LENGTH}
                    rows={3}
                    placeholder="Décris ton plat..."
                    className="w-full px-4 py-3 bg-secondary border border-border-color rounded-xl text-text-primary placeholder-text-secondary focus:outline-none focus:border-cout-yellow text-base resize-none leading-snug transition-colors"
                />
                <div className="text-xs text-text-secondary text-right mt-1">
                    {text.length} / {MAX_LENGTH}
                </div>
                <div className="flex gap-2 mt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-4 py-3 rounded-full bg-secondary border border-border-color text-text-primary font-semibold"
                    >
                        Annuler
                    </button>
                    <button
                        type="button"
                        onClick={() => { onConfirm(trimmed); lightHaptic(); }}
                        disabled={trimmed.length === 0}
                        className="flex-1 px-4 py-3 rounded-full bg-cout-yellow text-cout-purple font-bold disabled:opacity-50"
                    >
                        Confirmer
                    </button>
                </div>
            </div>
        </Modal>
    );
}
