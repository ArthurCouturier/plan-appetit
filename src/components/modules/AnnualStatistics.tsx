import { useEffect, useState } from "react";
import ModuleCard from "../cards/ModuleCard";
import NumberField from "../fields/NumberField";
import SubPart from "./SubPart";
import ConfigurationInterface from "../../api/interfaces/configurations/ConfigurationInterface";
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
            <div className="grid grid-cols-[auto,1fr] gap-x-2 gap-y-2 w-fit items-center text-black bg-bgColor mx-auto px-4 py-2 my-2 rounded-lg">
                <p className="text-sm text-textSecondary text-right">Semaines travaillées</p>
                <NumberField label="" value={workedWeeks} onChange={handleChangeWorkedWeeks} min={0} max={9999} />
            </div>
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
