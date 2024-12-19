import { useEffect, useState } from "react";
import { MealProps } from "../api/ConfigurationInterface";
import { getAverageOfTheMeal } from "../api/modules/StatisticsPerMeal";
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
        <div className="">
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
    const [average, setAverage] = useState<number>(getAverageOfTheMeal({ covers, lunchPrice, drinkPrice }));

    useEffect(() => {
        setAverage(getAverageOfTheMeal({ covers, lunchPrice, drinkPrice }))
    }, [covers, lunchPrice, drinkPrice]);

    return (
        <div className="flex justify-between items-center text-sm text-textSecondary">
            <div className="flex">
                <p className="mr-4">Couverts: {covers}</p>
                <p className="mr-4">Nourriture: {lunchPrice}</p>
                <p>Boisson: {drinkPrice}</p>
            </div>
            <div className="">
                <p className="mr-2 md:mr-5 lg:mr-10 xl:mr-16">moy.: {average}</p>
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
        <div className="grid grid-cols-[auto,1fr] gap-x-2 gap-y-2 w-fit items-center">
            <p className="text-sm text-textSecondary text-right">Couverts</p>
            <NumberField label="" value={covers} onChange={setCovers} min={0} max={9999} />
            <p className="text-sm text-textSecondary text-right">Nourriture</p>
            <NumberField label="" value={lunchPrice} onChange={setLunchPrice} min={0} max={9999} />
            <p className="text-sm text-textSecondary text-right">Boisson</p>
            <NumberField label="" value={drinkPrice} onChange={setDrinkPrice} min={0} max={9999} />
        </div>
    );
}
