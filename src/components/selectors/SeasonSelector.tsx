import { useState } from "react";
import { SeasonEnum } from "../../api/enums/SeasonEnum";

export default function SeasonSelector({
    initialSeason,
    onChange
}: {
    initialSeason: SeasonEnum;
    onChange: (season: SeasonEnum) => void;
}) {
    const [season, setSeason] = useState<SeasonEnum>(initialSeason);

    return (
        <div className="ml-2 my-auto">
            <select
                value={season}
                onChange={(e) => {
                    setSeason(e.target.value as SeasonEnum);
                    onChange(e.target.value as SeasonEnum);
                }}
                className="border border-gray-200 rounded-sm p-1 w-32 text-center bg-secondary text-text-secondary"
            >
                {Object.values(SeasonEnum).map((season) => (
                    <option key={season} value={season}>
                        {season}
                    </option>
                ))}
            </select>
        </div>
    )
}
