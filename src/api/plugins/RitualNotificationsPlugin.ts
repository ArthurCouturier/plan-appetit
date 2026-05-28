import { PluginListenerHandle, registerPlugin } from "@capacitor/core";

export interface RitualQuickReplyEvent {
    mealType: string;
    text: string;
}

export interface RitualNotificationsPlugin {
    ping(): Promise<{ ok: boolean }>;
    addListener(
        eventName: "ritualQuickReply",
        listener: (event: RitualQuickReplyEvent) => void,
    ): Promise<PluginListenerHandle>;
}

export const RitualNotifications = registerPlugin<RitualNotificationsPlugin>("RitualNotifications");
