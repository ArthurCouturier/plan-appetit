import PlatformService from "../api/services/PlatformService";

export function heavyHaptic() {
    PlatformService.hapticFeedback('heavy');
}
