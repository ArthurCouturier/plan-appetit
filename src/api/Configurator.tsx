import ConfigurationInterface from "./ConfigurationInterface";

export default class Configurator {
    static getEmptyConfiguration(): ConfigurationInterface {
        return {
            name: "configuration vide",
            week: {
                name: "Semaine 1",
                days: [
                    { name: "Lundi", meals: [{ covers: 0, lunchPrice: 0, drinkPrice: 0 }, { covers: 0, lunchPrice: 0, drinkPrice: 0 }] },
                    { name: "Mardi", meals: [{ covers: 0, lunchPrice: 0, drinkPrice: 0 }, { covers: 0, lunchPrice: 0, drinkPrice: 0 }] },
                    { name: "Mercredi", meals: [{ covers: 0, lunchPrice: 0, drinkPrice: 0 }, { covers: 0, lunchPrice: 0, drinkPrice: 0 }] },
                    { name: "Jeudi", meals: [{ covers: 0, lunchPrice: 0, drinkPrice: 0 }, { covers: 0, lunchPrice: 0, drinkPrice: 0 }] },
                    { name: "Vendredi", meals: [{ covers: 0, lunchPrice: 0, drinkPrice: 0 }, { covers: 0, lunchPrice: 0, drinkPrice: 0 }] },
                    { name: "Samedi", meals: [{ covers: 0, lunchPrice: 0, drinkPrice: 0 }, { covers: 0, lunchPrice: 0, drinkPrice: 0 }] },
                    { name: "Dimanche", meals: [{ covers: 0, lunchPrice: 0, drinkPrice: 0 }, { covers: 0, lunchPrice: 0, drinkPrice: 0 }] },
                ]
            },
            stats: {
                workedWeeks: 0
            }
        };
    }

    static fetchConfigurations(): ConfigurationInterface[] {
        const storedConfigurations = localStorage.getItem("configurations");
        if (storedConfigurations) {
            try {
                return JSON.parse(storedConfigurations) as ConfigurationInterface[];
            } catch {
                console.error("Invalid configurations in localStorage. Resetting to default.");
            }
        }
        return [Configurator.getEmptyConfiguration()];
    }

    static saveConfigurations(configurations: ConfigurationInterface[]): void {
        localStorage.setItem("configurations", JSON.stringify(configurations));
    }

    static addConfiguration(configurations: ConfigurationInterface[], configuration: ConfigurationInterface): void {
        configurations.push(configuration);
        Configurator.saveConfigurations(configurations);
    }

    static findConfiguration(configurations: ConfigurationInterface[], name: string): ConfigurationInterface | undefined {
        return configurations.find((configuration) => configuration.name === name);
    }

    static updateConfiguration(configurations: ConfigurationInterface[], configuration: ConfigurationInterface): ConfigurationInterface[] {
        const index = configurations.findIndex((conf) => conf.name === configuration.name);
        if (index !== -1) {
            configurations[index] = configuration; // Update existing configuration
        } else {
            configurations.push(configuration); // Add new configuration
        }
        Configurator.saveConfigurations(configurations);
        return configurations;
    }

    static deleteConfiguration(configuration: ConfigurationInterface): void {
        const configurations = Configurator.fetchConfigurations();
        const newConfigurations = configurations.filter((config) => config.name !== configuration.name);
        Configurator.saveConfigurations(newConfigurations);
    }

    static changeConfigName(configuration: ConfigurationInterface): ConfigurationInterface | null {
        const newConfigName = prompt("Nouveau nom de la configuration", configuration.name);
        const configurations = this.fetchConfigurations();
        if (newConfigName) {
            configurations.find((config: ConfigurationInterface) => config.name === configuration.name)!.name = newConfigName;
            this.saveConfigurations(configurations);
            const newConfig: ConfigurationInterface | undefined = configurations.find((config: ConfigurationInterface) => config.name === newConfigName);
            if (newConfig) {
                return newConfig;
            }
        }
        return null;
    }
}
