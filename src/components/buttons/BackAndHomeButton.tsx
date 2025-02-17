import { Link } from "react-router-dom";

function LinkButton({
    link,
    children
}: {
    link: string;
    children?: React.ReactNode
}) {
    return (
        <Link to={link}>
            {children}
        </Link>
    );
}

function Button({
    onClick,
    children
}: {
    onClick?: () => void;
    children?: React.ReactNode
}) {
    return (
        <button
            onClick={onClick}
            className="bg-primary hover:opacity-80 hover:scale-105 shadow-sm border-border-color rounded-lg border-4 text-text-secondary font-bold p-4 lg:m-2 m-1 lg:m-2 xl:m-4 transition duration-200"
        >
            {children}
        </button>
    );
}

export default function MenuButton({
    link,
    children,
    onClick
}: {
    link?: string;
    children?: React.ReactNode;
    onClick?: () => void;
}) {
    return link ? (
        <LinkButton link={link}>
            <Button onClick={onClick}>{children}</Button>
        </LinkButton>
    ) : (
        <Button onClick={onClick}>{children}</Button>
    );
}

export function HomeButton() {
    return (
        <MenuButton link={"/"}>Accueil</MenuButton>
    );
}

export function BackButton() {
    return (
        <MenuButton
            onClick={() => window.history.back()}
        >Retour
        </MenuButton>
    );
}
