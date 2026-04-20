import { useEffect, useRef } from "react";
import useAuth from "../../api/hooks/useAuth";
import useFeedback from "../../api/hooks/useFeedback";
import { FEEDBACK_WINDOW_EVENT } from "./feedbackEvents";

export default function FeedbackEventBridge() {
    const { user } = useAuth();
    const { triggerFeedbackCheck } = useFeedback();
    const hasTriggeredAppStartRef = useRef(false);

    useEffect(() => {
        if (!user) {
            hasTriggeredAppStartRef.current = false;
            return;
        }
        if (hasTriggeredAppStartRef.current) return;
        hasTriggeredAppStartRef.current = true;
        const timeout = setTimeout(() => {
            triggerFeedbackCheck("app_start");
        }, 1500);
        return () => clearTimeout(timeout);
    }, [user, triggerFeedbackCheck]);

    useEffect(() => {
        const handler = (e: Event) => {
            const custom = e as CustomEvent<string>;
            triggerFeedbackCheck(custom.detail);
        };
        window.addEventListener(FEEDBACK_WINDOW_EVENT, handler);
        return () => window.removeEventListener(FEEDBACK_WINDOW_EVENT, handler);
    }, [triggerFeedbackCheck]);

    return null;
}
