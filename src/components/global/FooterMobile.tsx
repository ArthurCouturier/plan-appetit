import { Button } from "@material-tailwind/react";
import { UserCircleIcon, BookOpenIcon, LightBulbIcon, PlusIcon } from "@heroicons/react/24/solid"
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import RecipeInterface from "../../api/interfaces/recipes/RecipeInterface";
// import RecipeService from "../../api/services/RecipeService";

export default function FooterMobile({
  recipes,
  // setRecipes
}: {
  recipes : RecipeInterface[],
  // setRecipes : (recipes: RecipeInterface[]) => void
}) {

  const navigateTo = useNavigate();

  const [lastScrollY, setLastScrollY] = useState(window.scrollY);

  const [showFooter, setShowFooter] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY) {
        setShowFooter(false);
      } else {
        setShowFooter(true);
      }
      setLastScrollY(currentScrollY);
    }

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll)};
    }, [lastScrollY]);

    const goToMyRecipes = () => 
      navigateTo("/mesrecettes", {
        state:{
          recipes: recipes        }
      })

      // const handleClick = async () => {
      //   try {
      //       await RecipeService.addEmptyRecipe();
      //       const newRecipes = RecipeService.fetchRecipesLocally();
      //       setRecipes(newRecipes);
      //       navigateTo(`/recettes/${newRecipes[newRecipes.length - 1].uuid}`) 
      //   } catch (err) {
      //       console.error(err);
      //       navigateTo('/login');
      //   }
      // }
  
  return (
    <footer className={`absolute px-4 mx-20 inset-x-0 gap-1 bottom-4 flex justify-between bg-blue-600 rounded-3xl transition-transform duration-2000 ${
      showFooter ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
    }`}>
        {/* <Button className="bg-blue-900 rounded-3xl border-0" onClick={() => handleClick()}>
        <PlusIcon className="w-6 h-6 text-white"/>
        </Button> */}
        <Button className="bg-blue-900 rounded-3xl border-0" onClick={() => navigateTo("/recettes/generer")}>
        <LightBulbIcon className="w-6 h-6 text-white" />
        </Button>
        <Button className="bg-blue-900 rounded-3xl border-0">
          <BookOpenIcon className="w-6 h-6 text-white" onClick={() => goToMyRecipes()}/>
        </Button>
        <Button className="bg-blue-900 rounded-3xl border-0" onClick={() => navigateTo("/login")}>
          <UserCircleIcon className="w-6 h-6 text-white" />
        </Button>
      </footer>
  )
}