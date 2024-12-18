// import { useState } from "react"
import ConfigurationInterface from "../api/ConfigurationInterface"
import AnnualStatistics from "./modules/AnnualStatistics"
import WeekStatistics from "./modules/WeekStatistics"

export default function Statistics({
    actualConfig,
    saveConfig
}: {
    actualConfig: ConfigurationInterface,
    saveConfig: (config: ConfigurationInterface) => void
}) {
    return (
        <div className="grid grid-cols-2">
            <div className="mx-2">
                <AnnualStatistics config={actualConfig} saveConfig={saveConfig} />
            </div>
            <div className="mx-2">
                <WeekStatistics config={actualConfig} />
            </div>
        </div>
    )
}