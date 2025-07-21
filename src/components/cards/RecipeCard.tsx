import { Link } from "react-router-dom";
import RecipeInterface from "../../api/interfaces/recipes/RecipeInterface";
import { ArrowRightIcon } from "@heroicons/react/24/solid";


export default function RecipeCard({
    recipe,
    isMobile
}: {
    recipe: RecipeInterface;
    isMobile: boolean;
}) {

    return (
        isMobile ? 
        <div className="bg-blue-600 rounded-xl flex gap-1 py-1 px-2">
            <h2 className="font-bold">{recipe.name}</h2>
            <p> pour {recipe.covers} pers.</p>
            <ArrowRightIcon className="w-6 hwhite-6 text-black"/>
        </div>
        :
        <Link to={`/recettes/${recipe.uuid}`}>
            <div className="bg-secondary text-text-primary p-2 rounded-md m-2 border-4 border-border-color aspect-square hover:scale-95 transition duration-200">
                <h3 className="font-bold underline text-lg overflow-auto">{recipe.name}</h3>
                <p>pour {recipe.covers} pers.</p>
                <p>achat {recipe.buyPrice}€</p>
                <p>vente {recipe.sellPrice}€</p>
                <p>{recipe.steps.length ? recipe.steps.length : 0} étape{recipe.steps.length > 1 ? "s" : ""}</p>
            </div>
        </Link>
    );
}
