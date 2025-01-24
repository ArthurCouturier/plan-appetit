import { Link } from "react-router-dom";
import RecipeInterface from "../../api/interfaces/recipes/RecipeInterface";

export default function RecipeCard({
    recipe,
}: {
    recipe: RecipeInterface;
}) {

    return (
        <Link to={`/recettes/${recipe.uuid}`}>
            <div className="bg-secondary text-textPrimary p-2 rounded-md m-2 border-4 border-borderColor aspect-square hover:scale-95 transition duration-200">
                <h3 className="font-bold underline text-lg overflow-auto">{recipe.name}</h3>
                <p>pour {recipe.covers} pers.</p>
                <p>achat {recipe.buyPrice}€</p>
                <p>vente {recipe.sellPrice}€</p>
                <p>{recipe.steps.size ? recipe.steps.size : 0} étape{recipe.steps.size > 1 ? "s" : ""}</p>
            </div>
        </Link>
    );
}
