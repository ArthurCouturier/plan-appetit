import { createContext, useContext, useState } from "react";
import RecipeInterface from "../api/interfaces/recipes/RecipeInterface";
import RecipeContextInterface from "../api/interfaces/recipes/RecipeContextInterface"

const RecipeContext = createContext <RecipeContextInterface | undefined> (undefined);

export const RecipeProvider = ({ children }: { children: React.ReactNode }) => {
  const [recipes, setRecipes] = useState<RecipeInterface[]>([]);
  return (
    <RecipeContext.Provider value={{recipes, setRecipes}}>
      {children}
    </RecipeContext.Provider>
  );
};

export const useRecipeContext =() => {
  const context = useContext(RecipeContext);
  if (!context) throw new Error('useRecipeContext must be used within a RecipeProvider');
  return context;
};
