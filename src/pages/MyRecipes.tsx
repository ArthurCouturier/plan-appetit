import { useEffect, useState } from "react";
import MyRecipesMobile from "./mobile/MyRecipesMobile";
import { useNavigate } from "react-router-dom";

export default function MyRecipes(
) {

  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);

  const navigate = useNavigate();


  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);


  useEffect(() => {
    if (!isMobile) {
      navigate("/recettes");
    }
  }, [isMobile, navigate]);

  return (
    isMobile && <MyRecipesMobile isMobile={isMobile} />
  )
}