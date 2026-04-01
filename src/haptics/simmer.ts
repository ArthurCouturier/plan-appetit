import PlatformService from "../api/services/PlatformService";

export function simmerHaptic() {
  const intensities: ("light" | "medium")[] = ["light", "medium", "light", "medium"];
  const delays = [0, 120, 280, 400];

  delays.forEach((delay, i) => {
    setTimeout(() => PlatformService.hapticFeedback(intensities[i]), delay);
  });
}
