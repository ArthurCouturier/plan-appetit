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
        // Return default configuration if localStorage is empty or invalid
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
}
