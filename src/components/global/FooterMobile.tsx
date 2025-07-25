import { Button } from "@material-tailwind/react";
import { UserCircleIcon, BookOpenIcon, LightBulbIcon } from "@heroicons/react/24/solid"
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function FooterMobile() {

  const navigateTo = useNavigate();

  const [lastScrollY, setLastScrollY] = useState(window.scrollY);

  const [showFooter, setShowFooter] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY) {
        setShowFooter(false);
      } else {
        setShowFooter(true);
      }
      setLastScrollY(currentScrollY);
    }

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll)
    };
  }, [lastScrollY]);

  const goToMyRecipes = () =>
    navigateTo("/mesrecettes")

  return (
    <footer className={`absolute mx-20 inset-x-0 gap-1 bottom-4 flex justify-between bg-primary rounded-3xl transition-transform duration-2000 ${showFooter ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}>
      <Button className="bg-primary shadow-transparent rounded-3xl border-0" onClick={() => navigateTo("/recettes/generer")}>
        <LightBulbIcon className="w-6 h-6 text-text-primary" />
      </Button>
      <Button className="bg-primary shadow-transparent rounded-3xl border-0" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
        <BookOpenIcon className="w-6 h-6 text-text-primary" onClick={() => goToMyRecipes()} />
      </Button>
      <Button className="bg-primary shadow-transparent rounded-3xl border-0" onClick={() => navigateTo("/login")} placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
        <UserCircleIcon className="w-6 h-6 text-text-primary" />
      </Button>
    </footer>
  )
}