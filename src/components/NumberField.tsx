interface NumberFieldProps {
    label: string;
    value: number;
    onChange: (newValue: number) => void;
}

export default function NumberField({ label, value, onChange }: NumberFieldProps) {
    const increment = () => {
        onChange(Math.min(value + 1, 9999));
    };

    const decrement = () => {
        onChange(Math.max(value - 1, 0));
    };

    const zero = () => {
        onChange(0);
    };

    return (
        <div className="flex items-center space-x-2">
            <label htmlFor="number" className="text-sm text-gray-600">{label}</label>
            <input
                type="number"
                id="number"
                value={value}
                max={9999}
                min={0}
                onChange={(e) => {
                    const newValue = Math.min(Math.max(Number(e.target.value), 0), 9999);
                    onChange(newValue);
                }}
                className="border border-gray-200 rounded p-1 w-16 text-center"
            />
            <button
                type="button"
                onClick={increment}
                className="border border-gray-300 rounded px-2 py-1 text-sm bg-green-200 hover:bg-green-400 transition duration-200"
            >
                +
            </button>
            <button
                type="button"
                onClick={decrement}
                className="border border-gray-300 rounded px-2 py-1 text-sm bg-red-200 hover:bg-red-400 transition duration-200"
            >
                -
            </button>
            <button
                type="button"
                onClick={zero}
                className="border border-gray-300 rounded px-2 py-1 text-sm bg-gray-300 hover:bg-gray-400 transition duration-200"
            >
                0
            </button>
        </div>
    );
}
