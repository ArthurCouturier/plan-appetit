import { useEffect } from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { Browser } from "@capacitor/browser";
import PlatformService from "../../api/services/PlatformService";
import { UpdateStatus } from "../../api/services/AppVersionService";

interface UpdateAppModalProps {
    isOpen: boolean;
    onClose: () => void;
    status: UpdateStatus;
    latestVersion: string;
    storeUrl: string;
}

export default function UpdateAppModal({ isOpen, onClose, status, latestVersion, storeUrl }: UpdateAppModalProps) {
    const isRequired = status === "update_required";

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
            document.documentElement.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
            document.documentElement.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
            document.documentElement.style.overflow = "";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleUpdate = async () => {
        if (PlatformService.isNative()) {
            await Browser.open({ url: storeUrl });
        } else {
            window.open(storeUrl, "_blank");
        }
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isRequired && e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overscroll-contain"
            onClick={handleBackdropClick}
            onTouchMove={(e) => e.preventDefault()}
        >
            <div
                className="bg-primary rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col items-center text-center p-8 gap-4">
                    <div className="w-16 h-16 rounded-full bg-cout-base/10 flex items-center justify-center">
                        <ArrowDownTrayIcon className="w-8 h-8 text-cout-base" />
                    </div>

                    <h2 className="text-xl font-bold text-text-primary">
                        {isRequired
                            ? "Mise à jour requise"
                            : "Nouvelle version disponible"
                        }
                    </h2>

                    <p className="text-text-secondary text-sm leading-relaxed">
                        {isRequired
                            ? `La version ${latestVersion} est nécessaire pour continuer à utiliser Plan'Appétit. Veuillez mettre à jour l'application.`
                            : `La version ${latestVersion} est disponible avec des améliorations et corrections. Mettez à jour pour en profiter!`
                        }
                    </p>

                    <div className="flex flex-col w-full gap-3 mt-2">
                        <button
                            onClick={handleUpdate}
                            className="w-full py-3 bg-cout-base text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
                        >
                            Mettre à jour
                        </button>

                        {!isRequired && (
                            <button
                                onClick={onClose}
                                className="w-full py-3 text-text-secondary font-medium rounded-xl hover:bg-secondary transition-colors"
                            >
                                Plus tard
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
