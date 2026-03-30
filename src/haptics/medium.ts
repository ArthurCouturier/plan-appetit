import PlatformService from "../api/services/PlatformService";

export function mediumHaptic() {
    PlatformService.hapticFeedback('medium');
}
