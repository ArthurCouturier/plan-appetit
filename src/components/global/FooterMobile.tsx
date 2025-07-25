import { Button } from "@material-tailwind/react";
import { UserCircleIcon, BookOpenIcon, LightBulbIcon } from "@heroicons/react/24/solid"
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useRecipeContext } from "../../contexts/RecipeContext";

export default function FooterMobile() {

  const { recipes } = useRecipeContext();

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
    navigateTo("/mesrecettes", {
      state: {
        recipes: recipes
      }
    })

  return (
    <footer className={`absolute px-4 mx-20 inset-x-0 gap-1 bottom-4 flex justify-between bg-blue-600 rounded-3xl transition-transform duration-2000 ${showFooter ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}>
      <Button className="bg-blue-900 rounded-3xl border-0" onClick={() => navigateTo("/recettes/generer")} placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
        <LightBulbIcon className="w-6 h-6 text-white" />
      </Button>
      <Button className="bg-blue-900 rounded-3xl border-0" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
        <BookOpenIcon className="w-6 h-6 text-white" onClick={() => goToMyRecipes()} />
      </Button>
      <Button className="bg-blue-900 rounded-3xl border-0" onClick={() => navigateTo("/login")} placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
        <UserCircleIcon className="w-6 h-6 text-white" />
      </Button>
    </footer>
  )
}