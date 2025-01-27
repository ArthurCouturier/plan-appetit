import StatsInterface from "../statistics/StatsInterface";
import WeekInterface from "./WeekInterface";

export default interface ConfigurationInterface {
    uuid: string;
    name: string;
    week: WeekInterface;
    stats: StatsInterface;
}
