import { Button } from "@material-tailwind/react";
import RecipeInterface from "../../api/interfaces/recipes/RecipeInterface";
import RecipeCard from "../cards/RecipeCard";
import { useRecipeContext } from "../../contexts/RecipeContext";
import RecipeService from "../../api/services/RecipeService";
import { useNavigate } from "react-router-dom";

export default function MyRecipesMobile({
  isMobile
}: {
  isMobile: boolean;
}) {

  const { recipes, setRecipes } = useRecipeContext();

  const recipesList = recipes.map((recipe: RecipeInterface, index: number) =>
  (<RecipeCard
    key={index}
    recipe={recipe}
    isMobile={isMobile} />))

  const navigateTo = useNavigate();

  const handleClick = async () => {
    try {
      await RecipeService.addEmptyRecipe();
      const newRecipes = RecipeService.fetchRecipesLocally();
      setRecipes(newRecipes);
      // navigateTo(`/recettes/${newRecipes[newRecipes.length - 1].uuid}`) 
    } catch (err) {
      console.error(err);
      navigateTo('/login');
    }
  }

  return (
    <div className="space-y-4">
      <div className="w-full mt-4 flex flex-col space-y-4 items-center">
        {recipesList}
      </div>
      <div className="flex justify-center">
        <Button className="bg bg-thirdary text-text-primary"
          onClick={() => handleClick()} placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
          Ajouter une recette
        </Button>
      </div>
    </div>
  )
}