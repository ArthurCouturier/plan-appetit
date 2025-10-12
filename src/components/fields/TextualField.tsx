import LabeledField from "./LabeledField";

export default function TextualField({
    label,
    placeholder,
    value,
    onChange,
    type = "text",
    className = "",
}: {
    label: string,
    placeholder: string,
    value: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    type?: string,
    className?: string,
}) {
    return (
        <LabeledField label={label} className={className} htmlFor={label}>
            <input
                id={label}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="w-full bg-secondary text-text-primary placeholder-text-secondary px-4 py-3 rounded-lg border border-border-color focus:outline-none focus:ring-2 focus:ring-cout-base"
            />
        </LabeledField>
    );
}
