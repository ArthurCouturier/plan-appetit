import { useCallback, useEffect, useState } from "react";
import InAppNotificationService from "../services/InAppNotificationService";
import useAuth from "./useAuth";

const POLL_INTERVAL = 2 * 60 * 1000; // 2 minutes
const STORAGE_KEY_COUNT = "unreadNotificationCount";
const STORAGE_KEY_LATEST = "latestNotificationId";

export default function useUnreadNotificationCount() {
    const { user } = useAuth();
    const [unreadCount, setUnreadCount] = useState<number>(() => {
        return Number(localStorage.getItem(STORAGE_KEY_COUNT) || "0");
    });
    const [hasNewNotifications, setHasNewNotifications] = useState(false);

    const refetch = useCallback(async () => {
        if (!user) return;
        const token = localStorage.getItem("firebaseIdToken");
        if (!token) return;
        try {
            const { latestId, unreadCount: count, hasPendingBroadcasts } = await InAppNotificationService.sync();
            const storedLatestId = localStorage.getItem(STORAGE_KEY_LATEST);

            const changed = latestId !== storedLatestId || hasPendingBroadcasts;

            if (changed || count !== Number(localStorage.getItem(STORAGE_KEY_COUNT))) {
                setUnreadCount(hasPendingBroadcasts ? count + 1 : count);
                setHasNewNotifications(hasPendingBroadcasts);
                localStorage.setItem(STORAGE_KEY_COUNT, String(count));
                if (latestId) localStorage.setItem(STORAGE_KEY_LATEST, latestId);
            }
        } catch {
            // silently fail
        }
    }, [user]);

    useEffect(() => {
        if (!user) {
            setUnreadCount(0);
            setHasNewNotifications(false);
            localStorage.setItem(STORAGE_KEY_COUNT, "0");
            localStorage.removeItem(STORAGE_KEY_LATEST);
            return;
        }

        const initialTimeout = setTimeout(refetch, 500);
        const interval = setInterval(refetch, POLL_INTERVAL);
        const onFocus = () => refetch();
        window.addEventListener("focus", onFocus);

        return () => {
            clearTimeout(initialTimeout);
            clearInterval(interval);
            window.removeEventListener("focus", onFocus);
        };
    }, [user, refetch]);

    return { unreadCount, hasNewNotifications, refetch };
}
