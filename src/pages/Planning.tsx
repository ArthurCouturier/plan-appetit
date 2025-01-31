import { useState } from "react";
import ConfigurationInterface from "../api/interfaces/configurations/ConfigurationInterface";
import Configurator from "../api/configurations/Configurator";
import Week from "../components/configurations/Week";
import Statistics from "../components/statistics/Statistics";
import ConfigurationSelector from "../components/configurations/ConfigurationSelector";
import { ExportConfigurationButton, ImportConfigurationButton } from "../components/buttons/DataImportButtons";
import { HomeButton } from "../components/buttons/BackAndHomeButton";

export default function Planning() {

    const [configs, setConfigs] = useState<ConfigurationInterface[]>(Configurator.fetchConfigurations());

    const [lastConfigViewedNumber, setLastConfigViewedNumber] = useState<string>(Configurator.getLastConfigViewedNumber());

    const [actualConfig, setActualConfig] = useState<ConfigurationInterface>(Configurator.getConfigByUuid(lastConfigViewedNumber));

    const handleFetchConfigurations = () => {
        setConfigs(Configurator.fetchConfigurations());
        const config = Configurator.getConfigByUuid(lastConfigViewedNumber);
        setLastConfigViewedNumber(config.uuid);
        setActualConfig(config);
    }

    const handleSaveConfig = (config: ConfigurationInterface) => {
        Configurator.updateConfiguration(configs, config);
        setConfigs(Configurator.fetchConfigurations());
    }

    const handleSetActualConfig = (config: ConfigurationInterface) => {
        const uuid = config.uuid;
        setActualConfig(config);
        setLastConfigViewedNumber(uuid);
        Configurator.setLastConfigViewedNumber(uuid);
    }

    return (
        <div className="w-full">
            <div className="p-6 bg-bg-color">
                <div className="flex w-full items-center p-2">
                    <div className="flex flex-1 items-center">
                        <HomeButton />
                        <h1 className="flex-1 text-3xl font-bold text-text-primary">Plan'Appétit</h1>
                    </div>
                    <div className="flex flex-1 justify-center">
                        <ConfigurationSelector configurations={configs} setConfigurations={setConfigs} actualConfig={actualConfig} onSelect={handleSetActualConfig} />
                    </div>
                    <ImportConfigurationButton fetchConfigs={handleFetchConfigurations} />
                    <ExportConfigurationButton />
                </div>
                <div className="flex">
                    <Week config={actualConfig} saveConfig={handleSaveConfig} />
                </div>
            </div>
            <div className="p-6 bg-bg-color my-4">
                <h1 className="text-3xl font-bold mb-4 text-text-primary">Statistiques</h1>
                <Statistics actualConfig={actualConfig} saveConfig={handleSaveConfig} />
            </div>
        </div>
    );
}
