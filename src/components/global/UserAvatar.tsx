import { UserCircleIcon } from "@heroicons/react/24/solid";
import useAuth from "../../api/hooks/useAuth";
import { isPremiumUser } from "../../api/interfaces/users/UserInterface";

type AvatarSize = "sm" | "md" | "lg" | "xl";

interface UserAvatarProps {
    size?: AvatarSize;
    className?: string;
    showHoverEffect?: boolean;
}

const sizeConfig: Record<AvatarSize, { container: string; icon: string; border: string }> = {
    sm: { container: "w-8 h-8", icon: "w-5 h-5", border: "border-2" },
    md: { container: "w-10 h-10", icon: "w-6 h-6", border: "border-2" },
    lg: { container: "w-11 h-11 md:w-12 md:h-12", icon: "w-7 h-7", border: "border-2" },
    xl: { container: "w-20 h-20", icon: "w-12 h-12", border: "border-4" },
};

export default function UserAvatar({ size = "md", className = "", showHoverEffect = false }: UserAvatarProps) {
    const profilePhoto = localStorage.getItem("profilePhoto") || "";
    const { user } = useAuth();

    const isUserPremium = user && user.role ? isPremiumUser(user.role) : false;
    const borderColor = isUserPremium ? "border-cout-yellow" : "border-cout-base";

    const config = sizeConfig[size];
    const hoverClass = showHoverEffect ? "hover:scale-105 transition-transform duration-200" : "";

    const hasValidPhoto = profilePhoto && profilePhoto !== "/no-pp.jpg" && profilePhoto.length > 0;

    if (hasValidPhoto) {
        return (
            <img
                src={profilePhoto}
                alt="Profile"
                className={`${config.container} rounded-full ${config.border} ${borderColor} object-cover ${hoverClass} ${className}`}
            />
        );
    }

    return (
        <div className={`${config.container} rounded-full bg-cout-purple/20 flex items-center justify-center ${config.border} ${borderColor} ${hoverClass} ${className}`}>
            <UserCircleIcon className={`${config.icon} text-cout-base`} />
        </div>
    );
}
