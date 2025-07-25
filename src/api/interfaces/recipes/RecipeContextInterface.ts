import RecipeInterface from "./RecipeInterface";

export default interface RecipeContextInterface {
  recipes: RecipeInterface[];
  setRecipes: (recipes: RecipeInterface[]) => void;
};