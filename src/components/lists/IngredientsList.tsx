import { ChangeEvent } from "react";
import IngredientInterface from "../../api/interfaces/recipes/IngredientInterface";
import { SeasonEnum } from "../../api/enums/SeasonEnum";
import { UnitEnum } from "../../api/enums/UnitEnum";
import { IngredientCategoryEnum } from "../../api/enums/IngredientCategoryEnum";
import { v4 as uuidv4 } from "uuid";
import NumberField from "../fields/NumberField";

export default function IngredientsList({
    ingredients,
    recipeEditMode,
    setRecipeEditMode,
    onChange
}: {
    ingredients: IngredientInterface[];
    recipeEditMode?: boolean;
    setRecipeEditMode?: (editMode: boolean) => void;
    onChange?: (updatedIngredients: IngredientInterface[]) => void;
}) {
    const handleIngredientChange = (ingredient: IngredientInterface, index: number) => {
        const updatedIngredients = [...ingredients];
        updatedIngredients[index] = ingredient;
        onChange?.(updatedIngredients);
    };

    const handleAddIngredient = () => {
        onChange?.([...ingredients, {
            uuid: uuidv4(),
            name: "Ingrédient" + String(ingredients.length + 1),
            category: IngredientCategoryEnum.CEREAL,
            season: SeasonEnum.FALL,
            quantity: {
                value: 0,
                unit: UnitEnum.CENTILITER
            }
        }])
    };

    const handleRemoveIngredient = (index: number) => {
        const updatedIngredients = [...ingredients];
        updatedIngredients.splice(index, 1);
        onChange?.(updatedIngredients);
    };

    return (
        <div className="border-2 border-textPrimary p-2 rounded-md">
            <div className="flex justify-center items-center">
                <h2 className="font-bold text-lg underline text-textPrimary">Ingredients</h2>
                {!(recipeEditMode === undefined) &&
                    <button
                        className={`bg-confirmation1 hover:bg-confirmation2 text-textPrimary p-2 rounded-md m-2 transition duration-200`}
                        onClick={() => setRecipeEditMode?.(!recipeEditMode)}
                    >
                        {recipeEditMode ? "Sauvegarder" : "Modifier"}
                    </button>
                }
            </div>
            <div className="w-min mx-auto">
                {ingredients.map((ingredient, index) => (
                    <Ingredient
                        key={index}
                        ingredient={ingredient}
                        editMode={recipeEditMode}
                        onChange={(updatedIngredient) => handleIngredientChange(updatedIngredient, index)}
                        onRemove={() => handleRemoveIngredient(index)}
                    />
                ))}
            </div>
            {recipeEditMode &&
                <button
                    className="bg-confirmation1 hover:bg-confirmation2 text-textPrimary p-2 rounded-md m-2 transition duration-200"
                    onClick={handleAddIngredient}
                >
                    Ajouter ingrédient
                </button>
            }
        </div>
    );
}

export function Ingredient({
    ingredient,
    editMode,
    onChange,
    onRemove
}: {
    ingredient: IngredientInterface;
    editMode?: boolean;
    onChange?: (updatedIngredient: IngredientInterface) => void;
    onRemove?: () => void;
}) {
    const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange?.({ ...ingredient, name: e.target.value });
    };

    const handleSeasonChange = () => {
        onChange?.({ ...ingredient, season: SeasonEnum.FALL });
    };

    const handleQuantityValueChange = (number: number) => {
        onChange?.({ ...ingredient, quantity: { value: number, unit: ingredient.quantity.unit } });
    };

    const handleQuantityUnitChange = () => {
        onChange?.({ ...ingredient, quantity: { value: ingredient.quantity.value, unit: UnitEnum.CENTILITER } });
    };

    const handleCategoryChange = () => {
        onChange?.({ ...ingredient, category: IngredientCategoryEnum.CEREAL });
    };

    return (
        <div className="">
            {!editMode ? (
                <DefaultMode
                    ingredient={ingredient}
                />
            ) : (
                <EditMode
                    ingredient={ingredient}
                    setName={handleNameChange}
                    setCategory={handleCategoryChange}
                    setSeason={handleSeasonChange}
                    setQuantityValue={handleQuantityValueChange}
                    setQuantityUnit={handleQuantityUnitChange}
                    onRemove={onRemove}
                />
            )}
        </div>
    );
}

function EditMode({
    ingredient,
    setName,
    // setCategory,
    // setSeason,
    setQuantityValue,
    // setQuantityUnit,
    onRemove,
}: {
    ingredient: IngredientInterface;
    setName: (e: ChangeEvent<HTMLInputElement>) => void;
    setCategory: (e: ChangeEvent<HTMLInputElement>) => void;
    setSeason: (e: ChangeEvent<HTMLInputElement>) => void;
    setQuantityValue: (n: number) => void;
    setQuantityUnit: (e: ChangeEvent<HTMLInputElement>) => void;
    onRemove?: () => void;
}) {
    return (
        <div className="flex my-1 text-gray-800">
            <input className="mx-2 rounded-md bg-secondary border-2 border-borderColor opacity-80 text-opacity-100 text-textPrimary px-1" type="text" value={ingredient.name} onChange={setName} />
            {/* <input type="number" value={ingredient.category} onChange={setCategory} />
            <input type="number" value={ingredient.season} onChange={setSeason} /> */}
            <NumberField label="Quantité" value={ingredient.quantity.value} onChange={setQuantityValue} min={0} max={30} />
            {/* <input type="number" value={ingredient.quantity.unit} onChange={setQuantityUnit} /> */}
            <button
                className="bg-cancel1 hover:bg-cancel2 text-textPrimary p-1 rounded-md m-2 transition duration-200"
                onClick={onRemove}
            >
                Remove
            </button>
        </div>
    );
}

function DefaultMode({
    ingredient,
}: {
    ingredient: IngredientInterface;
}) {
    return (
        <div className="flex">
            <p className="p-1">{ingredient.quantity.value}</p>
            {/* <p className="p-1">{ingredient.quantity.unit}</p> */}
            <p className="p-1">{ingredient.name}</p>
            {/* <p className="p-1">{ingredient.category}</p>
            <p className="p-1">{ingredient.season}</p> */}
        </div>
    );
}
