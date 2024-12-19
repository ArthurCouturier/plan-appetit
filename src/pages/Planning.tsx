import { useState } from "react";
import ConfigurationInterface from "../api/ConfigurationInterface";
import Configurator from "../api/Configurator";
import Week from "../components/Week";
import Statistics from "../components/Statistics";
import ConfigurationSelector from "../components/ConfigurationSelector";

export default function Planning() {

    const [configs, setConfigs] = useState<ConfigurationInterface[]>(Configurator.fetchConfigurations());

    const [lastConfigViewedNumber, setLastConfigViewedNumber] = useState<number>(Configurator.getLastConfigViewedNumber());

    const [actualConfig, setActualConfig] = useState<ConfigurationInterface>(configs[lastConfigViewedNumber]);

    const handleSaveConfig = (config: ConfigurationInterface) => {
        Configurator.updateConfiguration(configs, config);
        setConfigs(Configurator.fetchConfigurations());
    }

    const handleSetActualConfig = (config: ConfigurationInterface) => {
        const index = configs.findIndex((conf) => conf.name === config.name);
        if (index !== -1) {
            setActualConfig(config);
            setLastConfigViewedNumber(index);
            Configurator.setLastConfigViewedNumber(index);
        }
    }

    return (
        <div className="w-full">
            <div className="p-6 bg-bgColor">
                <div className="flex w-full items-center p-2">
                    <h1 className="flex-1 text-3xl font-bold text-textPrimary">Plan'Appétit</h1>
                    <div className="flex flex-1 justify-center">
                        <ConfigurationSelector actualConfig={actualConfig} onSelect={handleSetActualConfig} />
                    </div>
                </div>
                <div className="flex">
                    <Week config={actualConfig} saveConfig={handleSaveConfig} />
                </div>
            </div>
            <div className="p-6 bg-bgColor my-4">
                <h1 className="text-3xl font-bold mb-4 text-textPrimary">Statistiques</h1>
                <Statistics actualConfig={actualConfig} saveConfig={handleSaveConfig} />
            </div>
        </div>
    );
}
