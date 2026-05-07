import { useEffect, useRef } from "react";
import useAuth from "../../api/hooks/useAuth";
import {
    isValidReferralCode,
    normalizeReferralCode,
} from "../../api/interfaces/referral/ReferralInterface";
import ReferralService from "../../api/services/ReferralService";

const STORAGE_KEY = "pendingReferralCode";

// Capture ?ref=XXX au boot puis applique silencieusement après auth (rejets backend ignorés).
export default function ReferralBootstrap() {
    const { user } = useAuth();
    const appliedRef = useRef(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const ref = params.get("ref");
        if (!ref) return;
        const normalized = normalizeReferralCode(ref);
        if (isValidReferralCode(normalized)) {
            localStorage.setItem(STORAGE_KEY, normalized);
        }
        params.delete("ref");
        const newSearch = params.toString();
        const newUrl =
            window.location.pathname + (newSearch ? `?${newSearch}` : "") + window.location.hash;
        window.history.replaceState({}, "", newUrl);
    }, []);

    useEffect(() => {
        if (!user || appliedRef.current) return;
        const pending = localStorage.getItem(STORAGE_KEY);
        if (!pending || !isValidReferralCode(pending)) return;
        const email = localStorage.getItem("email");
        const token = localStorage.getItem("firebaseIdToken");
        if (!email || !token) return;

        appliedRef.current = true;
        ReferralService.applyCode(email, token, pending)
            .then(() => {
                localStorage.removeItem(STORAGE_KEY);
            })
            .catch((err) => {
                console.warn("Auto-apply referral failed", err);
            });
    }, [user]);

    return null;
}
