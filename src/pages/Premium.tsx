import { Card, Button } from "@material-tailwind/react";
import { useStripe } from "@stripe/react-stripe-js";
import { useState, useEffect } from "react";
import Header from "../components/global/Header";
import BackendService from "../api/services/BackendService";

export default function Premium() {

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const stripe = useStripe();

  const token = localStorage.getItem("firebaseIdToken")

  const handleClick = async () => {
    const response = await BackendService.upgradeUser(token)
    const data = await response.json();
    stripe?.redirectToCheckout({ sessionId: data.sessionId });
  }

  return (
    <div className='flex flex-col mt-6 rounded-lg bg-bg-color p-6 md:mt-0 md:rounded-md md:h-[92vh] gap-6'>
      {isMobile ? null : <PremiumHeader />}
      <div className="flex justify-center items-center size-full rounded-md">

        <Card className="flex flex-col items-center w-full p-4 gap-4 shadow-lg" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
          <div>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </div>
          <Button className="w-max" onClick={() => handleClick()} placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
            Devenir premium
          </Button>
        </Card>
      </div>
    </div>

  )
}

function PremiumHeader() {
  return (
    <Header
      back={true}
      home={true}
      title={true}
      pageName={"Premium"}
    />
  )
}