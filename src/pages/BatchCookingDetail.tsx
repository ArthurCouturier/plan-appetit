import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useAuth from "../api/hooks/useAuth";
import BatchCookingService from "../api/services/BatchCookingService";
import BatchStep4Results from "../components/batchcooking/BatchStep4Results";
import { queryKeys } from "../api/queryConfig";

export default function BatchCookingDetail() {
    const { uuid } = useParams<{ uuid: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const email = user?.email ?? localStorage.getItem("email") ?? "";
    const token = user?.token ?? localStorage.getItem("firebaseIdToken") ?? "";

    const { data: batchCooking, isLoading, isError } = useQuery({
        queryKey: ["batch-cooking", uuid],
        queryFn: () => BatchCookingService.getById(uuid!, email, token),
        enabled: !!uuid && !!user,
    });

    const handleDelete = async () => {
        if (!uuid) return;
        await BatchCookingService.delete(uuid, email, token);
        queryClient.invalidateQueries({ queryKey: ["batch-cookings-all"] });
        queryClient.invalidateQueries({ queryKey: queryKeys.collections.all() });
        navigate("/recettes");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-bg-color flex items-center justify-center" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 4rem)" }}>
                <div className="animate-pulse text-text-secondary">Chargement en cours...</div>
            </div>
        );
    }

    if (isError || !batchCooking) {
        return (
            <div className="min-h-screen bg-bg-color flex items-center justify-center" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 4rem)" }}>
                <div className="text-text-secondary">Batch cooking introuvable</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-color pb-20" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 4rem)" }}>
            <BatchStep4Results batchCooking={batchCooking} onDelete={handleDelete} />
        </div>
    );
}
