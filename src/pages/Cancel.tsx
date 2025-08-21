import { Button, Card } from "@material-tailwind/react";
import { useState, useEffect } from "react";
import Header from "../components/global/Header";
import BackendService from "../api/services/BackendService";
import { useStripe } from "@stripe/react-stripe-js";

export default function Cancel() {

  const [isMobile, setIsMobile] = useState(false);

  const stripe = useStripe();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const token = localStorage.getItem("firebaseIdToken")


  const handleClick = async () => {
    const response = await BackendService.upgradeUser(token)
    const data = await response.json();
    stripe?.redirectToCheckout({ sessionId: data.sessionId });
  }


  return (
    <div className='flex flex-col mt-6 rounded-lg bg-bg-color p-6 md:mt-0 md:rounded-md md:h-[92vh] gap-6'>
      {isMobile ? null : <CancelHeader />}
      <div className="flex justify-center items-center size-full rounded-md">

        <Card className="flex flex-col items-center w-full p-4 gap-4 shadow-lg" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>

          <div> Une erreur est survenue
          </div>
          <div> Veuillez réessayer </div>
          <Button onClick={() => handleClick()} fullWidth placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
            Devenir Premium
          </Button>
        </Card>
      </div>
    </div>
  )
}

function CancelHeader() {
  return (
    <Header
      back={true}
      home={true}
      title={true}
      pageName={""}
    />
  )
}
