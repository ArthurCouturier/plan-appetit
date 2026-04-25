import { SparklesIcon } from "@heroicons/react/24/outline";

interface SurpriseConfirmModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function SurpriseConfirmModal({ isOpen, onConfirm, onCancel }: SurpriseConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div className="bg-primary border border-border-color rounded-2xl shadow-xl max-w-md w-full p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-cout-yellow/20 flex items-center justify-center">
                        <SparklesIcon className="w-6 h-6 text-cout-yellow" />
                    </div>
                    <h3 className="text-lg font-bold text-text-primary">Surprends-moi</h3>
                </div>

                <p className="text-text-secondary text-sm mb-6 leading-relaxed">
                    Surprends-moi laisse carte blanche à l'IA. Tu es sûr ?
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-5 py-3 bg-secondary border border-border-color text-text-primary font-semibold rounded-xl hover:bg-secondary/80 transition"
                    >
                        Non, je préfère choisir
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-5 py-3 bg-cout-yellow text-cout-purple font-bold rounded-xl hover:brightness-110 transition shadow-lg"
                    >
                        Oui, surprends-moi
                    </button>
                </div>
            </div>
        </div>
    );
}
