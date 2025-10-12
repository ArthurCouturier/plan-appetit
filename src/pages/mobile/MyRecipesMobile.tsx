import { PlusIcon } from "@heroicons/react/24/solid";
import RecipeInterface from "../../api/interfaces/recipes/RecipeInterface";
import RecipeCard from "../../components/cards/RecipeCard";
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
      const newRecipes = await RecipeService.fetchRecipesRemotly();
      setRecipes(newRecipes);
      navigateTo(`/recettes/${newRecipes[newRecipes.length - 1].uuid}`)
    } catch (err) {
      console.error(err);
      navigateTo('/login');
    }
  }

  return (
    <div className="min-h-screen bg-bg-color p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary mb-2">Mes Recettes</h1>
        <p className="text-text-secondary text-sm">{recipes.length} recette{recipes.length > 1 ? 's' : ''} dans votre livre</p>
      </div>

      <div className="space-y-3 mb-20">
        {recipesList}
      </div>

      <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-bg-color via-bg-color to-transparent">
        <button
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-cout-yellow text-cout-purple font-bold rounded-xl shadow-lg hover:bg-yellow-400 active:scale-95 transition-all duration-200"
          onClick={() => handleClick()}
        >
          <PlusIcon className="w-5 h-5" />
          Ajouter une recette
        </button>
      </div>
    </div>
  )
}