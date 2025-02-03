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
                className="bg-secondary text-text-secondary p-2 rounded-lg"
            />
        </LabeledField>
    );
}
