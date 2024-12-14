// import { useState } from "react"
import ConfigurationInterface from "../api/ConfigurationInterface"
import ModuleCard from "./ModuleCard"
import WeekStatistics from "./modules/WeekStatistics"

export default function Statistics({
    actualConfig
}: {
    actualConfig: ConfigurationInterface
}) {
    return (
        <div>
            <div>
                <WeekStatistics config={actualConfig} />
            </div>
        </div>
    )
}