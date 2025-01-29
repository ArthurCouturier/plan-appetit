import { useState } from "react";
import { UnitEnum } from "../../api/enums/UnitEnum";

export default function UnitSelector({
    actualUnit,
    onChange
}: {
    actualUnit: UnitEnum;
    onChange: (newUnit: UnitEnum) => void;
}) {
    const [unit, setUnit] = useState(actualUnit);

    return (
        <div className="ml-2 my-auto">
            <select
                value={unit}
                onChange={(e) => {
                    setUnit(e.target.value as UnitEnum);
                    onChange(e.target.value as UnitEnum);
                }}
                className="border border-gray-200 rounded-sm p-1 w-28 text-center"
            >
                {Object.values(UnitEnum).map((unit) => (
                    <option key={unit} value={unit}>
                        {unit}
                    </option>
                ))}
            </select>
        </div>
    )
}
