import { useState } from "react";
import ConfigurationInterface from "../api/ConfigurationInterface";
import Configurator from "../api/Configurator";
import Week from "../components/Week";
import Statistics from "../components/Statistics";
import ConfigurationSelector from "../components/ConfigurationSelector";

export default function Planning() {

    const [configs, setConfigs] = useState<ConfigurationInterface[]>(Configurator.fetchConfigurations());

    const [actualConfig, setActualConfig] = useState<ConfigurationInterface>(configs[0]);

    const handleSaveConfig = (config: ConfigurationInterface) => {
        Configurator.updateConfiguration(configs, config);
        setConfigs(Configurator.fetchConfigurations());
    }

    return (
        <div>
            <div className="p-6 bg-bgColor">
                <div className="flex w-full items-center p-2">
                    <h1 className="flex-1 text-3xl font-bold text-textPrimary">Plan'Appétit</h1>
                    <div className="flex flex-1 justify-center">
                        <ConfigurationSelector actualConfig={actualConfig} onSelect={setActualConfig} />
                    </div>
                </div>
                <div className="flex">
                    <Week config={actualConfig} saveConfig={handleSaveConfig} />
                </div>
            </div>
            <div className="p-6 bg-bgColor my-4">
                <h1 className="text-3xl font-bold mb-4 text-gray-800">Statistiques</h1>
                <Statistics actualConfig={actualConfig} />
            </div>
        </div>
    );
}
