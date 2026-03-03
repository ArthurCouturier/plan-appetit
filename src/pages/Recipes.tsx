import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../api/hooks/useAuth";
import { useDefaultCollection } from "../api/hooks/useCollectionQueries";
import { TrackingService } from "../api/services/TrackingService";

export default function Recipes() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { data: defaultCollection } = useDefaultCollection();
    const trackedRef = useRef(false);

    useEffect(() => {
        if (trackedRef.current) return;
        const raw = sessionStorage.getItem('pending_stripe_purchase');
        if (!raw) return;
        trackedRef.current = true;
        sessionStorage.removeItem('pending_stripe_purchase');

        try {
            const { type, price, currency } = JSON.parse(raw);
            if (type === 'subscription') {
                TrackingService.logSubscribe(price, currency);
            } else {
                TrackingService.logPurchase(price, currency, 'credits');
            }
        } catch { /* ignore parse errors */ }
    }, []);

    useEffect(() => {
        if (user === undefined) return;

        if (user === null) {
            navigate('/login', { replace: true });
            return;
        }

        if (defaultCollection?.uuid) {
            navigate(`/collections/${defaultCollection.uuid}`, { replace: true });
        }
    }, [user, defaultCollection, navigate]);

    return (
        <div className="min-h-screen bg-bg-color flex items-center justify-center">
            <div className="animate-pulse text-text-secondary">Chargement...</div>
        </div>
    );
}
