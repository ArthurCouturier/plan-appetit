import { Button } from "@material-tailwind/react";
import { UserCircleIcon, BookOpenIcon, LightBulbIcon, PlusIcon } from "@heroicons/react/24/solid"
import { useNavigate } from "react-router-dom";
import RecipeService from "../../api/services/RecipeService";
import { useRecipeContext } from "../../contexts/RecipeContext";

export default function HomeMobile() {

  const navigateTo = useNavigate();

  // @ts-ignore
  const { recipes, setRecipes } = useRecipeContext();

  const goToMyRecipes = () => navigateTo("/mesrecettes")

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
      <div className="flex flex-col items-center pt-10 space-y-20">
        <Button onClick={() => handleClick()} className="bg-primary text-text-primary w-full text-xl flex items-center justify-center gap-2" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} >
          <PlusIcon className="w-6 h-6 font-bold" />
          <span className="lowercase first-letter:uppercase">Ajouter une recette</span>
        </Button>
        <Button
          className="bg-primary text-text-primary w-full flex text-xl items-center justify-center gap-2"
          onClick={() => navigateTo("/recettes/generer")} placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
          <LightBulbIcon className="w-6 h-6 font-bold" />
          <span className="lowercase first-letter:uppercase">Générer une recette</span>
        </Button>
        <Button
          className="bg-primary text-text-primary w-full flex text-xl items-center justify-center gap-2"
          onClick={() => goToMyRecipes()} placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
          <BookOpenIcon className="w-6 h-6 font-bold" />
          <span className="lowercase first-letter:uppercase">Mes recettes</span>
        </Button>
        <Button
          className="bg-primary text-text-primary w-full flex text-xl items-center justify-center gap-2"
          onClick={() => navigateTo("/profile")} placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
          <UserCircleIcon className="w-6 h-6 font-bold" />
          <span className="lowercase first-letter:uppercase">Mon compte</span>
        </Button>
      </div>
    </div>
  )
}