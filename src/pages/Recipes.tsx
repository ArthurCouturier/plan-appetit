import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../api/hooks/useAuth";
import { useDefaultCollection } from "../api/hooks/useCollectionQueries";
import { dispatchFeedbackEvent } from "../components/feedbacks/feedbackEvents";

const CACHED_DEFAULT_UUID_KEY = "defaultCollectionUuid";

export default function Recipes() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { data: defaultCollection } = useDefaultCollection();
    const redirectedRef = useRef(false);

    useEffect(() => {
        if (user) {
            dispatchFeedbackEvent("home_reached");
        }
    }, [user]);

    useEffect(() => {
        if (user === undefined) return;
        if (redirectedRef.current) return;

        if (user === null) {
            navigate('/login', { replace: true });
            return;
        }

        const cachedUuid = localStorage.getItem(CACHED_DEFAULT_UUID_KEY);
        if (cachedUuid) {
            redirectedRef.current = true;
            navigate(`/collections/${cachedUuid}`, { replace: true });
            return;
        }

        if (defaultCollection?.uuid) {
            redirectedRef.current = true;
            localStorage.setItem(CACHED_DEFAULT_UUID_KEY, defaultCollection.uuid);
            navigate(`/collections/${defaultCollection.uuid}`, { replace: true });
        }
    }, [user, defaultCollection, navigate]);

    useEffect(() => {
        if (defaultCollection?.uuid) {
            localStorage.setItem(CACHED_DEFAULT_UUID_KEY, defaultCollection.uuid);
        }
    }, [defaultCollection]);

    return (
        <div className="min-h-screen bg-bg-color flex items-center justify-center">
            <div className="animate-pulse text-text-secondary">Chargement...</div>
        </div>
    );
}
