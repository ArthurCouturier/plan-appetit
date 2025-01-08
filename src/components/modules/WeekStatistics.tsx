import ModuleCard from "../ModuleCard";
import ConfigurationInterface from "../../api/interfaces/ConfigurationInterface";
import { getAverageBasketPerWeek, getAverageDrinkBasketPerWeek, getAverageLunchBasketPerWeek, getCoversPerWeek } from "../../api/modules/StatisticsPerWeek";
import SubPart from "./SubPart";

export default function WeekStatistics({
    config
}: {
    config: ConfigurationInterface
}) {
    const averageBasketPerWeek = getAverageBasketPerWeek(config.week);
    const averageDrinkBasketPerWeek = getAverageDrinkBasketPerWeek(config.week);
    const averageLunchBasketPerWeek = getAverageLunchBasketPerWeek(config.week);
    const nbCovers = getCoversPerWeek(config.week);

    return (
        <ModuleCard moduleName="Statistiques de la semaine">
            <SubPart title="Paniers moyens sur la semaine 🧺">
                <div className="grid grid-cols-2 items-center text-right">
                    <p>Total journalier:</p> <p className="text-left ml-4"> {averageBasketPerWeek}€ / pers.</p>
                    <p>Boisson journalière:</p> <p className="text-left ml-4"> {averageDrinkBasketPerWeek}€ / pers.</p>
                    <p>Nourriture journalière:</p> <p className="text-left ml-4"> {averageLunchBasketPerWeek}€ / pers.</p>
                </div>
            </SubPart>
            <SubPart title="Couverts 🍽️">
                <p>Nombre de couverts sur la semaine: {nbCovers}</p>
                <p>Moyenne de couverts par jour: {(nbCovers / config.week.days.length).toFixed(2)}</p>
            </SubPart>
        </ModuleCard>
    );
}
