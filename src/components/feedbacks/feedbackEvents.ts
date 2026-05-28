export const FEEDBACK_WINDOW_EVENT = "feedback:trigger";

export type FeedbackTriggerEvent =
    | "app_start"
    | "recipe_generated"
    | "home_reached"
    | "credit_depleted"
    | "ritual_recipe_opened"
    | string;

export function dispatchFeedbackEvent(event: FeedbackTriggerEvent): void {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent(FEEDBACK_WINDOW_EVENT, { detail: event }));
}
