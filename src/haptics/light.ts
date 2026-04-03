import PlatformService from "../api/services/PlatformService";

export function lightHaptic() {
    PlatformService.hapticFeedback('light');
}
