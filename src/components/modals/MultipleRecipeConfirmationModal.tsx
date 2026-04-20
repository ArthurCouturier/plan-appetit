import { Dialog, DialogHeader, DialogBody, DialogFooter } from "@material-tailwind/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface MultipleRecipeConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  recipeCount: number;
  remainingCredits: number;
}

export default function MultipleRecipeConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  recipeCount,
  remainingCredits
}: MultipleRecipeConfirmationModalProps) {
  const creditsAfter = remainingCredits - recipeCount;
  const isSubscriber = remainingCredits === -1; // -1 signifie abonné premium

  return (
    <Dialog
      open={isOpen}
      handler={onClose}
      size="sm"
      className="bg-primary"
      placeholder={undefined}
      onPointerEnterCapture={undefined}
      onPointerLeaveCapture={undefined}
    >
      <DialogHeader
        className="text-text-primary border-b border-border-color flex items-center gap-3"
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
      >
        <ExclamationTriangleIcon className="w-6 h-6 text-cout-yellow" />
        Génération multiple
      </DialogHeader>

      <DialogBody
        className="space-y-4 p-6"
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
      >
        <p className="text-text-primary text-base">
          Vous êtes sur le point de générer <span className="font-bold text-cout-base">{recipeCount} recettes</span>.
        </p>

        {!isSubscriber ? (
          <>
            <div className="bg-cout-purple/10 border border-cout-purple/30 rounded-lg p-4">
              <p className="text-text-primary text-sm mb-2">
                Cette génération consommera <span className="font-bold text-cout-base">{recipeCount} crédit{recipeCount > 1 ? 's' : ''}</span>.
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Solde actuel :</span>
                <span className="font-semibold text-text-primary">{remainingCredits} crédit{remainingCredits > 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1 pt-2 border-t border-border-color">
                <span className="text-text-secondary">Solde après génération :</span>
                <span className={`font-bold ${creditsAfter >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {creditsAfter} crédit{creditsAfter > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {creditsAfter < 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm font-semibold">
                  ⚠️ Crédits insuffisants pour cette génération
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="bg-gradient-to-r from-cout-base/10 to-cout-purple/10 border border-cout-base/30 rounded-lg p-4">
            <p className="text-text-primary text-sm">
              ✨ En tant qu'abonné <span className="font-bold text-cout-base">Premium</span>, vous bénéficiez de générations illimitées !
            </p>
          </div>
        )}

        <p className="text-text-secondary text-sm">
          Voulez-vous continuer ?
        </p>
      </DialogBody>

      <DialogFooter
        className="border-t border-border-color gap-3"
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
      >
        <button
          onClick={onClose}
          className="px-6 py-2.5 bg-secondary border border-border-color text-text-primary rounded-lg hover:bg-secondary/80 transition-colors"
        >
          Annuler
        </button>
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          disabled={!isSubscriber && creditsAfter < 0}
          className="px-6 py-2.5 bg-cout-yellow text-cout-purple font-bold rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Confirmer
        </button>
      </DialogFooter>
    </Dialog>
  );
}
