export default function NumberField({ label, value, onChange }: NumberFieldProps) {
    return (
        <div className="flex flex-col space-y-1">
            <label htmlFor="number" className="text-sm text-gray-600">{label}</label>
            <input
                type="number"
                id="number"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="border border-gray-200 rounded p-2"
            />
        </div>
    )
}