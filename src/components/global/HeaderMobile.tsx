import { useNavigate } from "react-router-dom";
import { Button } from "@material-tailwind/react";
import { ArrowLeftIcon, HomeIcon } from "@heroicons/react/24/solid";

export default function HeaderMobile() {

  const navigateTo = useNavigate();

  return (
    <header className="z-50 fixed inset-x-0 top-0 border-0 rounded-b-3xl bg-cout-purple shadow-md flex justify-between items-center">
      <Button onClick={() => window.history.back()} className="shadow-transparent bg rounded-t-none bg-cout-purple py-2 px-4" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
        <ArrowLeftIcon className=" w-6 h-6 text-white" />
      </Button>
      <h1 className="text-2xl text-white font-bold">Plan'Appetit</h1>
      <Button className="bg rounded-t-none shadow-transparent bg-cout-purple py-2 px-4" onClick={() => navigateTo("/")} placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
        <HomeIcon className="w-6 h-6 text-white" />
      </Button>
    </header>
  );
}