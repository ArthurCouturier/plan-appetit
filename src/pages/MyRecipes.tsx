import { useEffect, useState } from "react";
import MyRecipesMobile from "./mobile/MyRecipesMobile";

export default function MesRecettes(
) {

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
    isMobile ? <MyRecipesMobile isMobile={isMobile} /> :
      <div>
        salut
      </div>
  )
}