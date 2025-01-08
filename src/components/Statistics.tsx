import ConfigurationInterface from "../api/interfaces/ConfigurationInterface"
import AnnualStatistics from "./modules/AnnualStatistics"
import SuperNovaModule from "./modules/SuperNovaModule"
import WeekStatistics from "./modules/WeekStatistics"

export default function Statistics({
    actualConfig,
    saveConfig
}: {
    actualConfig: ConfigurationInterface,
    saveConfig: (config: ConfigurationInterface) => void
}) {
    return (
        <div className="grid grid-cols-2 gap-y-4 gap-x-3">
            <div className="h-full">
                <AnnualStatistics config={actualConfig} saveConfig={saveConfig} />
            </div>
            <div className="h-full">
                <WeekStatistics config={actualConfig} />
            </div>
            <div className="h-full">
                <SuperNovaModule config={actualConfig} />
            </div>
        </div>
    )
}