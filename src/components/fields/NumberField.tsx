interface NumberFieldProps {
    label: string;
    value: number;
    onChange: (newValue: number) => void;
    min: number;
    max: number;
    isMobile: boolean;
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
        <div className="flex items-center space-x-2">
            <label htmlFor="number" className={`text-lg text-text-secondary ${isMobile ? "text-white font-bold" : "text-sm"}`}>{label}</label>
            <input
                type="number"
                id="number"
                value={value}
                max={max}
                min={min}
                onChange={(e) => {
                    const newValue = Math.min(Math.max(Number(e.target.value), min), max);
                    onChange(newValue);
                }}
                className={`border border-gray-200 rounded-sm p-1 text-center bg-secondary text-text-secondary ${isMobile ? "w-8" : "w-16 "}`}
            />
            <button
                type="button"
                onClick={increment}
                className={`bg-green-200 rounded-sm px-2 py-1 ${isMobile ? "size-8" : "border border-gray-300   text-sm  hover:bg-green-400 transition duration-200 "}`}
            >
                +
            </button>
            <button
                type="button"
                onClick={decrement}
                className={`rounded-sm px-2 py-1 text-sm bg-red-200 ${isMobile ? "size-8" : "border border-gray-300  hover:bg-red-400 transition duration-200"}`}
            >
                -
            </button>
            <button
                type="button"
                onClick={zero}
                className={`rounded-sm px-2 py-1 text-sm bg-gray-300 ${isMobile ? "size-8" : "border border-gray-300  hover:bg-gray-400 transition duration-200"}`}
            >
                0
            </button>
        </div>
    );
}
