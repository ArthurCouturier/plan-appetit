import RecipeInterface from "../../api/interfaces/recipes/RecipeInterface";
import { ImportRecipeButton } from "../../components/buttons/DataImportButtons";
import { AddRecipeButton, GenerateAIRecipeButton } from "../../components/buttons/NewRecipeButton";
import RecipeCard from "../../components/cards/RecipeCard";
import Header from "../../components/global/Header";
import { useRecipeContext } from "../../contexts/RecipeContext";
import { SparklesIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";

export default function RecipeDesktop() {

  const { recipes, setRecipes } = useRecipeContext();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-color p-6">
      <RecipesHeader />

      <div className="mt-6">
        {/* Header section */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-text-primary mb-2">Ma Bibliothèque</h2>
            <p className="text-text-secondary">
              {recipes.length > 0 
                ? `${recipes.length} recette${recipes.length > 1 ? 's' : ''} dans votre collection` 
                : "Votre bibliothèque est vide"}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="bg-primary rounded-xl p-6 shadow-md border border-border-color mb-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Actions rapides</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AddRecipeButton setRecipes={setRecipes} disabled={false} />
            <ImportRecipeButton setRecipes={setRecipes} disabled={false} />
            <GenerateAIRecipeButton disabled={false} />
          </div>
        </div>

        {/* Recipes grid or empty state */}
        {recipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {recipes.map((recipe: RecipeInterface, index: number) => (
              <RecipeCard key={index} recipe={recipe} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-32 h-32 bg-gradient-to-br from-cout-base to-cout-purple rounded-full flex items-center justify-center mb-6 shadow-lg">
              <SparklesIcon className="w-16 h-16 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-text-primary mb-3 text-center">
              Votre bibliothèque vous attend
            </h3>
            <p className="text-text-secondary text-center mb-8 max-w-md text-lg">
              Commencez à construire votre collection de recettes personnalisées. 
              Utilisez l'IA pour générer des recettes adaptées à vos besoins !
            </p>
            <button
              onClick={() => navigate('/generate')}
              className="flex items-center gap-2 px-8 py-4 bg-cout-yellow text-cout-purple font-bold rounded-xl text-lg shadow-xl hover:bg-yellow-400 hover:scale-105 transition-all duration-300"
            >
              <SparklesIcon className="w-6 h-6" />
              Générer ma première recette
            </button>
          </div>
        )}
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