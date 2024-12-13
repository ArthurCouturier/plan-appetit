import { useState } from "react";
import ConfigurationInterface from "../api/ConfigurationInterface";
import Configurator from "../api/Configurator";
import Week from "../components/Week";

export default function Planning() {

    const [configs, setConfigs] = useState<ConfigurationInterface[]>(Configurator.fetchConfigurations());

    const handleSaveConfig = (config: ConfigurationInterface) => {
        Configurator.updateConfiguration(configs, config);
        setConfigs(Configurator.fetchConfigurations());
    }

    return (
        <div className="p-6 bg-gray-100">
            <h1 className="text-3xl font-bold mb-4 text-gray-800">Plan'Appétit</h1>
            <div className="flex">
                {configs.map((config: ConfigurationInterface) => (
                    <Week config={config} saveConfig={handleSaveConfig} />
                ))}
            </div>
        </div>
    );
}
