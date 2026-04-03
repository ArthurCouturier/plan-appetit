import { useState } from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../../api/hooks/useAuth";
import { hasRoleLevel, UserRole } from "../../api/interfaces/users/UserInterface";
import PlatformService from "../../api/services/PlatformService";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import RecipeGenerationLoadingModal from "../../components/popups/RecipeGenerationLoadingModal";
import { fireworkHaptic } from "../../haptics/firework";
import { lightHaptic } from "../../haptics/light";
import { mediumHaptic } from "../../haptics/medium";
import { heavyHaptic } from "../../haptics/heavy";

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

        {/* Interactive examples */}
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">Exemples interactifs</h3>
        <div className="space-y-4 mb-6">
          {/* Slider */}
          <div className="bg-secondary border border-border-color rounded-xl p-4">
            <p className="text-sm font-medium text-text-primary mb-2">Slider (light haptic)</p>
            <input
              type="range" min={0} max={10}
              defaultValue={5}
              onChange={() => lightHaptic()}
              className="w-full h-2 bg-bg-color rounded-lg appearance-none cursor-pointer accent-cout-base"
            />
          </div>

          {/* Level choice */}
          <div className="bg-secondary border border-border-color rounded-xl p-4">
            <p className="text-sm font-medium text-text-primary mb-2">Choix niveau (light haptic)</p>
            <LevelExample />
          </div>

          {/* Boolean */}
          <div className="bg-secondary border border-border-color rounded-xl p-4">
            <p className="text-sm font-medium text-text-primary mb-2">Oui / Non (light haptic)</p>
            <BooleanExample />
          </div>

          {/* Step highlight */}
          <div className="bg-secondary border border-border-color rounded-xl p-4">
            <p className="text-sm font-medium text-text-primary mb-2">Etape recette (medium haptic)</p>
            <StepExample />
          </div>

          {/* Card flip */}
          <div className="bg-secondary border border-border-color rounded-xl p-4">
            <p className="text-sm font-medium text-text-primary mb-2">Flip carte (heavy haptic)</p>
            <button
              onClick={() => heavyHaptic()}
              className="w-full py-3 bg-primary border border-border-color rounded-lg text-sm font-medium text-text-primary hover:bg-tertiary transition-colors"
            >
              Simuler flip
            </button>
          </div>

          {/* Subcollection toggle */}
          <div className="bg-secondary border border-border-color rounded-xl p-4">
            <p className="text-sm font-medium text-text-primary mb-2">Toggle sous-collection (medium haptic)</p>
            <ToggleExample />
          </div>
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

function LevelExample() {
  const [val, setVal] = useState("Moyen");
  const options = ["Peu", "Moyen", "Beaucoup"];
  return (
    <div className="flex gap-2">
      {options.map(o => (
        <button key={o} onClick={() => { setVal(o); lightHaptic(); }}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${val === o ? "bg-cout-yellow text-cout-purple shadow-md scale-105" : "bg-primary border border-border-color text-text-primary"}`}
        >{o}</button>
      ))}
    </div>
  );
}

function BooleanExample() {
  const [val, setVal] = useState<boolean | null>(null);
  return (
    <div className="flex gap-3">
      <button onClick={() => { setVal(false); lightHaptic(); }}
        className={`flex-1 py-2 rounded-xl font-medium transition-all ${val === false ? "bg-cancel-1 text-white shadow-md scale-105" : "bg-primary border border-border-color text-text-primary"}`}
      >Non</button>
      <button onClick={() => { setVal(true); lightHaptic(); }}
        className={`flex-1 py-2 rounded-xl font-medium transition-all ${val === true ? "bg-confirmation-1 text-white shadow-md scale-105" : "bg-primary border border-border-color text-text-primary"}`}
      >Oui</button>
    </div>
  );
}

function StepExample() {
  const [active, setActive] = useState<number | null>(null);
  const steps = ["Couper les legumes", "Faire revenir dans la poele", "Assaisonner et servir"];
  return (
    <div className="space-y-2">
      {steps.map((s, i) => (
        <div key={i} onClick={() => { setActive(active === i ? null : i); mediumHaptic(); }}
          className={`p-2 rounded-lg cursor-pointer text-sm transition-all ${active === i ? "bg-primary shadow-md scale-[1.02]" : "bg-bg-color text-text-secondary"}`}
        ><span className="font-bold">Etape {i + 1}:</span> {s}</div>
      ))}
    </div>
  );
}

function ToggleExample() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => { setOpen(!open); mediumHaptic(); }} className="flex items-center gap-2 text-sm font-medium text-text-primary">
        <svg className={`w-4 h-4 transition-transform duration-200 ${!open ? '-rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
        Sous-collections (3)
      </button>
      <div className="grid transition-[grid-template-rows] duration-200" style={{ gridTemplateRows: open ? '1fr' : '0fr' }}>
        <div className="overflow-hidden">
          <div className="pt-2 space-y-1">
            {["Entrees", "Plats", "Desserts"].map(c => (
              <div key={c} className="bg-primary border border-border-color rounded-lg p-2 text-sm text-text-primary">{c}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
