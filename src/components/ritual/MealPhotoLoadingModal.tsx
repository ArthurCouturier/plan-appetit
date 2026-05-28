import Modal from "../modals/Modal";

export default function MealPhotoLoadingModal() {
    return (
        <Modal isOpen onClose={() => {}} title="Analyse de ton plat" size="sm" showCloseButton={false}>
            <div className="flex flex-col items-center justify-center py-6 gap-3">
                <div className="w-10 h-10 border-4 border-cout-yellow border-t-transparent rounded-full animate-spin" />
                <p className="text-text-secondary text-sm text-center">
                    On regarde ce que tu as mangé…
                </p>
            </div>
        </Modal>
    );
}
