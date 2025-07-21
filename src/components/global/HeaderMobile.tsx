import { useNavigate } from "react-router-dom";
import { Button } from "@material-tailwind/react";
import { ArrowLeftIcon, HomeIcon } from "@heroicons/react/24/solid";

export default function HeaderMobile({
  pageName
}: {
    pageName? : string
  }) {
  
  const navigateTo = useNavigate();

  return (
      <header className="absolute inset-x-0 top-0 border-0 rounded-b-3xl bg-blue-600 shadow-md flex justify-between items-center">
        <Button onClick={() => window.history.back()} className="bg rounded-t-none bg-blue-900 py-2 px-4"> 
          <ArrowLeftIcon className="w-6 h-6 text-white"/>
        </Button>
          <h1 className="text-xl text-white font-bold">Plan'Appetit</h1>
          <h1 className="text-xl font-bold">{pageName}</h1>
        <Button className="bg rounded-t-none bg-blue-900 py-2 px-4" onClick={() =>navigateTo("/")}> 
          <HomeIcon className="w-6 h-6 text-white"/>
        </Button>
      </header>
  );
}