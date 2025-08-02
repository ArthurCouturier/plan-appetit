import { ChangeEvent } from "react";
import IngredientInterface from "../../api/interfaces/recipes/IngredientInterface";
import { SeasonEnum } from "../../api/enums/SeasonEnum";
import { UnitEnum } from "../../api/enums/UnitEnum";
import { IngredientCategoryEnum } from "../../api/enums/IngredientCategoryEnum";
import NumberField from "../fields/NumberField";
import UnitSelector from "../selectors/UnitSelector";
import SeasonSelector from "../selectors/SeasonSelector";
import SeasonDisplayer, { SeasonDisplayerExplaination } from "../displayers/SeasonDisplayer";
// import { IngredientCategoryLabels } from "../../api/constants/IngredientCategoryLabels";
import { UnitLabels } from "../../api/constants/UnitLabels";

export default function IngredientsList({
    ingredients,
    recipeEditMode,
    setRecipeEditMode,
    onChange,
    onSave,
    isMobile
}: {
    ingredients: IngredientInterface[];
    recipeEditMode?: boolean;
    setRecipeEditMode?: (editMode: boolean) => void;
    onChange?: (updatedIngredients: IngredientInterface[]) => void;
    onSave?: (ingredients: IngredientInterface[]) => void;
    isMobile: boolean;
}) {
    const handleIngredientChange = (ingredient: IngredientInterface, index: number) => {
        const updatedIngredients = [...ingredients];
        updatedIngredients[index] = ingredient;
        onChange?.(updatedIngredients);
    };

    const handleAddIngredient = () => {
        onChange?.([...ingredients, {
            name: "Ingrédient" + String(ingredients.length + 1),
            category: IngredientCategoryEnum.CEREAL,
            season: [SeasonEnum.FALL],
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
        <div className={`md:border-2 border-text-primary p-2 w-full rounded-md mb-4 text-text-primary ${recipeEditMode ? "border border-dashed" : null}`}>
            <SeasonDisplayerExplaination isMobile={isMobile} />
            <div className="flex justify-center items-center gap-2 md:gap-0">
                <h2 className="font-bold text-lg underline text-text-primary ">Ingredients</h2>
                {!(recipeEditMode === undefined) &&
                    <button
                        className="text-sm font-bold px-4 py-2 rounded-lg bg-confirmation-1 md:hover:bg-confirmation-2 text-text-primary md:p-2 md:rounded-md md:m-2 md:transition md:duration-200"
                        onClick={async () => {
                            if (recipeEditMode) {
                                await onSave?.(ingredients)
                            }
                            setRecipeEditMode?.(!recipeEditMode)
                        }}
                    >
                        {recipeEditMode ? "Sauvegarder" : "Modifier"}
                    </button>
                }
            </div>
            <div className="mx-auto flex-col md:w-min">
                {ingredients.map((ingredient, index) => (
                    <Ingredient
                        key={index}
                        ingredient={ingredient}
                        editMode={recipeEditMode}
                        onChange={(updatedIngredient) => handleIngredientChange(updatedIngredient, index)}
                        onRemove={() => handleRemoveIngredient(index)}
                        isMobile={isMobile}
                    />
                ))}
            </div>
            {recipeEditMode &&
                <button
                    className="text-text-primary text-sm font-bold px-4 py-2 rounded-lg mt-2 bg-confirmation-1 md:hover:bg-confirmation-2 md:p-2 md:rounded-md md:m-2 md:transition md:duration-200"
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
    onRemove,
    isMobile
}: {
    ingredient: IngredientInterface;
    editMode?: boolean;
    onChange?: (updatedIngredient: IngredientInterface) => void;
    onRemove?: () => void;
    isMobile: boolean;
}) {
    const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange?.({ ...ingredient, name: e.target.value });
    };

    const handleSeasonChange = (newSeason: SeasonEnum[]) => {
        onChange?.({ ...ingredient, season: newSeason });
    };

    const handleQuantityValueChange = (number: number) => {
        onChange?.({ ...ingredient, quantity: { value: number, unit: ingredient.quantity.unit } });
    };

    const handleQuantityUnitChange = (newUnit: UnitEnum) => {
        onChange?.({ ...ingredient, quantity: { value: ingredient.quantity.value, unit: newUnit } });
    };

    const handleCategoryChange = () => {
        onChange?.({ ...ingredient, category: IngredientCategoryEnum.CEREAL });
    };

    return (
        <div className="">
            {!editMode ? (
                isMobile ?
                    <DefaultModeMobile
                        ingredient={ingredient}
                    /> :
                    <DefaultModeDesktop
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
                    isMobile={isMobile}
                />
            )}
        </div>
    );
}

function DefaultModeDesktop({
    ingredient,
}: {
    ingredient: IngredientInterface;
}) {
    return (
        <li className="flex w-fit">
            <ul className="p-1">
                <SeasonDisplayer seasons={ingredient.season} />
            </ul>
            <ul className="p-1 w-max max-w-50 text-left">{ingredient.name}:</ul>
            <ul className="p-1">{ingredient.quantity.value}</ul>
            <ul className="p-1">
                {!(ingredient.quantity.unit == UnitEnum.NONE) ? UnitLabels[ingredient.quantity.unit] : ""}
                {ingredient.quantity.value > 1 ? "s" : ""}
            </ul>
            {/* <p className="p-1">{IngredientCategoryLabels[ingredient.category]}</p> */}
        </li>
    );
}

function DefaultModeMobile({
    ingredient,
}: {
    ingredient: IngredientInterface;
}) {
    return (
        <div className="flex w-full">
            <p className="p-1">
                <SeasonDisplayer seasons={ingredient.season} />
            </p>
            <p className="p-1 w-max max-w-50 text-left ">
                <span className="font-bold">{ingredient.name} : </span>
                {ingredient.quantity.value} {" "}
                <span className="lowercase">{!(ingredient.quantity.unit == UnitEnum.NONE) ? UnitLabels[ingredient.quantity.unit] : ""}</span>
                {ingredient.quantity.value > 1 ? "s" : ""}
            </p>
            {/* <p className="p-1">{ingredient.category}</p> */}
        </div>
    );
}

function EditMode({
    ingredient,
    setName,
    // setCategory,
    setSeason,
    setQuantityValue,
    setQuantityUnit,
    onRemove,
    isMobile
}: {
    ingredient: IngredientInterface;
    setName: (e: ChangeEvent<HTMLInputElement>) => void;
    setCategory: (e: ChangeEvent<HTMLInputElement>) => void;
    setSeason: (season: SeasonEnum[]) => void;
    setQuantityValue: (n: number) => void;
    setQuantityUnit: (newUnit: UnitEnum) => void;
    onRemove?: () => void;
    isMobile: boolean;
}) {
    return (
        <div className="flex my-1 text-gray-800 flex-col gap-6 items-center md:flex-row md:text-text-primary md:p-2 md:rounded-md md:m-2">
            <SeasonSelector initialSeason={ingredient.season} onChange={setSeason} />
            <input maxLength={70} className="mx-2 rounded-md bg-secondary border-2 border-border-color opacity-80 text-opacity-100 text-text-primary px-1" type="text" value={ingredient.name} onChange={setName} />
            {/* <input type="number" value={ingredient.category} onChange={setCategory} /> */}
            <div className="flex">
                <NumberField label="Quantité" value={ingredient.quantity.value} onChange={setQuantityValue} min={0} max={10000} isMobile={isMobile} />
                {/* <input type="number" value={ingredient.quantity.unit} onChange={setQuantityUnit} /> */}
                <UnitSelector actualUnit={ingredient.quantity.unit} onChange={setQuantityUnit} />
            </div>
            <button
                className="rounded-md py-1 px-2 text-text-primary font-bold w-min bg-cancel-1 md:hover:bg-cancel-2  md:p-1 md:m-2 md:transition md:duration-200"
                onClick={onRemove}
            >
                Supprimer
            </button>
        </div >
    );
}
