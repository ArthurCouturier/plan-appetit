import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAuth from "../api/hooks/useAuth";
import { useJoinShoppingListByInviteToken } from "../api/hooks/useShoppingLists";
import {
    MemberLimitReachedError,
} from "../api/services/ShoppingListService";
import PageLoader from "../components/global/PageLoader";
import { lightHaptic } from "../haptics/light";
import { errorHaptic } from "../haptics/error";

export default function ShoppingJoinPage() {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const join = useJoinShoppingListByInviteToken();
    const triggeredRef = useRef(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) return;
        if (user === undefined) return;
        if (user === null) {
            navigate(`/login?returnTo=${encodeURIComponent(`/shopping/join/${token}`)}`, { replace: true });
            return;
        }
        if (triggeredRef.current) return;
        triggeredRef.current = true;
        join.mutate(token, {
            onSuccess: (joined) => {
                lightHaptic();
                navigate(`/shopping/${joined.uuid}`, { replace: true });
            },
            onError: (err) => {
                errorHaptic();
                if (err instanceof MemberLimitReachedError) {
                    setError(`Cette liste a atteint sa limite de ${err.limit} membres.`);
                } else {
                    setError(err.message);
                }
            },
        });
    }, [token, user, navigate, join]);

    if (error) {
        return (
            <div className="min-h-screen bg-bg-color flex flex-col items-center justify-center gap-4 px-6 text-center mobile-content-with-header">
                <p className="text-cancel-1 font-semibold text-sm">{error}</p>
                <button
                    type="button"
                    onClick={() => navigate("/shopping", { replace: true })}
                    className="px-5 py-2.5 rounded-full bg-cout-purple text-white font-semibold text-sm"
                >
                    Voir mes listes
                </button>
            </div>
        );
    }

    return <PageLoader message="Rejoindre la liste..." />;
}
