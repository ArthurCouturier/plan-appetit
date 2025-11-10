import { ArrowLeftIcon, HomeIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import useAuth from "../../api/hooks/useAuth";
import { isPremiumUser } from "../../api/interfaces/users/UserInterface";
import LogoButton from "../buttons/LogoButton";

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
    pageName?: string;
    children?: React.ReactNode;
}) {
    const [profilePhoto] = useState<string>(localStorage.getItem("profilePhoto") || "/no-pp.jpg");
    const navigate = useNavigate();
    const { user } = useAuth();

    // Vérifier si l'utilisateur est premium
    const isUserPremium = user && user.role ? isPremiumUser(user.role) : false;
    const borderColor = isUserPremium ? "border-cout-yellow" : "border-cout-base";

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
                        {profilePhoto && profilePhoto !== "/no-pp.jpg" ? (
                            <img
                                src={profilePhoto}
                                alt="Profile"
                                className={`w-11 h-11 md:w-12 md:h-12 rounded-full border-2 ${borderColor} group-hover:scale-105 transition-transform duration-200 object-cover`}
                            />
                        ) : (
                            <div className={`w-11 h-11 md:w-12 md:h-12 rounded-full bg-cout-purple/20 flex items-center justify-center border-2 ${borderColor} group-hover:scale-105 transition-transform duration-200`}>
                                <UserCircleIcon className="w-7 h-7 text-cout-base" />
                            </div>
                        )}
                    </button>
                ) : null}
            </div>
        </div>
    );
}

