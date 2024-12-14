import ModuleCard from "../ModuleCard";
import ConfigurationInterface from "../../api/ConfigurationInterface";
import { getAverageBasketPerWeek, getCoversPerWeek } from "../../api/modules/Statistics";

export default function WeekStatistics({
    config
}: {
    config: ConfigurationInterface
}) {
    const averageBasketPerDay = getAverageBasketPerWeek(config.week);
    const nbCovers = getCoversPerWeek(config.week);

    return (
        <ModuleCard moduleName="Statistiques de la semaine">
            <SubPart title="Panier 🧺">
                <p>Panier moyen journalier sur la semaine: {averageBasketPerDay}€</p>
            </SubPart>
            <SubPart title="Couverts 🍽️">
                <p>Nombre de couverts sur la semaine: {nbCovers}</p>
                <p>Moyenne de couverts par jour: {(nbCovers / config.week.days.length).toFixed(2)}</p>
            </SubPart>
        </ModuleCard>
    );
}

function SubPart({
    title,
    children
}: {
    title: string,
    children?: React.ReactNode
}) {
    return (
        <div className="my-2">
            <h2 className="text-textSecondary font-semibold">{title}</h2>
            {children}
        </div>
    );
}
