import ModuleCard from "../cards/ModuleCard"
import ConfigurationInterface from "../../api/interfaces/configurations/ConfigurationInterface";
import SubPart from "./SubPart";
import { getAverageBasketPerWeek, mealsCookedPerWeek, totalWeeklySales, workedDaysPerWeek, workedMealsPerWeek } from "../../api/modules/StatisticsPerWeek";

export default function SuperNovaModule({
    config
}: {
    config: ConfigurationInterface
}) {
    const annualSales = totalWeeklySales(config.week) * config.stats.workedWeeks;
    const averageMealsPerDay = (mealsCookedPerWeek(config.week) / workedDaysPerWeek(config.week)).toFixed(0);
    const averageMealsPerMeal = (mealsCookedPerWeek(config.week) / workedMealsPerWeek(config.week)).toFixed(0);
    const workedDays = workedDaysPerWeek(config.week) * config.stats.workedWeeks;
    const mealsCooked = mealsCookedPerWeek(config.week) * config.stats.workedWeeks;
    const averageBasket = getAverageBasketPerWeek(config.week);

    return (
        <ModuleCard moduleName="SuperNova">
            <SubPart title="C.A. Annuel" line={true} >
                {annualSales} €
            </SubPart>
            <SubPart title="qtés moy. couverts / jour travaillé" line={true}>
                {averageMealsPerDay}
            </SubPart>
            <SubPart title="qtés moy. couverts / repas travaillé" line={true}>
                {averageMealsPerMeal}
            </SubPart>
            <SubPart title="nb jours / an" line={true}>
                {workedDays}
            </SubPart>
            <SubPart title="qtés couverts / an" line={true}>
                {mealsCooked}
            </SubPart>
            <SubPart title="prix de vente unitaire (H.T.)" line={true}>
                {averageBasket} €
            </SubPart>
        </ModuleCard>
    )
}
