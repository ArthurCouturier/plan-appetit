import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon, HomeIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import useAuth from "../../api/hooks/useAuth";
import { isPremiumUser } from "../../api/interfaces/users/UserInterface";

type HeaderMobileProps = {
  pageName?: React.ReactNode;
};

export default function HeaderMobile({ pageName }: HeaderMobileProps) {
  const [profilePhoto] = useState<string>(localStorage.getItem("profilePhoto") || "");
  const navigate = useNavigate();
  const { user } = useAuth();

  const isUserPremium = user && user.role ? isPremiumUser(user.role) : false;
  const borderColor = isUserPremium ? "border-cout-yellow" : "border-cout-base";

  return (
    <header className="z-50 fixed inset-x-0 top-0 border-0 rounded-b-3xl bg-cout-purple shadow-md flex justify-between items-center px-2 py-2">
      <div className="flex items-center gap-1 z-10">
        <button
          onClick={() => window.history.back()}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <ArrowLeftIcon className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={() => navigate("/")}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <HomeIcon className="w-6 h-6 text-white" />
        </button>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 max-w-[50%]">
        {pageName ? (
          <div className="text-white font-bold text-lg truncate">
            {pageName}
          </div>
        ) : (
          <h1 className="text-xl text-white font-bold">Plan'Appetit</h1>
        )}
      </div>

      <button
        onClick={() => navigate("/profile")}
        className="p-1 z-10"
      >
        {profilePhoto && profilePhoto !== "/no-pp.jpg" ? (
          <img
            src={profilePhoto}
            alt="Profile"
            className={`w-10 h-10 rounded-full border-2 ${borderColor} object-cover`}
          />
        ) : (
          <div className={`w-10 h-10 rounded-full bg-cout-purple/20 flex items-center justify-center border-2 ${borderColor}`}>
            <UserCircleIcon className="w-6 h-6 text-cout-base" />
          </div>
        )}
      </button>
    </header>
  );
}