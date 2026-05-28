import { Capacitor } from "@capacitor/core";
import { Haptics, NotificationType } from "@capacitor/haptics";

export function successHaptic() {
    if (Capacitor.isNativePlatform()) {
        Haptics.notification({ type: NotificationType.Success });
    }
}
