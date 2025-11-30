import { SeasonEnum } from "../../api/enums/SeasonEnum";

const seasonEmoji: Record<SeasonEnum, string> = {
    [SeasonEnum.FALL]: "🍁",
    [SeasonEnum.WINTER]: "❄️",
    [SeasonEnum.SPRING]: "🌸",
    [SeasonEnum.SUMMER]: "🌞",
    [SeasonEnum.ALL]: ""
};

const seasonLabel: Record<SeasonEnum, string> = {
    [SeasonEnum.FALL]: "Automne",
    [SeasonEnum.WINTER]: "Hiver",
    [SeasonEnum.SPRING]: "Printemps",
    [SeasonEnum.SUMMER]: "Été",
    [SeasonEnum.ALL]: "Toute saison"
};

export default function SeasonDisplayer({
    seasons,
}: {
    seasons: SeasonEnum[];
    className?: string;
}) {
    if (seasons.length !== 1 || seasons[0] === SeasonEnum.ALL) {
        return null;
    }

    const season = seasons[0];
    return (
        <span title={seasonLabel[season]}>
            {seasonEmoji[season]}
        </span>
    );
}
