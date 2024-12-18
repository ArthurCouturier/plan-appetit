// import { useState } from "react"
import ConfigurationInterface from "../api/ConfigurationInterface"
import DayStatistics from "./modules/DayStatistics"
import WeekStatistics from "./modules/WeekStatistics"

export default function Statistics({
    actualConfig
}: {
    actualConfig: ConfigurationInterface
}) {
    return (
        <div className="grid grid-cols-2">
            <div className="flex justify-center items-center">
                <WeekStatistics config={actualConfig} />
            </div>
            <div className="flex justify-center items-center">
                <DayStatistics config={actualConfig} />
            </div>
        </div>
    )
}