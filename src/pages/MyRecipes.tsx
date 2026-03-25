import { useEffect } from "react";
import MyRecipesMobile from "./mobile/MyRecipesMobile";
import { useNavigate } from "react-router-dom";
import useIsMobile from "../hooks/useIsMobile";

export default function MyRecipes(
) {

  const isMobile = useIsMobile();

  const navigate = useNavigate();


  useEffect(() => {
    if (!isMobile) {
      navigate("/recettes");
    }
  }, [isMobile, navigate]);

  return (
    isMobile && <MyRecipesMobile isMobile={isMobile} />
  )
}