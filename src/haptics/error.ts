import { Capacitor } from "@capacitor/core";
import { Haptics, NotificationType } from "@capacitor/haptics";

export function errorHaptic() {
    if (Capacitor.isNativePlatform()) {
        Haptics.notification({ type: NotificationType.Error });
    }
}
