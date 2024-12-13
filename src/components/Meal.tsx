import { MealProps } from "../api/ConfigurationInterface";
import NumberField from "./NumberField";

export default function Meal({
    covers,
    lunchPrice,
    drinkPrice,
    editMode,
    onChange
}: MealProps & {
    editMode: boolean;
    onChange?: (updatedMeal: MealProps) => void;
}) {
    // Gestion des changements locaux si `onChange` est fourni
    const handleCoversChange = (value: number) => {
        onChange?.({ covers: value, lunchPrice, drinkPrice });
    };

    const handleLunchPriceChange = (value: number) => {
        onChange?.({ covers, lunchPrice: value, drinkPrice });
    };

    const handleDrinkPriceChange = (value: number) => {
        onChange?.({ covers, lunchPrice, drinkPrice: value });
    };

    return (
        <div className="border-4 border-gray-300 rounded-md p-2">
            {editMode ? (
                <EditMode
                    covers={covers}
                    lunchPrice={lunchPrice}
                    drinkPrice={drinkPrice}
                    setCovers={handleCoversChange}
                    setLunchPrice={handleLunchPriceChange}
                    setDrinkPrice={handleDrinkPriceChange}
                />
            ) : (
                <DefaultMode
                    covers={covers}
                    lunchPrice={lunchPrice}
                    drinkPrice={drinkPrice}
                />
            )}
        </div>
    );
}

function DefaultMode({ covers, lunchPrice, drinkPrice }: MealProps) {
    return (
        <div className="flex justify-between items-center text-sm text-gray-600 mx-2">
            <div className="flex">
                <p className="mr-4">Couverts: {covers}</p>
                <p className="mr-4">Nourriture: {lunchPrice}</p>
                <p>Boisson: {drinkPrice}</p>
            </div>
        </div>
    );
}

function EditMode({
    covers,
    lunchPrice,
    drinkPrice,
    setCovers,
    setLunchPrice,
    setDrinkPrice
}: {
    covers: number;
    lunchPrice: number;
    drinkPrice: number;
    setCovers: (value: number) => void;
    setLunchPrice: (value: number) => void;
    setDrinkPrice: (value: number) => void;
}) {
    return (
        <div className="flex flex-col space-y-2">
            <NumberField label="Couverts" value={covers} onChange={setCovers} />
            <NumberField label="Nourriture" value={lunchPrice} onChange={setLunchPrice} />
            <NumberField label="Boisson" value={drinkPrice} onChange={setDrinkPrice} />
        </div>
    );
}
