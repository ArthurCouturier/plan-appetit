import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CollectionService from "../api/services/CollectionService";
import useAuth from "../api/hooks/useAuth";

export default function Recipes() {
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        const redirectToDefaultCollection = async () => {
            // Attendre que le statut d'authentification soit déterminé
            if (user === undefined) return;

            // Si l'utilisateur n'est pas connecté, rediriger vers login
            if (user === null) {
                navigate('/login', { replace: true });
                return;
            }

            try {
                const defaultCollection = await CollectionService.getDefaultCollection();
                if (defaultCollection?.uuid) {
                    navigate(`/collections/${defaultCollection.uuid}`, { replace: true });
                }
            } catch (err) {
                console.error('Erreur lors de la récupération de la collection par défaut:', err);
            }
        };

        redirectToDefaultCollection();
    }, [user, navigate]);

    return (
        <div className="min-h-screen bg-bg-color flex items-center justify-center">
            <div className="animate-pulse text-text-secondary">Chargement...</div>
        </div>
    );
}
