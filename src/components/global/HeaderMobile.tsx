import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeftIcon, HomeIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import UserAvatar from "./UserAvatar";
import useAuth from "../../api/hooks/useAuth";

export default function HeaderMobile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 50) {
        // Toujours visible en haut de page
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        // Scroll vers le bas -> cacher
        setIsVisible(false);
      } else {
        // Scroll vers le haut -> montrer
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Ne pas afficher le header sur la page login
  if (location.pathname === "/login") {
    return null;
  }

  const handleProfileClick = () => {
    if (user) {
      navigate("/profile");
    } else {
      navigate("/login");
    }
  };

  return (
    <header
      className={`z-50 fixed top-0 inset-x-0 flex justify-between items-center px-3 pb-1 transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
      style={{
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 4px)"
      }}
    >
      <div className="flex items-center gap-2">
        <button
          onClick={() => window.history.back()}
          className="p-2 rounded-full bg-cout-purple/80 backdrop-blur-sm shadow-md hover:bg-cout-purple transition-colors"
        >
          <ArrowLeftIcon className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={() => navigate("/")}
          className="p-2 rounded-full bg-cout-purple/80 backdrop-blur-sm shadow-md hover:bg-cout-purple transition-colors"
        >
          <HomeIcon className="w-6 h-6 text-white" />
        </button>
      </div>

      <button
        onClick={handleProfileClick}
        className="p-1 rounded-full bg-cout-purple/80 backdrop-blur-sm shadow-md"
      >
        <UserAvatar size="md" />
      </button>
    </header>
  );
}