import SubPart from "./SubPart";
import ModuleCard from "../cards/ModuleCard";
import { getAverageBasketPerDay, getAverageDrinkBasketPerDay, getAverageLunchBasketPerDay, getTotalDrinkOfTheDay, getTotalLunchOfTheDay, getTotalOfTheDay } from "../../api/modules/StatisticsPerDay";
import { getTotalAverage, getTotalOfTheMeal } from "../../api/modules/StatisticsPerMeal";
import DayInterface from "../../api/interfaces/configurations/DayInterface";

export default function DayStatistics({
    day
}: {
    day: DayInterface
}) {
    const totalLunchOfTheDay = getTotalLunchOfTheDay(day);
    const totalDrinkOfTheDay = getTotalDrinkOfTheDay(day);
    const totalOfTheDay = getTotalOfTheDay(day);

    const averageLunchBasketPerWeek = getAverageLunchBasketPerDay(day);
    const averageDrinkBasketPerWeek = getAverageDrinkBasketPerDay(day);
    const averageBasketPerWeek = getAverageBasketPerDay(day);

    const totalOfMidday = getTotalOfTheMeal(day.meals[0]);
    const averageOfMidday = getTotalAverage(day.meals[0]);
    const totalOfEvening = getTotalOfTheMeal(day.meals[1]);
    const averageOfEvening = getTotalAverage(day.meals[1]);

    return (
        <ModuleCard moduleName="">
            <div className="text-text-secondary my-2 h-full">
                <div className="mt-2">
                    <SubPart title="C.A. de la journée 💰">
                        <div className="grid grid-cols-2 items-center text-right">
                            <p>Nourriture journalière:</p> <p className="text-left ml-4"> {totalLunchOfTheDay}€</p>
                            <p>Boisson journalière:</p> <p className="text-left ml-4"> {totalDrinkOfTheDay}€</p>
                            <p>Total journalier:</p> <p className="text-left ml-4"> {totalOfTheDay}€ ({totalOfMidday}€ midi, {totalOfEvening}€ soir)</p>
                        </div>
                    </SubPart>
                    <SubPart title="Paniers moyens sur la journée 🧺">
                        <div className="grid grid-cols-2 items-center text-right">
                            <p>Nourriture moyenne journalière:</p> <p className="text-left ml-4"> {averageLunchBasketPerWeek != "NaN" ? averageLunchBasketPerWeek : (0).toFixed(2)}€ / pers.</p>
                            <p>Boisson moyenne journalière:</p> <p className="text-left ml-4"> {averageDrinkBasketPerWeek != "NaN" ? averageDrinkBasketPerWeek : (0).toFixed(2)}€ / pers.</p>
                            <p>Total moyen journalier:</p> <p className="text-left ml-4"> {averageBasketPerWeek != "NaN" ? averageBasketPerWeek : (0).toFixed(2)}€ / pers.</p>
                        </div>
                    </SubPart>
                    {
                        !day &&
                        <SubPart title="Paniers moyens sur le midi ☀️">
                            <div className="grid grid-cols-2 items-center text-right">
                                <p>Total:</p> <p className="text-left ml-4"> {averageOfMidday}€ / pers.</p>
                            </div>
                        </SubPart>
                    }
                    {
                        !day &&
                        <SubPart title="Paniers moyens sur la soirée 🌙">
                            <div className="grid grid-cols-2 items-center text-right">
                                <p>Total:</p> <p className="text-left ml-4"> {averageOfEvening}€ / pers.</p>
                            </div>
                        </SubPart>
                    }
                </div>
            </div>
        </ModuleCard>
    )
}