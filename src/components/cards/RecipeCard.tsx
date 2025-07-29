import { useNavigate } from "react-router-dom";
import RecipeInterface from "../../api/interfaces/recipes/RecipeInterface";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { Button } from "@material-tailwind/react";
import { useState } from "react";


export default function RecipeCard({
    recipe,
    isMobile
}: {
    recipe: RecipeInterface;
    isMobile?: boolean;
}) {

    return (
        isMobile ? <RecipeCardMobile recipe={recipe} /> : <RecipeCardDesktop recipe={recipe} />
    );
}

function RecipeCardMobile({
    recipe
}: {
    recipe: RecipeInterface
}) {

    const navigateTo = useNavigate();

    const nbrEtapes = recipe.steps.length;

    const [showDetails, setShowDetails] = useState(false)

    const handleClick = () => {
        if (showDetails) {
            setShowDetails(false)
        } else {
            setShowDetails(true)
        }
    }

    return (
        <div className="bg-primary mr-4w-screen max-w-max rounded-xl flex-col text-left p-2">
            <button className="text-left text-text-primary flex gap-2" onClick={() => handleClick()}>
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
                <ArrowRightIcon
                    className={`
                        w-6 h-6 text-text-primary
                        transform transition-transform duration-300
                        ${showDetails ? "rotate-90" : "rotate-0"}
                        `}
                />
            </button>
            {showDetails ?
                <div className="flex justify-center">
                    <Button
                        onClick={() => navigateTo(`/recettes/${recipe.uuid}`)}
                        className="text-text-primary first-letter:uppercase lowercase bg-thirdary px-3" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                        Voir la recette
                    </Button>
                </div>
                : null
            }
        </div>
    )
}

function RecipeCardDesktop({
    recipe
}: {
    recipe: RecipeInterface
}) {

    const navigate = useNavigate();

    return (
        <button onClick={() => navigate(`/recettes/${recipe.uuid}`)}>
            <div className="bg-secondary text-text-primary p-2 rounded-md m-2 border-4 border-border-color aspect-square hover:scale-95 transition duration-200">
                <h3 className="font-bold underline text-lg overflow-auto">{recipe.name}</h3>
                <p>pour {recipe.covers} pers.</p>
                <p>achat {recipe.buyPrice}€</p>
                <p>vente {recipe.sellPrice}€</p>
                <p>{recipe.steps.length ? recipe.steps.length : 0} étape{recipe.steps.length > 1 ? "s" : ""}</p>
            </div>
        </button>
    )
}
