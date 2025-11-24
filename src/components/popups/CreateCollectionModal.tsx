import { useState } from "react";
import Modal from "./Modal";
import CollectionService from "../../api/services/CollectionService";
import SwitchField from "../fields/SwitchField";

interface CreateCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCollectionCreated?: () => void;
}

export default function CreateCollectionModal({
  isOpen,
  onClose,
  onCollectionCreated,
}: CreateCollectionModalProps) {
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Le nom de la collection est requis");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      await CollectionService.createCollection(name, isPublic);

      // Reset form
      setName("");
      setIsPublic(false);

      // Notify parent component
      if (onCollectionCreated) {
        onCollectionCreated();
      }

      // Close modal
      onClose();
    } catch (err) {
      console.error("Erreur lors de la création de la collection:", err);
      setError("Une erreur est survenue lors de la création de la collection");
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    // Reset form on close
    setName("");
    setIsPublic(false);
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Créer une collection"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <p className="text-text-secondary">
          Organisez vos recettes en créant des collections personnalisées.
        </p>

        {/* Nom de la collection */}
        <div>
          <label htmlFor="collection-name" className="block text-sm font-semibold text-text-primary mb-2">
            Nom de la collection
          </label>
          <input
            id="collection-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Mes recettes italiennes"
            className="w-full px-4 py-3 bg-secondary border border-border-color rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-cout-base focus:border-transparent transition-all duration-200"
            disabled={isCreating}
            maxLength={255}
          />
        </div>

        {/* Toggle Public/Privé */}
        <div className="flex items-center justify-between p-4 bg-secondary rounded-lg border border-border-color">
          <div>
            <p className="text-sm font-semibold text-text-primary">Collection publique</p>
            <p className="text-xs text-text-secondary mt-1">
              Les collections publiques peuvent être consultées par d'autres utilisateurs
            </p>
          </div>
          <SwitchField
            value={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            label=""
            htmlFor="collection-public"
            uncheckedColor="gray"
            checkedColor="green"
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={isCreating}
            className="flex-1 px-6 py-3 bg-secondary text-text-primary font-semibold rounded-lg hover:bg-secondary/80 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isCreating || !name.trim()}
            className="flex-1 px-6 py-3 bg-cout-base hover:bg-cout-purple text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-md"
          >
            {isCreating ? "Création..." : "Créer la collection"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
