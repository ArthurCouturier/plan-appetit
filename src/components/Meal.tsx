import { useState } from "react";
import { MealProps } from "../api/WeekInterface";
import NumberField from "./NumberField";

export default function Meal({ covers, price, editMode }: MealProps & { editMode: boolean }) {

    const [nbCovers, setNbCovers] = useState(covers);
    const [nbPrice, setNbPrice] = useState(price);

    return (
        <div className="border-4 border-gray-300 rounded-md">
            {
                editMode ? (
                    <EditMode covers={nbCovers} price={nbPrice} setCovers={setNbCovers} setPrice={setNbPrice} />
                ) : (
                    <DefaultMode covers={nbCovers} price={nbPrice} />
                )
            }
        </div>
    )
}

function DefaultMode({ covers, price }: MealProps) {
    return (
        <div className="flex justify-between items-center text-sm text-gray-600 mx-2">
            <div className="flex">
                <p className="mr-4">Covers: {covers}</p>
                <p>Price: {price}</p>
            </div>
        </div>
    )
}

function EditMode({ covers, price, setCovers, setPrice }: { covers: number, price: number, setCovers: (value: number) => void, setPrice: (value: number) => void }) {
    return (
        <div className="flex justify-between items-center text-sm text-gray-600 mx-2 my-1">
            <div>
                <NumberField label="Covers" value={covers} onChange={setCovers} />
                <NumberField label="Price" value={price} onChange={setPrice} />
            </div>
        </div>
    )
}
