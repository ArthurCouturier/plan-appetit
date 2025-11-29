import { ArrowLeftIcon, HomeIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";
import LogoButton from "../buttons/LogoButton";
import UserAvatar from "./UserAvatar";

export default function Header({
    back = false,
    home = true,
    title = true,
    profile = true,
    pageName,
    children,
}: {
    back?: boolean;
    home?: boolean;
    title?: boolean;
    profile?: boolean;
    pageName?: React.ReactNode;
    children?: React.ReactNode;
}) {
    const navigate = useNavigate();

    return (
        <div className="bg-primary rounded-xl p-4 shadow-md border border-border-color">
            <div className="flex items-center justify-between">
                {/* Left section - Back & Home buttons */}
                <div className="flex items-center gap-2">
                    {back && (
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 rounded-lg bg-secondary hover:bg-cout-purple/20 text-cout-base transition-colors duration-200"
                        >
                            <ArrowLeftIcon className="w-5 h-5" />
                        </button>
                    )}
                    {home && (
                        <button
                            onClick={() => navigate("/")}
                            className="p-2 rounded-lg bg-secondary hover:bg-cout-purple/20 text-cout-base transition-colors duration-200"
                        >
                            <HomeIcon className="w-5 h-5" />
                        </button>
                    )}
                    {title && (
                        <div className="hidden md:block pl-4">
                            <LogoButton size="xl" />
                        </div>
                    )}
                </div>

                {/* Center section - Page name */}
                {pageName && (
                    <h2 className="text-base md:text-lg font-semibold text-text-primary absolute left-1/2 -translate-x-1/2">
                        {pageName}
                    </h2>
                )}

                {/* Right section - Profile or custom children */}
                {children ? (
                    children
                ) : profile ? (
                    <button
                        onClick={() => navigate("/profile")}
                        className="relative group"
                    >
                        <UserAvatar size="lg" showHoverEffect className="group-hover:scale-105" />
                    </button>
                ) : null}
            </div>
        </div>
    );
}

