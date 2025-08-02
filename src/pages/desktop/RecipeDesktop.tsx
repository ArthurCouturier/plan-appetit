import RecipeInterface from "../../api/interfaces/recipes/RecipeInterface";
import { ImportRecipeButton } from "../../components/buttons/DataImportButtons";
import { AddRecipeButton, GenerateAIRecipeButton } from "../../components/buttons/NewRecipeButton";
import RecipeCard from "../../components/cards/RecipeCard";
import Header from "../../components/global/Header";
import { useRecipeContext } from "../../contexts/RecipeContext";

export default function RecipeDesktop() {

  const { recipes, setRecipes } = useRecipeContext();

  return (
    <div className="w-full bg-bg-color p-6 relative">

      <RecipesHeader />

      <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7 bg-primary p-4 rounded-lg">
        <AddRecipeButton setRecipes={setRecipes} disabled={false} />
        <ImportRecipeButton setRecipes={setRecipes} disabled={false} />
        <GenerateAIRecipeButton disabled={false} />
        {recipes.map((recipe: RecipeInterface, index: number) => (
          <RecipeCard key={index} recipe={recipe} />
        ))}
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