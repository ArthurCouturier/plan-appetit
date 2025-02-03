import { useState } from "react";
import { SeasonEnum } from "../../api/enums/SeasonEnum";

const seasonColor = {
    [SeasonEnum.WINTER]: "bg-blue-300",
    [SeasonEnum.SPRING]: "bg-green-600",
    [SeasonEnum.SUMMER]: "bg-yellow-300",
    [SeasonEnum.FALL]: "bg-amber-800",
    [SeasonEnum.ALL]: "bg-white"
};

export default function SeasonSelector({
    initialSeason,
    onChange
}: {
    initialSeason: SeasonEnum[];
    onChange: (season: SeasonEnum[]) => void;
}) {

    const [seasons, setSeasons] = useState<SeasonEnum[]>(initialSeason);

    const handleChange = (s: SeasonEnum) => {
        if (s === SeasonEnum.ALL) {
            if (seasons.length === 4) {
                setSeasons([]);
                onChange([]);
                return;
            } else {
                setSeasons([SeasonEnum.WINTER, SeasonEnum.SPRING, SeasonEnum.SUMMER, SeasonEnum.FALL]);
                onChange([SeasonEnum.WINTER, SeasonEnum.SPRING, SeasonEnum.SUMMER, SeasonEnum.FALL]);
                return;
            }
        }
        if (!seasons.includes(s)) {
            setSeasons([...seasons, s]);
            onChange([...seasons, s]);
        } else {
            setSeasons(seasons.filter((season) => season !== s));
            onChange(seasons.filter((season) => season !== s));
        }
    }

    return (
        <div className="flex justify-center mt-2 mb-4">
            <SeasonSelectorUnit seasons={seasons} season={SeasonEnum.ALL} onClick={() => handleChange(SeasonEnum.ALL)} />
            <SeasonSelectorUnit seasons={seasons} season={SeasonEnum.WINTER} onClick={() => handleChange(SeasonEnum.WINTER)} />
            <SeasonSelectorUnit seasons={seasons} season={SeasonEnum.SPRING} onClick={() => handleChange(SeasonEnum.SPRING)} />
            <SeasonSelectorUnit seasons={seasons} season={SeasonEnum.SUMMER} onClick={() => handleChange(SeasonEnum.SUMMER)} />
            <SeasonSelectorUnit seasons={seasons} season={SeasonEnum.FALL} onClick={() => handleChange(SeasonEnum.FALL)} />
        </div>
    )
}

function SeasonSelectorUnit({
    seasons,
    season,
    onClick
}: {
    seasons: SeasonEnum[];
    season: SeasonEnum;
    onClick: () => void;
}) {
    return (season === SeasonEnum.ALL ? (
        <div
            className={`relative rounded-full w-6 h-6 overflow-hidden mr-2 transition duration-200 ease-in-out ${seasons.length === 4 ? "opacity-100" : "opacity-30"}`}
            onClick={onClick}
            title={"Toutes saisons"}
        >
            <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-blue-300"></div>
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-green-600"></div>
            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-yellow-300"></div>
            <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-amber-800"></div>
        </div>
    ) : (
        <div
            className={`
                        relative rounded-full w-6 h-6 overflow-hidden mr-2 transition duration-200 ease-in-out ${seasonColor[season]}
                        ${seasons.includes(season) ? "opacity-100" : "opacity-30"}
                        `}
            onClick={onClick}
            title={season}
        ></div>
    ))
}
