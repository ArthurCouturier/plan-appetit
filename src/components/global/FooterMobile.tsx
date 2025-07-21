import { Button } from "@material-tailwind/react";
import { UserCircleIcon, BookOpenIcon, LightBulbIcon, PlusIcon } from "@heroicons/react/24/solid"
import { useNavigate } from "react-router-dom";

export default function FooterMobile() {

  const navigateTo = useNavigate();
  
  return (
    <div className="absolute inset-x-0 gap-1 bottom-4 flex justify-between bg bg-blue-600 rounded-3xl">
        <Button className="bg-blue-900 rounded-3xl border-0" onClick={() => navigateTo("/recettes")}>
        <PlusIcon className="w-6 h-6 text-white"/>
        </Button>
        <Button className="bg-blue-900 rounded-3xl border-0" onClick={() => navigateTo("/recettes/generer")}>
        <LightBulbIcon className="w-6 h-6 text-white" />
        </Button>
        <Button className="bg-blue-900 rounded-3xl border-0">
          <BookOpenIcon className="w-6 h-6 text-white" onClick={() => navigateTo("/")}/>
        </Button>
        <Button className="bg-blue-900 rounded-3xl border-0" onClick={() => navigateTo("/login")}>
          <UserCircleIcon className="w-6 h-6 text-white" />
        </Button>
      </div>
  )
}