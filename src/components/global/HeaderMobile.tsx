import { useNavigate } from "react-router-dom";
import { Button } from "@material-tailwind/react";
import { ArrowLeftIcon, HomeIcon } from "@heroicons/react/24/solid";

export default function HeaderMobile({
  pageName
}: {
  pageName?: string
}) {

  const navigateTo = useNavigate();

  return (
    <header className="absolute inset-x-0 top-0 border-0 rounded-b-3xl bg-primary shadow-md flex justify-between items-center">
      <Button onClick={() => window.history.back()} className="bg rounded-t-none bg-thirdary py-2 px-4" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
        <ArrowLeftIcon className="w-6 h-6 text-text-primary" />
      </Button>
      <h1 className="text-xl text-text-primary font-bold">Plan'Appetit</h1>
      <p className="text-2xl">🧂</p>
      <h1 className="text-xl font-bold">{pageName}</h1>
      <Button className="bg rounded-t-none bg-thirdary py-2 px-4" onClick={() => navigateTo("/")} placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
        <HomeIcon className="w-6 h-6 text-text-primary" />
      </Button>
    </header>
  );
}