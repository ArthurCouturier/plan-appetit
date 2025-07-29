import { useNavigate } from "react-router-dom";

export function Button({
    onClick,
    children
}: {
    onClick?: () => void;
    children?: React.ReactNode
}) {
    return (
        <button
            onClick={onClick}
            className="bg-primary hover:opacity-80 hover:scale-105 shadow-sm border-border-color rounded-lg border-4 text-text-secondary font-bold p-4 m-1 lg:m-2 xl:m-4 transition duration-200"
        >
            {children}
        </button>
    );
}

export function HomeButton() {

    const navigate = useNavigate();

    return (
        <Button onClick={() => navigate("/")}>Accueil</Button>
    );
}

export function BackButton() {
    return (
        <Button
            onClick={() => window.history.back()}
        >Retour
        </Button>
    );
}
