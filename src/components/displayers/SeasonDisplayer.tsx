import { SeasonEnum } from "../../api/enums/SeasonEnum";

export default function SeasonDisplayer({
    season,
    className,
}: {
    season: SeasonEnum;
    className?: string;
}) {
    const seasonColor = {
        [SeasonEnum.WINTER]: "bg-blue-300",
        [SeasonEnum.SPRING]: "bg-green-600",
        [SeasonEnum.SUMMER]: "bg-yellow-300",
        [SeasonEnum.FALL]: "bg-amber-800",
        [SeasonEnum.ALL]: "bg-white"
    };

    return (
        <div
            className={`relative rounded-full w-6 h-6 overflow-hidden ${seasonColor[season]} ${className}`}
            title={season}
        >
            {season === SeasonEnum.ALL && (
                <>
                    <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-blue-300"></div>
                    <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-green-600"></div>
                    <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-yellow-300"></div>
                    <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-amber-800"></div>
                </>
            )}
        </div>
    )
}

export function SeasonDisplayerExplaination() {
    return (
        <div className="flex justify-center mt-2 mb-4">
            <SeasonDisplayer season={SeasonEnum.WINTER} className="" />: Hiver
            <SeasonDisplayer season={SeasonEnum.SPRING} className="ml-2" />: Printemps
            <SeasonDisplayer season={SeasonEnum.SUMMER} className="ml-2" />: Été
            <SeasonDisplayer season={SeasonEnum.FALL} className="ml-2" />: Automne
            <SeasonDisplayer season={SeasonEnum.ALL} className="ml-2" />: Toute saison
        </div>
    )
}
