import { ClockIcon } from "@heroicons/react/24/outline";

interface ResumeDraftModalProps {
    isOpen: boolean;
    seedPreview: string;
    onResume: () => void;
    onDiscard: () => void;
}

export default function ResumeDraftModal({ isOpen, seedPreview, onResume, onDiscard }: ResumeDraftModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div className="bg-primary border border-border-color rounded-2xl shadow-xl max-w-md w-full p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-cout-base/20 flex items-center justify-center">
                        <ClockIcon className="w-6 h-6 text-cout-base" />
                    </div>
                    <h3 className="text-lg font-bold text-text-primary">Reprendre où tu en étais ?</h3>
                </div>

                <p className="text-text-secondary text-sm mb-2">
                    Tu avais commencé une recette avec :
                </p>
                <div className="bg-secondary border border-border-color rounded-xl px-4 py-3 mb-6 text-text-primary text-sm italic">
                    « {seedPreview} »
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                    <button
                        onClick={onDiscard}
                        className="px-5 py-3 bg-secondary border border-border-color text-text-primary font-semibold rounded-xl hover:bg-secondary/80 transition"
                    >
                        Recommencer
                    </button>
                    <button
                        onClick={onResume}
                        className="px-5 py-3 bg-cout-yellow text-cout-purple font-bold rounded-xl hover:brightness-110 transition shadow-lg"
                    >
                        Reprendre
                    </button>
                </div>
            </div>
        </div>
    );
}
