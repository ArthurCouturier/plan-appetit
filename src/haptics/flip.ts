import { Haptics, ImpactStyle } from "@capacitor/haptics";
import PlatformService from "../api/services/PlatformService";

const MIN_VELOCITY = 30;
const THROTTLE_MS = 60;

let lastRotation = 0;
let lastTime = 0;
let lastHapticTime = 0;

export function resetFlipHaptic(initialRotation: number) {
    lastRotation = initialRotation;
    lastTime = performance.now();
    lastHapticTime = 0;
}

export function updateFlipHaptic(currentRotation: number) {
    if (!PlatformService.isNative()) return;

    const now = performance.now();
    const dt = now - lastTime;
    if (dt < 10) return;

    const velocity = Math.abs(currentRotation - lastRotation) / dt * 1000;
    lastRotation = currentRotation;
    lastTime = now;

    if (velocity < MIN_VELOCITY) return;
    if (now - lastHapticTime < THROTTLE_MS) return;

    lastHapticTime = now;

    if (velocity > 400) {
        Haptics.impact({ style: ImpactStyle.Heavy });
    } else if (velocity > 150) {
        Haptics.impact({ style: ImpactStyle.Medium });
    } else {
        Haptics.impact({ style: ImpactStyle.Light });
    }
}
