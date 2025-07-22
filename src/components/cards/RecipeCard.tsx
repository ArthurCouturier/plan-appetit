import { Link, useNavigate } from "react-router-dom";
import RecipeInterface from "../../api/interfaces/recipes/RecipeInterface";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { Button } from "@material-tailwind/react";
import { useState } from "react";


export default function RecipeCard({
    recipe,
    isMobile
}: {
    recipe: RecipeInterface;
    isMobile: boolean;
}) {

    const [showDetails, setShowDetails] = useState(false)

    const handleClick = () => {
        if (showDetails) {
            setShowDetails(false)
        } else {
            setShowDetails(true)
        }
    }

    const nbrEtapes = recipe.steps.length;

    const navigateTo = useNavigate();

    return (
        isMobile ? 
        <div className="bg-blue-600 mr-4w-screen max-w-max rounded-xl flex-col text-left p-2">
            <button className="text-left text-white flex gap-2" onClick={() => handleClick()}>
                <div>
                    <h2 className="font-bold first-letter:uppercase lowercase">{recipe.name}<span className="font-normal"> ({recipe.covers} pers)</span></h2>
                    {showDetails ? 
                    <div className="px-4">
                        <li>prix d'achat : {recipe.buyPrice} € </li>
                        <li>prix de vente : {recipe.sellPrice} € </li>
                        <li>{nbrEtapes} étape{nbrEtapes > 1 ? "s" : ""}</li>
                    </div>
                    : null}
                </div>
                <ArrowRightIcon className={`w-6 h-6 text-white transition-opacity duration-300 ${showDetails ? "rotate-90" : null}`}/>
            </button>
            {showDetails ? 
            <div className="flex justify-center"> 
                {/* Je n'arrive pas à mettre le V en majuscule */}
                <Button onClick={() => navigateTo(`/recettes/${recipe.uuid}`)} className="bg-blue-900 px-3">👩‍🍳 <span className="first-letter:uppercase lowercase">Voir la recette </span> 👨‍🍳</Button>
            </div>
            : null
            }
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
