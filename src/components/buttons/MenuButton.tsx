import { Link } from "react-router-dom";

export default function MenuButton({
    link,
    children
}: {
    link: string;
    children: React.ReactNode
}) {
    return (
        <Link to={link}>
            <button
                className="bg-primary hover:opacity-80 hover:scale-105 shadow border-borderColor rounded-lg border-4 text-textSecondary font-bold p-4 m-4 transition duration-200"
            >
                {children}
            </button>
        </Link>
    );
}

export function HomeButton() {
    return (
        <Link to={"/"}>
            <button
                className="bg-primary hover:opacity-80 hover:scale-105 shadow border-borderColor rounded-lg border-4 text-textSecondary font-bold p-4 m-4 transition duration-200"
            >
                Accueil
            </button>
        </Link>
    );
}
