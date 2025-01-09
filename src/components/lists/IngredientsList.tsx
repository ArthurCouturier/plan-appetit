import { ChangeEvent } from "react";
import IngredientInterface from "../../api/interfaces/recipes/IngredientInterface";
import { SeasonEnum } from "../../api/enums/SeasonEnum";
import { UnitEnum } from "../../api/enums/UnitEnum";
import { IngredientCategoryEnum } from "../../api/enums/IngredientCategoryEnum";
import { v4 as uuidv4 } from "uuid";

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
        <div className="">
            <div className="flex justify-center items-center">
                <h2>Ingredients</h2>
                {!(recipeEditMode === undefined) &&
                    <button
                        className="bg-confirmation1 hover:bg-confirmation2 text-textPrimary p-2 rounded-md m-2 transition duration-200"
                        onClick={() => setRecipeEditMode?.(!recipeEditMode)}
                    >
                        {recipeEditMode ? "Annuler" : "Modifier"}
                    </button>
                }
            </div>
            {recipeEditMode &&
                <button onClick={handleAddIngredient}>Add ingredient</button>
            }
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

    const handleQuantityValueChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange?.({ ...ingredient, quantity: { value: parseFloat(e.target.value), unit: ingredient.quantity.unit } });
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
    setCategory,
    setSeason,
    setQuantityValue,
    setQuantityUnit,
    onRemove,
}: {
    ingredient: IngredientInterface;
    setName: (e: ChangeEvent<HTMLInputElement>) => void;
    setCategory: (e: ChangeEvent<HTMLInputElement>) => void;
    setSeason: (e: ChangeEvent<HTMLInputElement>) => void;
    setQuantityValue: (e: ChangeEvent<HTMLInputElement>) => void;
    setQuantityUnit: (e: ChangeEvent<HTMLInputElement>) => void;
    onRemove?: () => void;
}) {
    return (
        <div className="">
            <input type="text" value={ingredient.name} onChange={setName} />
            <input type="number" value={ingredient.category} onChange={setCategory} />
            <input type="number" value={ingredient.season} onChange={setSeason} />
            <input type="number" value={ingredient.quantity.value} onChange={setQuantityValue} />
            <input type="number" value={ingredient.quantity.unit} onChange={setQuantityUnit} />
            <button onClick={onRemove}>Remove</button>
        </div>
    );
}

function DefaultMode({
    ingredient,
}: {
    ingredient: IngredientInterface;
}) {
    return (
        <div className="">
            <p>{ingredient.name}</p>
            <p>{ingredient.category}</p>
            <p>{ingredient.season}</p>
            <p>{ingredient.quantity.value}</p>
            <p>{ingredient.quantity.unit}</p>
        </div>
    );
}
