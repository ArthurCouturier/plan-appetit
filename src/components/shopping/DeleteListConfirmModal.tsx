import Modal from "../modals/Modal";
import { lightHaptic } from "../../haptics/light";

interface DeleteListConfirmModalProps {
    listName: string;
    isPending: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function DeleteListConfirmModal({
    listName,
    isPending,
    onConfirm,
    onCancel,
}: DeleteListConfirmModalProps) {
    return (
        <Modal isOpen onClose={onCancel} title="Supprimer la liste" size="sm">
            <div className="p-6 flex flex-col gap-4">
                <p className="text-sm text-text-primary leading-relaxed">
                    Tu es sur le point de supprimer <strong>{listName}</strong>.
                </p>
                <p className="text-sm text-text-secondary leading-relaxed">
                    Tous les articles seront perdus. Cette action est irréversible.
                </p>
                <div className="flex flex-col gap-2 pt-2">
                    <button
                        type="button"
                        onClick={() => { lightHaptic(); onConfirm(); }}
                        disabled={isPending}
                        className="w-full px-5 py-3 rounded-full bg-cancel-1 text-white font-bold disabled:opacity-50"
                    >
                        {isPending ? "Suppression..." : "Supprimer définitivement"}
                    </button>
                    <button
                        type="button"
                        onClick={() => { lightHaptic(); onCancel(); }}
                        disabled={isPending}
                        className="w-full px-5 py-3 rounded-full bg-secondary border border-border-color text-text-primary font-semibold disabled:opacity-50"
                    >
                        Annuler
                    </button>
                </div>
            </div>
        </Modal>
    );
}
