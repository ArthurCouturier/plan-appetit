import { useState } from "react";
import { UnitEnum } from "../../api/enums/UnitEnum";
import { UnitLabels } from "../../api/constants/UnitLabels";

export default function UnitSelector({
    actualUnit,
    onChange
}: {
    actualUnit: UnitEnum;
    onChange: (newUnit: UnitEnum) => void;
}) {
    const [unit, setUnit] = useState<UnitEnum>(actualUnit);

    return (
        <div className="ml-2 my-auto">
            <select
                value={unit}
                onChange={(e) => {
                    const selected = e.target.value as UnitEnum;
                    setUnit(selected);
                    onChange(selected);
                }}
                className="border border-gray-200 rounded-sm p-1 w-28 text-center bg-secondary text-text-secondary"
            >
                {Object.values(UnitEnum).map((u) => (
                    <option key={u} value={u}>
                        {UnitLabels[u]}
                    </option>
                ))}
            </select>
        </div>
    );
}
