import { Card } from "@material-tailwind/react";
import { useState, useEffect } from "react";
import Header from "../components/global/Header"

export default function Complete() {

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className='flex flex-col mt-6 rounded-lg bg-bg-color p-6 md:mt-0 md:rounded-md md:h-[92vh] gap-6'>
      {isMobile ? null : <CompleteHeader />}
      <div className="flex justify-center items-center size-full rounded-md">

        <Card className="flex flex-col items-center w-full p-4 gap-4 shadow-lg" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>

          <div> Vous êtes désormais premium !
          </div>
          <div> Voici les avanatges auxquels vous accédez : blablabla</div>
        </Card>
      </div>
    </div>
  )
}

function CompleteHeader() {
  return (
    <Header
      back={true}
      home={true}
      title={true}
      pageName={""}
    />
  )
}