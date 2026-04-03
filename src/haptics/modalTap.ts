import { Haptics } from "@capacitor/haptics";
import PlatformService from "../api/services/PlatformService";

let tapCount = 0;
let tapTimer: ReturnType<typeof setTimeout> | null = null;

export function modalTapHaptic() {
  if (!PlatformService.isNative()) return;

  tapCount++;
  const count = tapCount;

  if (tapTimer) clearTimeout(tapTimer);
  tapTimer = setTimeout(() => { tapCount = 0; }, 2000);

  if (count >= 10) {
    Haptics.vibrate({ duration: 500 });
  } else if (count >= 4) {
    PlatformService.hapticFeedback('heavy');
  } else {
    PlatformService.hapticFeedback('light');
  }
}

export function resetModalTapCount() {
  tapCount = 0;
  if (tapTimer) { clearTimeout(tapTimer); tapTimer = null; }
}
