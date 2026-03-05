import { useEffect, useRef } from "react";
import NotificationService from "../services/NotificationService";

const PROMPT_SHOWN_KEY = "notification_prompt_shown";

/**
 * Affiche le prompt de permission notification après un délai,
 * uniquement si la permission n'a pas encore été demandée.
 * Ne se déclenche qu'une seule fois par session (via sessionStorage).
 */
export function useDelayedNotificationPrompt(source: string, delayMs: number = 5000) {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (sessionStorage.getItem(PROMPT_SHOWN_KEY)) return;

        const tryPrompt = async () => {
            const undetermined = await NotificationService.isPermissionUndetermined();
            if (!undetermined) return;

            timerRef.current = setTimeout(async () => {
                sessionStorage.setItem(PROMPT_SHOWN_KEY, "true");
                const email = localStorage.getItem("email") || "";
                const token = localStorage.getItem("firebaseIdToken") || "";
                if (email && token) {
                    await NotificationService.initializeNotifications(email, token, source);
                }
            }, delayMs);
        };

        tryPrompt();

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [source, delayMs]);
}
