import { Dialog, DialogHeader, DialogBody } from "@material-tailwind/react";
import { SparklesIcon, MapPinIcon } from "@heroicons/react/24/solid";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

interface RecipeGenerationChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RecipeGenerationChoiceModal({
  isOpen,
  onClose,
}: RecipeGenerationChoiceModalProps) {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSandboxChoice = () => {
    onClose();
    navigate("/recettes/generer/sandbox");
  };

  const handleLocationChoice = () => {
    onClose();
    navigate("/recettes/generer/localisation");
  };

  return (
    <Dialog
      open={isOpen}
      handler={onClose}
      size="md"
      className="bg-primary"
      placeholder={undefined}
      onPointerEnterCapture={undefined}
      onPointerLeaveCapture={undefined}
    >
      <DialogHeader
        className="text-text-primary border-b border-border-color relative"
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
      >
        Mode de génération

        {/* Croix de fermeture - Mobile uniquement */}
        {isMobile && (
          <button
            onClick={onClose}
            className="absolute top-1/2 -translate-y-1/2 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 transition-colors duration-200 shadow-lg"
            aria-label="Fermer"
          >
            <XMarkIcon className="w-5 h-5 text-white" />
          </button>
        )}
      </DialogHeader>
      <DialogBody
        className="space-y-4 p-6"
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
      >
        <p className="text-text-secondary mb-6">
          Choisissez le mode de génération qui correspond le mieux à vos besoins.
        </p>

        {/* Sandbox - Création libre */}
        <button
          onClick={handleSandboxChoice}
          className="w-full group relative overflow-hidden bg-gradient-to-br from-cout-base to-cout-purple hover:from-cout-purple hover:to-cout-base p-6 rounded-xl text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
        >
          <div className="relative z-10">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <SparklesIcon className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">
                  Création libre
                </h3>
                <div className="mt-3 flex items-center gap-2 text-cout-yellow text-xs font-semibold">
                  <SparklesIcon className="w-4 h-4" />
                  <span>Rapide et intuitif</span>
                </div>
              </div>
            </div>
          </div>
          {/* Effet de brillance au hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white/10 to-transparent transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
        </button>

        {/* Localisation */}
        <button
          onClick={handleLocationChoice}
          className="w-full group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-teal-600 hover:to-emerald-500 p-6 rounded-xl text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
        >
          <div className="relative z-10">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <MapPinIcon className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">
                  Création par localisation
                </h3>
                <div className="mt-3 flex items-center gap-2 text-emerald-100 text-xs font-semibold">
                  <MapPinIcon className="w-4 h-4" />
                  <span>Personnalisé et précis</span>
                </div>
              </div>
            </div>
          </div>
          {/* Effet de brillance au hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white/10 to-transparent transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
        </button>

        {/* Bouton Annuler - Desktop uniquement */}
        {!isMobile && (
          <div className="mt-6 pt-4 border-t border-border-color">
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-secondary text-text-primary font-semibold rounded-lg hover:bg-secondary/80 transition-all duration-200"
            >
              Annuler
            </button>
          </div>
        )}
      </DialogBody>
    </Dialog>
  );
}
