import RecipeInterface from "../../api/interfaces/recipes/RecipeInterface";
import { ImportRecipeButton } from "../../components/buttons/DataImportButtons";
import { AddRecipeButton, GenerateAIRecipeButton } from "../../components/buttons/NewRecipeButton";
import RecipeCard from "../../components/cards/RecipeCard";
import Header from "../../components/global/Header";
import { useRecipeContext } from "../../contexts/RecipeContext";

export default function RecipeDesktop() {

  const { recipes, setRecipes } = useRecipeContext();

  return (
    <div className="min-h-screen bg-bg-color p-6">
      <RecipesHeader />

      <div className="mt-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Mes Recettes</h2>
            <p className="text-text-secondary text-sm mt-1">{recipes.length} recette{recipes.length > 1 ? 's' : ''} dans votre livre</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          <AddRecipeButton setRecipes={setRecipes} disabled={false} />
          <ImportRecipeButton setRecipes={setRecipes} disabled={false} />
          <GenerateAIRecipeButton disabled={false} />
          {recipes.map((recipe: RecipeInterface, index: number) => (
            <RecipeCard key={index} recipe={recipe} />
          ))}
        </div>
      </div>
    </div>
  )
}

function RecipesHeader() {
  return (
    <Header
      back={true}
      home={true}
      title={true}
      profile={true}
      pageName="Livre des recettes"
    />
  )
}