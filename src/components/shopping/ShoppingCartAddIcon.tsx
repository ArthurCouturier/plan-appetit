import { PlusIcon, ShoppingCartIcon } from "@heroicons/react/24/solid";

interface ShoppingCartAddIconProps {
    className?: string;
}

export default function ShoppingCartAddIcon({ className = "" }: ShoppingCartAddIconProps) {
    return (
        <span className={`inline-flex items-center gap-1 ${className}`} aria-hidden>
            <PlusIcon className="w-4 h-4" />
            <ShoppingCartIcon className="w-4 h-4" />
        </span>
    );
}
