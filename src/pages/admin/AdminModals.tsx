import { useState, useEffect, useRef, useCallback } from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../../api/hooks/useAuth";
import { hasRoleLevel, UserRole } from "../../api/interfaces/users/UserInterface";

import Modal from "../../components/modals/Modal";
import ConfirmationPopUp from "../../components/modals/ConfirmationPopUp";
import CreditPaywallModal from "../../components/modals/CreditPaywallModal";
import DailyRecipeModal from "../../components/modals/DailyRecipeModal";
import RecipeGenerationLoadingModal from "../../components/modals/RecipeGenerationLoadingModal";
import MultipleRecipeConfirmationModal from "../../components/modals/MultipleRecipeConfirmationModal";
import CreateCollectionModal from "../../components/modals/CreateCollectionModal";
import ExportDataModal from "../../components/modals/ExportDataModal";
import DeleteAccountModal from "../../components/modals/DeleteAccountModal";
import LinkCopiedPopup from "../../components/modals/LinkCopiedPopup";
import UpdateAppModal from "../../components/modals/UpdateAppModal";

interface ModalEntry {
    id: string;
    name: string;
    render: (isOpen: boolean, onClose: () => void) => React.ReactNode;
}

export default function AdminModals() {
    const { user } = useAuth();
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [duration, setDuration] = useState(10);
    const [countdown, setCountdown] = useState<number | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    if (!user || !hasRoleLevel(user.role, UserRole.ADMIN)) {
        return <Navigate to="/" replace />;
    }

    const closeModal = useCallback(() => {
        setActiveModal(null);
        setCountdown(null);
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const openModal = (id: string) => {
        closeModal();
        setActiveModal(id);
        if (duration > 0) {
            setCountdown(duration);
        }
    };

    useEffect(() => {
        if (countdown === null || countdown <= 0) {
            if (countdown === 0) closeModal();
            return;
        }

        timerRef.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev === null || prev <= 1) {
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [countdown, closeModal]);

    const modals: ModalEntry[] = [
        {
            id: "modal-base",
            name: "Modal (base)",
            render: (isOpen, onClose) => (
                <Modal isOpen={isOpen} onClose={onClose} title="Modal de base">
                    <p className="text-text-secondary">Contenu de la modale de base.</p>
                </Modal>
            ),
        },
        {
            id: "confirmation",
            name: "ConfirmationPopUp",
            render: (isOpen, onClose) => (
                <ConfirmationPopUp
                    isOpen={isOpen}
                    title="Confirmer l'action"
                    message="Etes-vous sur de vouloir continuer ?"
                    onConfirm={onClose}
                    onCancel={onClose}
                />
            ),
        },
        {
            id: "credit-paywall",
            name: "CreditPaywallModal",
            render: (_isOpen, onClose) =>
                _isOpen ? <CreditPaywallModal onClose={onClose} /> : null,
        },
        {
            id: "daily-recipe",
            name: "DailyRecipeModal",
            render: (isOpen, onClose) => (
                <DailyRecipeModal isOpen={isOpen} onClose={onClose} />
            ),
        },
        {
            id: "recipe-loading",
            name: "RecipeGenerationLoadingModal",
            render: (isOpen) => (
                <RecipeGenerationLoadingModal isOpen={isOpen} />
            ),
        },
        {
            id: "multiple-recipe",
            name: "MultipleRecipeConfirmationModal",
            render: (isOpen, onClose) => (
                <MultipleRecipeConfirmationModal
                    isOpen={isOpen}
                    onClose={onClose}
                    onConfirm={onClose}
                    recipeCount={3}
                    remainingCredits={5}
                />
            ),
        },
        {
            id: "create-collection",
            name: "CreateCollectionModal",
            render: (isOpen, onClose) => (
                <CreateCollectionModal isOpen={isOpen} onClose={onClose} />
            ),
        },
        {
            id: "export-data",
            name: "ExportDataModal",
            render: (isOpen, onClose) => (
                <ExportDataModal
                    isOpen={isOpen}
                    onClose={onClose}
                    userEmail={user?.email || "test@example.com"}
                />
            ),
        },
        {
            id: "delete-account",
            name: "DeleteAccountModal",
            render: (isOpen, onClose) => (
                <DeleteAccountModal
                    isOpen={isOpen}
                    onClose={onClose}
                    onDeleted={() => onClose()}
                    hasActiveSubscription={false}
                />
            ),
        },
        {
            id: "link-copied",
            name: "LinkCopiedPopup",
            render: (isOpen) =>
                isOpen ? <LinkCopiedPopup position={{ x: window.innerWidth / 2, y: window.innerHeight / 2 }} /> : null,
        },
        {
            id: "update-recommended",
            name: "UpdateAppModal (recommande)",
            render: (isOpen, onClose) => (
                <UpdateAppModal
                    isOpen={isOpen}
                    onClose={onClose}
                    status="update_recommended"
                    latestVersion="2.0.0"
                    storeUrl="https://apps.apple.com/app/plan-app%C3%A9tit/id6756276676"
                />
            ),
        },
        {
            id: "update-required",
            name: "UpdateAppModal (force)",
            render: (isOpen, onClose) => (
                <UpdateAppModal
                    isOpen={isOpen}
                    onClose={onClose}
                    status="update_required"
                    latestVersion="2.0.0"
                    storeUrl="https://apps.apple.com/app/plan-app%C3%A9tit/id6756276676"
                />
            ),
        },
    ];

    return (
        <div className="max-w-3xl mx-auto px-4 py-20 space-y-6">
            <div className="bg-primary rounded-xl p-6 shadow-md border border-border-color">
                <h2 className="text-lg font-bold text-text-primary mb-4">Preview des modales</h2>

                {/* Slider */}
                <div className="mb-6 p-4 bg-secondary rounded-lg border border-border-color">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-semibold text-text-primary">
                            Fermeture automatique
                        </label>
                        <span className="text-sm font-mono text-text-secondary">
                            {duration === 0 ? "Desactive" : `${duration}s`}
                        </span>
                    </div>
                    <input
                        type="range"
                        min={0}
                        max={30}
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="w-full accent-cout-base"
                    />
                    <div className="flex justify-between text-xs text-text-secondary mt-1">
                        <span>Off</span>
                        <span>15s</span>
                        <span>30s</span>
                    </div>
                </div>

                {/* Countdown */}
                {countdown !== null && countdown > 0 && (
                    <div className="mb-4 px-4 py-2 bg-cout-base/10 border border-cout-base/30 rounded-lg text-center">
                        <span className="text-sm font-semibold text-cout-base">
                            Fermeture dans {countdown}s
                        </span>
                    </div>
                )}

                {/* Modal buttons */}
                <div className="space-y-2">
                    {modals.map((modal) => (
                        <button
                            key={modal.id}
                            onClick={() => openModal(modal.id)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-colors ${activeModal === modal.id
                                ? "bg-cout-base/10 border-cout-base text-cout-base"
                                : "bg-secondary border-border-color hover:bg-tertiary text-text-primary"
                                }`}
                        >
                            <span className="font-medium text-sm">{modal.name}</span>
                            <span className="text-text-secondary">&rsaquo;</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Render active modal */}
            {modals.map((modal) =>
                <div key={modal.id}>
                    {modal.render(activeModal === modal.id, closeModal)}
                </div>
            )}
        </div>
    );
}
