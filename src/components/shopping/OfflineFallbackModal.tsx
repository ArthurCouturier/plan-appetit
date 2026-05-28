import Modal from "../modals/Modal";
import { lightHaptic } from "../../haptics/light";

interface OfflineFallbackModalProps {
    listName: string;
    onAccept: () => void;
    onCancel: () => void;
}

export default function OfflineFallbackModal({
    listName,
    onAccept,
    onCancel,
}: OfflineFallbackModalProps) {
    return (
        <Modal isOpen onClose={onCancel} title="Pas de réseau" size="sm">
            <div className="p-6 flex flex-col gap-4">
                <p className="text-sm text-text-primary leading-relaxed">
                    Impossible de joindre le serveur pour modifier <strong>{listName}</strong>.
                </p>
                <p className="text-sm text-text-secondary leading-relaxed">
                    Tu peux passer cette liste hors ligne et continuer à l'éditer
                    localement. Tu pourras la resynchroniser plus tard en cliquant
                    sur le bouton dédié quand le réseau sera revenu.
                </p>
                <div className="flex flex-col gap-2">
                    <button
                        type="button"
                        onClick={() => { lightHaptic(); onAccept(); }}
                        className="w-full px-5 py-3 rounded-full bg-cout-yellow text-cout-purple font-bold"
                    >
                        Passer hors ligne
                    </button>
                    <button
                        type="button"
                        onClick={() => { lightHaptic(); onCancel(); }}
                        className="w-full px-5 py-3 rounded-full bg-secondary border border-border-color text-text-primary font-semibold"
                    >
                        Annuler
                    </button>
                </div>
            </div>
        </Modal>
    );
}
