import { SeasonEnum } from "../../api/enums/SeasonEnum";
import SeasonSelector from "../selectors/SeasonSelector";
import LabeledField from "./LabeledField";

export default function LabeledSeasonSelectorField({
    seasons,
    onChange
}: {
    seasons: SeasonEnum[];
    onChange: (seasons: SeasonEnum[]) => void;
}) {
    return (
        <LabeledField label={"Saisonnalité de la recette"} htmlFor="seasonSelector">
            <SeasonSelector initialSeason={seasons} onChange={onChange} />
        </LabeledField>
    )
}