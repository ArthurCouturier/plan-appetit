import { useState } from "react";
import ConfigurationInterface, { DayProps } from "../../api/ConfigurationInterface"
import DaySelector from "../DaySelector";
import SubPart from "./SubPart";
import ModuleCard from "../ModuleCard";
import { getAverageBasketPerDay, getAverageDrinkBasketPerDay, getAverageLunchBasketPerDay, getTotalDrinkOfTheDay, getTotalLunchOfTheDay, getTotalOfTheDay } from "../../api/modules/StatisticsPerDay";
import { getAverageOfTheMeal, getTotalOfTheMeal } from "../../api/modules/StatisticsPerMeal";

export default function DayStatistics({
    config
}: {
    config: ConfigurationInterface
}) {

    const [selectedDay, setSelectedDay] = useState<DayProps>(config.week.days[0]);

    const totalLunchOfTheDay = getTotalLunchOfTheDay(selectedDay);
    const totalDrinkOfTheDay = getTotalDrinkOfTheDay(selectedDay);
    const totalOfTheDay = getTotalOfTheDay(selectedDay);

    const averageLunchBasketPerWeek = getAverageLunchBasketPerDay(selectedDay);
    const averageDrinkBasketPerWeek = getAverageDrinkBasketPerDay(selectedDay);
    const averageBasketPerWeek = getAverageBasketPerDay(selectedDay);

    const totalOfMidday = getTotalOfTheMeal(selectedDay.meals[0]);
    const averageOfMidday = getAverageOfTheMeal(selectedDay.meals[0]);
    const totalOfEvening = getTotalOfTheMeal(selectedDay.meals[1]);
    const averageOfEvening = getAverageOfTheMeal(selectedDay.meals[1]);

    return (
        <ModuleCard moduleName="Statistiques journalières">
            <div className="text-textSecondary my-2">
                <DaySelector days={config.week.days} selectedDay={selectedDay} setSelectedDay={setSelectedDay} />
                <div className="mt-2">
                    <SubPart title="C.A. de la journée 🧺">
                        <div className="grid grid-cols-2 items-center text-right">
                            <p>Nourriture journalière:</p> <p className="text-left ml-4"> {totalLunchOfTheDay}€</p>
                            <p>Boisson journalière:</p> <p className="text-left ml-4"> {totalDrinkOfTheDay}€</p>
                            <p>Total journalier:</p> <p className="text-left ml-4"> {totalOfTheDay}€ ({totalOfMidday}€ midi, {totalOfEvening}€ soir)</p>
                        </div>
                    </SubPart>
                    <SubPart title="Paniers moyens sur la journée 🧺">
                        <div className="grid grid-cols-2 items-center text-right">
                            <p>Nourriture moyenne journalière:</p> <p className="text-left ml-4"> {averageLunchBasketPerWeek}€ / pers.</p>
                            <p>Boisson moyenne journalière:</p> <p className="text-left ml-4"> {averageDrinkBasketPerWeek}€ / pers.</p>
                            <p>Total moyen journalier:</p> <p className="text-left ml-4"> {averageBasketPerWeek}€ / pers.</p>
                        </div>
                    </SubPart>
                    <SubPart title="Paniers moyens sur le midi ☀️">
                        <div className="grid grid-cols-2 items-center text-right">
                            <p>Total:</p> <p className="text-left ml-4"> {averageOfMidday}€ / pers.</p>
                        </div>
                    </SubPart>
                    <SubPart title="Paniers moyens sur la soirée 🌙">
                        <div className="grid grid-cols-2 items-center text-right">
                            <p>Total:</p> <p className="text-left ml-4"> {averageOfEvening}€ / pers.</p>
                        </div>
                    </SubPart>
                </div>
            </div>
        </ModuleCard>
    )
}