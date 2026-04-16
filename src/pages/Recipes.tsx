import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../api/hooks/useAuth";
import { useDefaultCollection } from "../api/hooks/useCollectionQueries";
import { dispatchFeedbackEvent } from "../components/feedbacks/feedbackEvents";

export default function Recipes() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { data: defaultCollection } = useDefaultCollection();

    useEffect(() => {
        if (user) {
            dispatchFeedbackEvent("home_reached");
        }
    }, [user]);

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
