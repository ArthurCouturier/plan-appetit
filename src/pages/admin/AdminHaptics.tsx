import { useState } from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../../api/hooks/useAuth";
import { hasRoleLevel, UserRole } from "../../api/interfaces/users/UserInterface";
import PlatformService from "../../api/services/PlatformService";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import RecipeGenerationLoadingModal from "../../components/popups/RecipeGenerationLoadingModal";
import { fireworkHaptic } from "../../haptics/firework";

const IMPACT_STYLES = [
  { label: "Light", style: "light" as const },
  { label: "Medium", style: "medium" as const },
  { label: "Heavy", style: "heavy" as const },
];

const NOTIFICATION_TYPES = [
  { label: "Success", type: "success" as const },
  { label: "Warning", type: "warning" as const },
  { label: "Error", type: "error" as const },
];

const VIBRATE_DURATIONS = [50, 100, 200, 500, 1000];

export default function AdminHaptics() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const isNative = PlatformService.isNative();

  if (!user || !hasRoleLevel(user.role, UserRole.ADMIN)) {
    return <Navigate to="/" replace />;
  }

  const triggerAction = (label: string, action: () => Promise<void>) => {
    action();
    setLastAction(label);
  };

  const openModalFor10s = () => {
    setShowModal(true);
    setTimeout(() => setShowModal(false), 10000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-20 space-y-6">
      <div className="bg-primary rounded-xl p-6 shadow-md border border-border-color">
        <h2 className="text-lg font-bold text-text-primary mb-2">Test Haptics</h2>
        <p className="text-sm text-text-secondary mb-6">
          {isNative ? "Plateforme native detectee" : "Web detecte - les vibrations ne fonctionneront pas"}
        </p>

        {lastAction && (
          <div className="bg-cout-purple/10 border border-cout-purple/20 rounded-lg p-3 mb-6">
            <p className="text-sm text-cout-purple font-medium">Dernier : {lastAction}</p>
          </div>
        )}

        {/* Impact */}
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">Impact</h3>
        <div className="flex gap-3 mb-6">
          {IMPACT_STYLES.map(({ label, style }) => (
            <button
              key={style}
              onClick={() => triggerAction(`Impact ${label}`, () => PlatformService.hapticFeedback(style))}
              className="flex-1 py-3 bg-secondary border border-border-color rounded-lg hover:bg-tertiary transition-colors text-sm font-medium text-text-primary"
            >
              {label}
            </button>
          ))}
        </div>

        {/* Notification */}
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">Notification</h3>
        <div className="flex gap-3 mb-6">
          {NOTIFICATION_TYPES.map(({ label, type }) => (
            <button
              key={type}
              onClick={() => triggerAction(`Notification ${label}`, () => PlatformService.hapticNotification(type))}
              className="flex-1 py-3 bg-secondary border border-border-color rounded-lg hover:bg-tertiary transition-colors text-sm font-medium text-text-primary"
            >
              {label}
            </button>
          ))}
        </div>

        {/* Vibrate */}
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">Vibrate</h3>
        <div className="flex gap-3 mb-6 flex-wrap">
          {VIBRATE_DURATIONS.map((ms) => (
            <button
              key={ms}
              onClick={() => triggerAction(`Vibrate ${ms}ms`, () => Haptics.vibrate({ duration: ms }))}
              className="py-3 px-4 bg-secondary border border-border-color rounded-lg hover:bg-tertiary transition-colors text-sm font-medium text-text-primary"
            >
              {ms}ms
            </button>
          ))}
        </div>

        {/* Patterns */}
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">Patterns</h3>
        <div className="space-y-3 mb-6">
          <button
            onClick={() => triggerAction("Pattern: 3 taps rapides", async () => {
              for (let i = 0; i < 3; i++) {
                await Haptics.impact({ style: ImpactStyle.Light });
                await new Promise(r => setTimeout(r, 80));
              }
            })}
            className="w-full py-3 bg-secondary border border-border-color rounded-lg hover:bg-tertiary transition-colors text-sm font-medium text-text-primary"
          >
            3 taps rapides (light)
          </button>
          <button
            onClick={() => triggerAction("Pattern: 3 taps heavy", async () => {
              for (let i = 0; i < 3; i++) {
                await Haptics.impact({ style: ImpactStyle.Heavy });
                await new Promise(r => setTimeout(r, 100));
              }
            })}
            className="w-full py-3 bg-secondary border border-border-color rounded-lg hover:bg-tertiary transition-colors text-sm font-medium text-text-primary"
          >
            3 taps heavy
          </button>
          <button
            onClick={() => triggerAction("Pattern: crescendo", async () => {
              await Haptics.impact({ style: ImpactStyle.Light });
              await new Promise(r => setTimeout(r, 150));
              await Haptics.impact({ style: ImpactStyle.Medium });
              await new Promise(r => setTimeout(r, 150));
              await Haptics.impact({ style: ImpactStyle.Heavy });
              await new Promise(r => setTimeout(r, 150));
              await Haptics.vibrate({ duration: 300 });
            })}
            className="w-full py-3 bg-secondary border border-border-color rounded-lg hover:bg-tertiary transition-colors text-sm font-medium text-text-primary"
          >
            Crescendo (light → medium → heavy → vibrate)
          </button>
          <button
            onClick={() => triggerAction("Pattern: success", async () => {
              await Haptics.notification({ type: NotificationType.Success });
            })}
            className="w-full py-3 bg-secondary border border-border-color rounded-lg hover:bg-tertiary transition-colors text-sm font-medium text-text-primary"
          >
            Success notification
          </button>
          <button
            onClick={() => triggerAction("Pattern: feu d'artifice", fireworkHaptic)}
            className="w-full py-3 bg-gradient-to-r from-cout-purple to-cout-yellow text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-bold"
          >
            Feu d'artifice
          </button>
        </div>

        {/* Modal test */}
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">Modale de generation</h3>
        <button
          onClick={openModalFor10s}
          className="w-full py-4 bg-cout-purple text-white font-bold rounded-xl hover:bg-cout-base transition-colors"
        >
          Ouvrir la modale (10s) - tapotez pour tester
        </button>
      </div>

      <RecipeGenerationLoadingModal isOpen={showModal} />
    </div>
  );
}
