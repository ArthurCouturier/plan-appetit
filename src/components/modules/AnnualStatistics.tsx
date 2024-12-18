import { useEffect, useState } from "react";
import ModuleCard from "../ModuleCard";
import NumberField from "../NumberField";
import SubPart from "./SubPart";
import ConfigurationInterface from "../../api/ConfigurationInterface";
import { mealsCookedPerWeek, workedDaysPerWeek, workedMealsPerWeek } from "../../api/modules/StatisticsPerWeek";

export default function AnnualStatistics({
    config,
    saveConfig
}: {
    config: ConfigurationInterface;
    saveConfig: (config: ConfigurationInterface) => void;
}) {

    const [workedWeeks, setWorkedWeeks] = useState<number>(config.stats.workedWeeks);

    const handleChangeWorkedWeeks = (value: number) => {
        setWorkedWeeks(value);
        config.stats.workedWeeks = value;
        saveConfig(config);
    }

    useEffect(() => {
        setWorkedWeeks(config.stats.workedWeeks);
    }, [config]);

    return (
        <ModuleCard moduleName="Statistiques annuelles">
            <NumberField label={"Semaines travaillées"} value={workedWeeks} onChange={handleChangeWorkedWeeks} min={0} max={52} />
            <SubPart title="Jours travaillés">
                {workedWeeks * workedDaysPerWeek(config.week)} / 365
            </SubPart>
            <SubPart title="Services réalisés">
                {workedWeeks * workedMealsPerWeek(config.week)}
            </SubPart>
            <SubPart title="Couverts réalisés">
                {workedWeeks * mealsCookedPerWeek(config.week)}
            </SubPart>
        </ModuleCard>
    );
}
