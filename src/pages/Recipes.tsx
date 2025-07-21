import { useEffect, useState } from "react";
import RecipeInterface from "../api/interfaces/recipes/RecipeInterface";
import RecipeService from "../api/services/RecipeService";
import RecipeCard from "../components/cards/RecipeCard";
import { ImportRecipeButton } from "../components/buttons/DataImportButtons";
import { AddRecipeButton, GenerateAIRecipeButton } from "../components/buttons/NewRecipeButton";
import Header from "../components/global/Header";
import MyRecipesMobile from "../components/mobilesComponents/MyRecipesMobile";

export default function Recipes() {

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
          setIsMobile(window.innerWidth <= 768);
        };
    
        handleResize();
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [recipes, setRecipes] = useState<RecipeInterface[]>(RecipeService.fetchRecipesLocally());

    return (
        isMobile ? <MyRecipesMobile recipes={recipes} isMobile={isMobile} /> :
        <div className="w-full bg-bg-color p-6 relative">

            <RecipesHeader />

            <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7 bg-primary p-4 rounded-lg">
                <AddRecipeButton setRecipes={setRecipes} disabled={false} />
                <ImportRecipeButton setRecipes={setRecipes} disabled={false} />
                <GenerateAIRecipeButton disabled={false} />
                {recipes.map((recipe: RecipeInterface, index: number) => (
                    <RecipeCard key={index} recipe={recipe} isMobile={isMobile} />
                ))}
            </div>
        </div>
    );
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
