import RecipeInterface from "../../api/interfaces/recipes/RecipeInterface";
import RecipeCard from "../cards/RecipeCard";
import FooterMobile from "../global/FooterMobile";
import HeaderMobile from "../global/HeaderMobile";

export default function MyRecipesMobile({
  recipes,
  isMobile
}: {
  recipes: RecipeInterface[];
  isMobile: boolean;
}) {

  const recipesList = recipes.map((recipe: RecipeInterface, index: number) => 
    (<RecipeCard 
      key={index} 
      recipe={recipe} 
      isMobile={isMobile} />))
  
  return (
    <div>
      <HeaderMobile pageName="Mes Recettes"/>

      <div className="w-full h-screen mt-4">  {/* Faudra revoir la taille de la div */}
        {recipesList}
      </div>

      <FooterMobile />
    </div>
  )
}