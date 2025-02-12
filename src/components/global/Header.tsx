import { Avatar } from "@material-tailwind/react";
import { BackButton, HomeButton } from "../buttons/BackAndHomeButton";
import { Link } from "react-router-dom";
import { useState } from "react";

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

    return (
        <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
                {back && <BackButton />}
                {home && <HomeButton />}
                {title && (
                    <h1 className={`text-lg lg:text-xl xl:text-xl font-bold text-text-primary ml-2`}>
                        Plan'Appétit
                    </h1>
                )}
            </div>

            <h2 className="text-lg lg:text-xl xl:text-xl font-bold text-text-primary text-center mx-auto">
                {pageName}
            </h2>

            {children && children}

            {profile && (
                <Link to="/profile">
                    <Avatar
                        placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}
                        color="blue"
                        size="lg"
                        withBorder={true}
                        src={profilePhoto}
                        className="border-2 hover:scale-105 transition duration-200"
                    />
                </Link>
            )}
        </div>
    );
}

