import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { XMarkIcon, CameraIcon, TrashIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import useAuth from "../../api/hooks/useAuth";
import UserProfileService from "../../api/services/UserProfileService";
import {
    MyProfileInterface,
    ProfileErrorCode,
} from "../../api/interfaces/users/MyProfileInterface";
import {
    resizeProfileImage,
    ImageTooLargeError,
    UnsupportedImageError,
} from "../../utils/resizeProfileImage";

interface EditProfileModalProps {
    onClose: () => void;
    onSaved: (profile: MyProfileInterface) => void;
}

const ERROR_MESSAGES: Record<ProfileErrorCode, string> = {
    DISPLAY_NAME_TOO_SHORT: "Le nom doit faire au moins 1 caractère.",
    DISPLAY_NAME_TOO_LONG: "Le nom est trop long (max 50 caractères).",
    PHOTO_TOO_LARGE: "Photo trop volumineuse, choisis une autre image.",
    INVALID_MIME_TYPE: "Format non supporté (jpeg/png/webp uniquement).",
    INVALID_BASE64: "Données d'image invalides.",
    UNAUTHORIZED: "Connexion expirée, reconnecte-toi.",
    INTERNAL_ERROR: "Erreur serveur, réessaie plus tard.",
};

export default function EditProfileModal({ onClose, onSaved }: EditProfileModalProps) {
    const { user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [displayName, setDisplayName] = useState(user?.displayName ?? "");
    const [previewUrl, setPreviewUrl] = useState<string | null>(user?.profilePhoto ?? null);
    const [pendingPhoto, setPendingPhoto] = useState<{ base64: string; mime: "image/jpeg" } | null>(null);
    const [shouldDeletePhoto, setShouldDeletePhoto] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "unset";
        };
    }, []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setError(null);
        try {
            const resized = await resizeProfileImage(file);
            setPendingPhoto({ base64: resized.base64, mime: resized.mimeType });
            setPreviewUrl(`data:${resized.mimeType};base64,${resized.base64}`);
            setShouldDeletePhoto(false);
        } catch (err) {
            if (err instanceof ImageTooLargeError) setError("Image trop lourde (max 8 Mo).");
            else if (err instanceof UnsupportedImageError) setError("Format d'image non supporté.");
            else setError("Erreur lors du chargement de l'image.");
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleDeletePhoto = () => {
        setPendingPhoto(null);
        setPreviewUrl(null);
        setShouldDeletePhoto(true);
    };

    const handleSave = async () => {
        const email = localStorage.getItem("email");
        const token = localStorage.getItem("firebaseIdToken");
        if (!email || !token) {
            setError("Connexion expirée, reconnecte-toi.");
            return;
        }

        const trimmed = displayName.trim();
        if (!trimmed) {
            setError("Le nom ne peut pas être vide.");
            return;
        }

        setSaving(true);
        setError(null);
        try {
            let profile: MyProfileInterface | null = null;

            if (shouldDeletePhoto) {
                profile = await UserProfileService.deleteProfilePhoto(email, token);
            }

            const response = await UserProfileService.updateProfile(email, token, {
                displayName: trimmed,
                profilePhotoBase64: pendingPhoto?.base64,
                profilePhotoMimeType: pendingPhoto?.mime,
            });
            if (!response.success) {
                setError(
                    response.errorCode
                        ? ERROR_MESSAGES[response.errorCode] ?? "Erreur"
                        : response.message ?? "Erreur",
                );
                return;
            }
            profile = response.profile ?? profile;

            if (!profile) {
                onClose();
                return;
            }
            onSaved(profile);
            onClose();
        } catch (err) {
            console.error("Profile update failed", err);
            setError("Erreur réseau, réessaie.");
        } finally {
            setSaving(false);
        }
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    return createPortal(
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            style={{
                padding: `calc(env(safe-area-inset-top, 0px) + 16px) 16px calc(env(safe-area-inset-bottom, 0px) + 16px)`,
            }}
            onClick={handleBackdropClick}
        >
            <div
                className="w-full max-w-[440px] rounded-xl bg-primary border border-border-color shadow-2xl"
                style={{ maxHeight: "100%", overflowY: "auto" }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 pt-5 pb-2">
                    <h3 className="text-lg font-bold text-text-primary">Modifier mon profil</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-secondary text-text-secondary"
                        aria-label="Fermer"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="px-6 pb-6 space-y-5">
                    <div className="flex flex-col items-center gap-3">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            aria-label="Changer ma photo"
                            className="relative w-24 h-24 rounded-full bg-secondary border-2 border-cout-base overflow-hidden flex items-center justify-center group cursor-pointer"
                        >
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <UserCircleIcon className="w-16 h-16 text-cout-base" />
                            )}
                            <span className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                                <CameraIcon className="w-6 h-6 text-white" />
                            </span>
                        </button>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-cout-yellow text-cout-purple font-bold"
                            >
                                <CameraIcon className="w-4 h-4" />
                                Changer
                            </button>
                            {previewUrl && (
                                <button
                                    type="button"
                                    onClick={handleDeletePhoto}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-secondary border border-border-color text-red-600"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                    Retirer
                                </button>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-text-primary mb-1">
                            Nom affiché
                        </label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            maxLength={50}
                            className="w-full px-3 py-2 rounded-lg bg-secondary border border-border-color text-text-primary focus:outline-none focus:border-cout-purple"
                            placeholder="Ton nom"
                        />
                        <div className="text-xs text-text-secondary mt-1">
                            {displayName.length}/50
                        </div>
                    </div>

                    {error && <div className="text-sm text-red-600">{error}</div>}

                    <div className="flex gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="flex-1 px-4 py-2 rounded-lg bg-secondary border border-border-color text-text-primary font-semibold disabled:opacity-50"
                        >
                            Annuler
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                            className="flex-1 px-4 py-2 rounded-lg bg-cout-yellow text-cout-purple font-bold disabled:opacity-50"
                        >
                            {saving ? "Enregistrement…" : "Enregistrer"}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body,
    );
}
