import { Button } from "@material-tailwind/react";
import { BookOpenIcon, LightBulbIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import RecipeGenerationChoiceModal from "../popups/RecipeGenerationChoiceModal";
import UserAvatar from "./UserAvatar";


export default function FooterMobile() {
  const navigateTo = useNavigate();

  const [lastScrollY, setLastScrollY] = useState(0);
  const [showFooter, setShowFooter] = useState(true);
  const [showGenerationChoice, setShowGenerationChoice] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

      const isAtBottom = currentScrollY >= maxScroll - 1;

      if (!isAtBottom) {
        if (currentScrollY > lastScrollY) {
          setShowFooter(false);
        } else if (currentScrollY < lastScrollY) {
          setShowFooter(true);
        }
      } else {
        setShowFooter(false)
      }

      const isAtTop = currentScrollY <= 0;

      if (isAtTop) {
        setShowFooter(true)
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const goToMyRecipes = () => navigateTo("/myrecipes");

  return (
    <footer className={`fixed flex justify-center inset-x-0 bottom-4 z-40 ${showFooter ? null : "pointer-events-none"}`}>
      <div
        className={`w-auto h-14 mx-6 flex items-center justify-between bg-cout-purple rounded-3xl px-4 py-3 transition-all duration-500 shadow-md
        ${showFooter ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0"}`}
      >
        <Button
          className="bg-cout-purple shadow-none rounded-full"
          onClick={() => setShowGenerationChoice(true)} placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}        >
          <LightBulbIcon className="w-6 h-6 text-white" />
        </Button>
        <Button
          className="bg-cout-purple shadow-none rounded-full"
          onClick={goToMyRecipes} placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}        >
          <BookOpenIcon className="w-6 h-6 text-white" />
        </Button>
        <Button
          className="bg-bg-cout-purple shadow-none rounded-full"
          onClick={() => navigateTo("/profile")} placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
          <UserAvatar size="sm" showHoverEffect />
        </Button>
      </div>

      {/* Generation Choice Modal */}
      <RecipeGenerationChoiceModal
        isOpen={showGenerationChoice}
        onClose={() => setShowGenerationChoice(false)}
      />
    </footer>
  );
}
