import { Button } from "@material-tailwind/react";
import { UserCircleIcon, BookOpenIcon, LightBulbIcon } from "@heroicons/react/24/solid"
import { useNavigate } from "react-router-dom";

export default function HomeMobile() {

  const navigateTo = useNavigate();

  const goToMyRecipes = () => navigateTo("/recettes")

  return (
    <div>
      <div className="flex flex-col items-center px-4 pt-20 pb-24 space-y-20">
        <Button
          className="bg-primary text-text-primary w-full flex text-xl items-center justify-center gap-2"
          onClick={() => navigateTo("/recettes/generer")} placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
          <LightBulbIcon className="w-6 h-6 font-bold" />
          <span className="lowercase first-letter:uppercase">Générer une recette</span>
        </Button>
        <Button
          className="bg-primary text-text-primary w-full flex text-xl items-center justify-center gap-2"
          onClick={() => goToMyRecipes()} placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
          <BookOpenIcon className="w-6 h-6 font-bold" />
          <span className="lowercase first-letter:uppercase">Mes recettes</span>
        </Button>
        <Button
          className="bg-primary text-text-primary w-full flex text-xl items-center justify-center gap-2"
          onClick={() => navigateTo("/profile")} placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
          <UserCircleIcon className="w-6 h-6 font-bold" />
          <span className="lowercase first-letter:uppercase">Mon compte</span>
        </Button>
      </div>
    </div>
  )
}