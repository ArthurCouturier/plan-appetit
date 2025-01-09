import { v4 as uuidv4 } from "uuid";
import ConfigurationInterface from "../interfaces/configurations/ConfigurationInterface";

export default class Configurator {
    static getEmptyConfiguration(): ConfigurationInterface {
        return {
            uuid: uuidv4(),
            name: "configuration vide",
            week: {
                name: "Semaine 1",
                days: [
                    { name: "Lundi", meals: [{ covers: 0, starterPrice: 0, mainCoursePrice: 0, dessertPrice: 0, drinkPrice: 0 }, { covers: 0, starterPrice: 0, mainCoursePrice: 0, dessertPrice: 0, drinkPrice: 0 }] },
                    { name: "Mardi", meals: [{ covers: 0, starterPrice: 0, mainCoursePrice: 0, dessertPrice: 0, drinkPrice: 0 }, { covers: 0, starterPrice: 0, mainCoursePrice: 0, dessertPrice: 0, drinkPrice: 0 }] },
                    { name: "Mercredi", meals: [{ covers: 0, starterPrice: 0, mainCoursePrice: 0, dessertPrice: 0, drinkPrice: 0 }, { covers: 0, starterPrice: 0, mainCoursePrice: 0, dessertPrice: 0, drinkPrice: 0 }] },
                    { name: "Jeudi", meals: [{ covers: 0, starterPrice: 0, mainCoursePrice: 0, dessertPrice: 0, drinkPrice: 0 }, { covers: 0, starterPrice: 0, mainCoursePrice: 0, dessertPrice: 0, drinkPrice: 0 }] },
                    { name: "Vendredi", meals: [{ covers: 0, starterPrice: 0, mainCoursePrice: 0, dessertPrice: 0, drinkPrice: 0 }, { covers: 0, starterPrice: 0, mainCoursePrice: 0, dessertPrice: 0, drinkPrice: 0 }] },
                    { name: "Samedi", meals: [{ covers: 0, starterPrice: 0, mainCoursePrice: 0, dessertPrice: 0, drinkPrice: 0 }, { covers: 0, starterPrice: 0, mainCoursePrice: 0, dessertPrice: 0, drinkPrice: 0 }] },
                    { name: "Dimanche", meals: [{ covers: 0, starterPrice: 0, mainCoursePrice: 0, dessertPrice: 0, drinkPrice: 0 }, { covers: 0, starterPrice: 0, mainCoursePrice: 0, dessertPrice: 0, drinkPrice: 0 }] },
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
                let configurations = JSON.parse(storedConfigurations) as ConfigurationInterface[];
                configurations = configurations.map((config) => {
                    if (!config.uuid) {
                        config.uuid = uuidv4();
                    }
                    return config;
                });
                localStorage.setItem("configurations", JSON.stringify(configurations));
                return configurations;
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

    static updateConfiguration(configurations: ConfigurationInterface[], configuration: ConfigurationInterface): ConfigurationInterface[] {
        const index = configurations.findIndex((conf) => conf.uuid === configuration.uuid);
        if (index !== -1) {
            configurations[index] = configuration;
        } else {
            configurations.push(configuration);
        }
        Configurator.saveConfigurations(configurations);
        return configurations;
    }

    static deleteConfiguration(configuration: ConfigurationInterface): void {
        const configurations = Configurator.fetchConfigurations();
        const newConfigurations = configurations.filter((config) => config.uuid !== configuration.uuid);
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

    static getLastConfigViewedNumber(): string {
        const lastConfigViewed = localStorage.getItem("lastConfigViewed");
        if (lastConfigViewed) {
            return lastConfigViewed;
        }
        return ""
    }

    static setLastConfigViewedNumber(uuid: string): void {
        localStorage.setItem("lastConfigViewed", uuid);
    }

    static getConfigByUuid(uuid: string): ConfigurationInterface {
        const configurations = Configurator.fetchConfigurations();
        const config = configurations.find((config) => config.uuid === uuid);
        if (config) {
            return config;
        }
        return configurations[0];
    }
}
