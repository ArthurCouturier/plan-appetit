import { useEffect, useState } from "react";
import MealInterface from "../api/interfaces/MealInterface";
import { getTotalAverage } from "../api/modules/StatisticsPerMeal";
import NumberField from "./NumberField";

export default function Meal({
    covers,
    starterPrice,
    mainCoursePrice,
    dessertPrice,
    drinkPrice,
    editMode,
    onChange
}: MealInterface & {
    editMode: boolean;
    onChange?: (updatedMeal: MealInterface) => void;
}) {
    const handleCoversChange = (value: number) => {
        onChange?.({ covers: value, starterPrice: starterPrice, mainCoursePrice: mainCoursePrice, dessertPrice: dessertPrice, drinkPrice });
    };

    const handleStarterPriceChange = (value: number) => {
        onChange?.({ covers: covers, starterPrice: value, mainCoursePrice: mainCoursePrice, dessertPrice: dessertPrice, drinkPrice });
    };

    const handleMainCoursePriceChange = (value: number) => {
        onChange?.({ covers: covers, starterPrice: starterPrice, mainCoursePrice: value, dessertPrice: dessertPrice, drinkPrice });
    };

    const handleDessertPriceChange = (value: number) => {
        onChange?.({ covers: covers, starterPrice: starterPrice, mainCoursePrice: mainCoursePrice, dessertPrice: value, drinkPrice });
    };

    const handleDrinkPriceChange = (value: number) => {
        onChange?.({ covers: covers, starterPrice: starterPrice, mainCoursePrice: mainCoursePrice, dessertPrice: dessertPrice, drinkPrice: value });
    };

    return (
        <div className="">
            {editMode ? (
                <EditMode
                    covers={covers}
                    starterPrice={starterPrice}
                    mainCoursePrice={mainCoursePrice}
                    dessertPrice={dessertPrice}
                    drinkPrice={drinkPrice}
                    setCovers={handleCoversChange}
                    setStarterPrice={handleStarterPriceChange}
                    setMainCoursePrice={handleMainCoursePriceChange}
                    setDessertPrice={handleDessertPriceChange}
                    setDrinkPrice={handleDrinkPriceChange}
                />
            ) : (
                <DefaultMode
                    covers={covers}
                    starterPrice={starterPrice}
                    mainCoursePrice={mainCoursePrice}
                    dessertPrice={dessertPrice}
                    drinkPrice={drinkPrice}
                />
            )}
        </div>
    );
}

function DefaultMode({
    covers,
    starterPrice,
    mainCoursePrice,
    dessertPrice,
    drinkPrice
}: MealInterface
) {
    const [average, setAverage] = useState<number>(getTotalAverage({ covers, starterPrice, mainCoursePrice, dessertPrice, drinkPrice }));

    useEffect(() => {
        setAverage(getTotalAverage({ covers, starterPrice, mainCoursePrice, dessertPrice, drinkPrice }))
    }, [covers, mainCoursePrice, drinkPrice]);

    return (
        <div className="flex justify-between items-center text-sm text-textSecondary">
            <div className="flex">
                <p className="mr-4">Couverts: {covers}</p>
                <p className="mr-4">Entrée: {starterPrice}</p>
                <p className="mr-4">Plat: {mainCoursePrice}</p>
                <p className="mr-4">Dessert: {dessertPrice}</p>
                <p>Boisson: {drinkPrice}</p>
            </div>
            <div className="">
                <p className="mr-2 md:mr-5 lg:mr-10 xl:mr-16">moy./pers.: {average}</p>
            </div>
        </div>
    );
}

function EditMode({
    covers,
    starterPrice,
    mainCoursePrice,
    dessertPrice,
    drinkPrice,
    setCovers,
    setStarterPrice,
    setMainCoursePrice,
    setDessertPrice,
    setDrinkPrice
}: {
    covers: number;
    starterPrice: number;
    mainCoursePrice: number;
    dessertPrice: number;
    drinkPrice: number;
    setCovers: (value: number) => void;
    setStarterPrice: (value: number) => void;
    setMainCoursePrice: (value: number) => void;
    setDessertPrice: (value: number) => void;
    setDrinkPrice: (value: number) => void;
}) {
    return (
        <div className="grid grid-cols-[auto,1fr] gap-x-2 gap-y-2 w-fit items-center">
            <p className="text-sm text-textSecondary text-right">Couverts</p>
            <NumberField label="" value={covers} onChange={setCovers} min={0} max={9999} />
            <p className="text-sm text-textSecondary text-right">Entrée</p>
            <NumberField label="" value={starterPrice} onChange={setStarterPrice} min={0} max={9999} />
            <p className="text-sm text-textSecondary text-right">Plat</p>
            <NumberField label="" value={mainCoursePrice} onChange={setMainCoursePrice} min={0} max={9999} />
            <p className="text-sm text-textSecondary text-right">Dessert</p>
            <NumberField label="" value={dessertPrice} onChange={setDessertPrice} min={0} max={9999} />
            <p className="text-sm text-textSecondary text-right">Boisson</p>
            <NumberField label="" value={drinkPrice} onChange={setDrinkPrice} min={0} max={9999} />
        </div>
    );
}
