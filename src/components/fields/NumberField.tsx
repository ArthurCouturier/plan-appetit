interface NumberFieldProps {
    label: string;
    value: number;
    onChange: (newValue: number) => void;
    min: number;
    max: number;
    isMobile: boolean
}

export default function NumberField({ label, value, onChange, min = 0, max = 9999, isMobile }: NumberFieldProps) {
    const increment = () => {
        onChange(Math.min(value + 1, max));
    };

    const decrement = () => {
        onChange(Math.max(value - 1, min));
    };

    const zero = () => {
        onChange(0);
    };

    return (
        isMobile ?
            <NumberFieldMobile
                value={value}
                max={max}
                min={min}
                onChange={onChange}
                increment={increment} decrement={decrement}
            /> :
            <NumberFieldDesktop
                label={label}
                value={value}
                max={max}
                min={min}
                onChange={onChange}
                increment={increment} decrement={decrement}
                zero={zero}
            />
    );
}

function NumberFieldMobile({
    value,
    max,
    min,
    onChange,
    increment,
    decrement,
}: {
    value: number;
    onChange: (newValue: number) => void;
    min: number;
    max: number;
    increment: () => void;
    decrement: () => void;
}) {
    return (
        <div className="flex items-center space-x-2 ">

            <button
                type="button"
                onClick={decrement}
                className="rounded-sm px-2 py-1 text-sm bg-red-200 size-8 border"
            >
                -
            </button>
            <input
                type="number"
                inputMode="decimal"
                id="number"
                value={value}
                max={max}
                min={min}
                onChange={(e) => {
                    let newValue = Math.min(Math.max(Number(e.target.value), min), max);
                    if (!isNaN(newValue)) {
                        newValue = Math.round(newValue * 100) / 100;
                    }
                    onChange(newValue);
                }}
                className="border border-gray-200 rounded-sm p-1 text-center bg-secondary text-text-secondary w-8"
            />
            <button
                type="button"
                onClick={increment}
                className="rounded-sm px-2 py-1 text-sm bg-green-200 size-8 border"
            >
                +
            </button>

        </div>
    )
}

function NumberFieldDesktop({
    label,
    value,
    max,
    min,
    onChange,
    increment,
    decrement,
    zero
}: {
    label: string;
    value: number;
    onChange: (newValue: number) => void;
    min: number;
    max: number;
    increment: () => void;
    decrement: () => void;
    zero: () => void
}) {
    return (
        <div className="flex items-center space-x-2">
            <label htmlFor="number" className="text-text-secondary font-bold text-sm">{label}</label>
            <input
                type="number"
                inputMode="decimal"
                pattern="^\d+([.,]\d{0,2})?$"
                id="number"
                value={value}
                max={max}
                min={min}
                onChange={(e) => {
                    let newValue = Math.min(Math.max(Number(e.target.value), min), max);
                    if (!isNaN(newValue)) {
                        newValue = Math.round(newValue * 100) / 100;
                    }
                    onChange(newValue);
                }}
                className="border border-gray-200 rounded-sm p-1 text-center bg-secondary text-text-secondary w-16 "
            />
            <button
                type="button"
                onClick={increment}
                className="bg-green-200 rounded-sm px-2 py-1 size-8 md:border border-gray-300 text-sm  hover:bg-green-400 transition duration-200"
            >
                +
            </button>
            <button
                type="button"
                onClick={decrement}
                className="rounded-sm px-2 py-1 text-sm bg-red-200 size-8 border border-gray-300  hover:bg-red-400 transition duration-200"
            >
                -
            </button>
            <button
                type="button"
                onClick={zero}
                className="rounded-sm px-2 py-1 text-sm bg-gray-300 size-8 border border-gray-300  hover:bg-gray-400 transition duration-200"
            >
                0
            </button>
        </div>
    )
}
