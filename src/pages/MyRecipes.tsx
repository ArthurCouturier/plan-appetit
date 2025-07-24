import { useEffect, useState } from "react";
import MyRecipesMobile from "../components/mobilesComponents/MyRecipesMobile";
import RecipeInterface from "../api/interfaces/recipes/RecipeInterface";

export default function MesRecettes(
//   {
//   recipes
// }: {
//   recipes : RecipeInterface[];
// }
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