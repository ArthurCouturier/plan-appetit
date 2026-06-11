import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeftIcon, HomeIcon, ShoppingCartIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import UserAvatar from "./UserAvatar";
import useAuth from "../../api/hooks/useAuth";
import { isPremiumUser } from "../../api/interfaces/users/UserInterface";
import NotificationBell from "../notifications/NotificationBell";

export const SHOW_HEADER_EVENT = "header:show";
export const HEADER_TRANSITION_MS = 300;

let headerIsVisible = true;

export function requestShowHeader(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(SHOW_HEADER_EVENT));
}

export function isMobileHeaderVisible(): boolean {
  return headerIsVisible;
}

export default function HeaderMobile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isUserPremium = user && user.role ? isPremiumUser(user.role) : false;
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

  useEffect(() => {
    const handleForceShow = () => setIsVisible(true);
    window.addEventListener(SHOW_HEADER_EVENT, handleForceShow);
    return () => window.removeEventListener(SHOW_HEADER_EVENT, handleForceShow);
  }, []);

  useEffect(() => {
    headerIsVisible = isVisible;
  }, [isVisible]);

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
          onClick={() => {
            const cachedUuid = localStorage.getItem("defaultCollectionUuid");
            navigate(cachedUuid ? `/collections/${cachedUuid}` : "/recettes");
          }}
          className="p-2 rounded-full bg-cout-purple/80 backdrop-blur-sm shadow-md hover:bg-cout-purple transition-colors"
        >
          <HomeIcon className="w-6 h-6 text-white" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          data-shopping-cart-target
          onClick={() => navigate("/shopping")}
          aria-label="Liste de courses"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-cout-purple/80 backdrop-blur-sm shadow-md hover:bg-cout-purple transition-colors"
        >
          <ShoppingCartIcon className="w-5 h-5 text-white" />
        </button>
        <NotificationBell
          className="w-10 h-10 rounded-full bg-cout-purple/80 backdrop-blur-sm shadow-md"
        />
        <button
          onClick={handleProfileClick}
          className={`p-1 rounded-full backdrop-blur-sm shadow-md ${isUserPremium ? "bg-cout-yellow" : "bg-cout-purple/80"}`}
        >
          <UserAvatar size="md" />
        </button>
      </div>
    </header>
  );
}