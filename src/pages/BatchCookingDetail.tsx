import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useAuth from "../api/hooks/useAuth";
import BatchCookingService from "../api/services/BatchCookingService";
import BatchCookingV2Service from "../api/services/BatchCookingV2Service";
import { mapV2BcToV0Response } from "../api/adapters/batchCookingV2Adapter";
import BatchStep4Results from "../components/batchcooking/BatchStep4Results";
import { queryKeys } from "../api/queryConfig";

export default function BatchCookingDetail() {
    const { uuid } = useParams<{ uuid: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const email = user?.email ?? localStorage.getItem("email") ?? "";
    const token = user?.token ?? localStorage.getItem("firebaseIdToken") ?? "";

    // Lecture sur v2 (adapter v2 → v0 shape pour réutiliser BatchStep4Results).
    // Pattern miroir de useCollectionQueries : la donnée vient du nouveau schéma,
    // l'UI consomme la shape historique sans modification.
    const { data: batchCooking, isLoading, isError } = useQuery({
        queryKey: ["batch-cooking-v2", uuid],
        queryFn: async () => {
            const v2 = await BatchCookingV2Service.getById(uuid!);
            return mapV2BcToV0Response(v2);
        },
        enabled: !!uuid && !!user,
    });

    const handleDelete = async () => {
        if (!uuid) return;
        // Suppression sur les deux schémas en parallèle pendant la fenêtre de coexistence.
        // BatchCookingV2Service.delete est idempotent ; en cas d'échec d'un seul côté, on
        // privilégie la cohérence du UX (navigation) et un éventuel reliquat sera nettoyé
        // par le prochain run de mirror ou par un cron de cleanup.
        await Promise.allSettled([
            BatchCookingService.delete(uuid, email, token),
            BatchCookingV2Service.delete(uuid),
        ]);
        queryClient.invalidateQueries({ queryKey: ["batch-cookings-all-v2"] });
        queryClient.invalidateQueries({ queryKey: ["batch-cooking-v2", uuid] });
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
        <div className="min-h-screen bg-bg-color" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 4rem)" }}>
            <BatchStep4Results batchCooking={batchCooking} onDelete={handleDelete} />
        </div>
    );
}
