import { Button } from "@material-tailwind/react";
import { UserCircleIcon, BookOpenIcon, LightBulbIcon, PlusIcon } from "@heroicons/react/24/solid"

import FooterMobile from "../global/FooterMobile";
import HeaderMobile from "../global/HeaderMobile";
import { useNavigate } from "react-router-dom";
import RecipeInterface from "../../api/interfaces/recipes/RecipeInterface";
import RecipeService from "../../api/services/RecipeService";

export default function HomeMobile({
  recipes,
  setRecipes
}: {
  recipes : RecipeInterface[],
  setRecipes : (recipes: RecipeInterface[]) => void;
}) {

  const navigateTo = useNavigate();

  const goToMyRecipes = () => 
    navigateTo("/mesrecettes", {
      state:{
        recipes: recipes
      }
    })

    const handleClick = async () => {
      try {
          await RecipeService.addEmptyRecipe();
          const newRecipes = RecipeService.fetchRecipesLocally();
          setRecipes(newRecipes);
          navigateTo(`/recettes/${newRecipes[newRecipes.length - 1].uuid}`) 
      } catch (err) {
          console.error(err);
          navigateTo('/login');
      }
    }

  return (
    <div>
      <HeaderMobile pageName="Accueil" />

      <div className="flex flex-col items-center pt-10 space-y-20">
        <Button onClick={() => handleClick()} className="bg-blue-900 w-full text-xl flex items-center justify-center gap-2" >
          <PlusIcon className="w-6 h-6 text-white font-bold"/>
          <span className="lowercase first-letter:uppercase">Ajouter une recette</span>
        </Button>
        <Button 
          className="bg-blue-900 w-full flex text-xl items-center justify-center gap-2"
          onClick={() => navigateTo("/recettes/generer")}>
          <LightBulbIcon className="w-6 h-6 text-white font-bold"/>
          <span className="lowercase first-letter:uppercase">Générer une recette</span>        
        </Button>
          <Button 
            className="bg-blue-900 w-full flex text-xl items-center justify-center gap-2" 
            onClick={() => goToMyRecipes()}>
            <BookOpenIcon className="w-6 h-6 text-white font-bold"/>
            <span className="lowercase first-letter:uppercase">Mes recettes</span>        
          </Button>
        <Button 
          className="bg-blue-900 w-full flex text-xl items-center justify-center gap-2"
          onClick={() => navigateTo("/login")}>
          <UserCircleIcon className="w-6 h-6 text-white font-bold"/>
          <span className="lowercase first-letter:uppercase">Mon compte</span>
        </Button>
      </div>

      <FooterMobile recipes={recipes} setRecipes={setRecipes}/>
    </div>
  )
}