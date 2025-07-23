import { useEffect, useState } from "react";
import MyRecipesMobile from "../components/mobilesComponents/MyRecipesMobile";
import RecipeInterface from "../api/interfaces/recipes/RecipeInterface";
import { useLocation } from "react-router-dom";

export default function MesRecettes() {

  const [isMobile, setIsMobile] = useState(false);
      
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const location = useLocation();
    
  const { recipes }: { recipes: RecipeInterface[] } = location.state || {};

  return (
    isMobile ? <MyRecipesMobile recipes={recipes} isMobile={isMobile}/> :
    <div>
      salut
    </div>
  )
}