import { Button } from "@material-tailwind/react";
import { UserCircleIcon, BookOpenIcon, LightBulbIcon, PlusIcon } from "@heroicons/react/24/solid"

import FooterMobile from "../global/FooterMobile";
import HeaderMobile from "../global/HeaderMobile";
import { useNavigate } from "react-router-dom";

export default function HomeMobile() {

  const navigateTo = useNavigate();

  return (
    <div>
      <HeaderMobile pageName="Accueil" />

      <div className="flex flex-col items-center pt-10 space-y-20">
        <Button className="bg-blue-900 w-full text-xl flex items-center justify-center gap-2">
          <PlusIcon className="w-6 h-6 text-white font-bold"/>
          <span className="lowercase first-letter:uppercase">Ajouter une recette</span>
        </Button>
        <Button 
          className="bg-blue-900 w-full flex text-xl items-center justify-center gap-2"
          onClick={() => navigateTo("/recettes/generer")}>
          <LightBulbIcon className="w-6 h-6 text-white font-bold"/>
          <span className="lowercase first-letter:uppercase">Générer une recette</span>        
        </Button>
        <Button 
          className="bg-blue-900 w-full flex text-xl items-center justify-center gap-2"
          onClick={() => navigateTo("/recettes")}>
          <BookOpenIcon className="w-6 h-6 text-white font-bold"/>
          <span className="lowercase first-letter:uppercase">Mes recettes</span>        
        </Button>
        <Button 
          className="bg-blue-900 w-full flex text-xl items-center justify-center gap-2"
          onClick={() => navigateTo("/login")}>
          <UserCircleIcon className="w-6 h-6 text-white font-bold"/>
          <span className="lowercase first-letter:uppercase">Mon compte</span>
        </Button>
      </div>

      <FooterMobile />
    </div>
  )
}