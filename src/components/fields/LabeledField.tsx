export default function LabeledField({
    label,
    children,
    htmlFor = "field",
    onClick,
    className = "",
}: {
    label: string,
    children?: React.ReactNode,
    htmlFor?: string,
    onClick?: () => void,
    className?: string,
}) {
    return (
        <div
            className={`flex flex-col my-4 w-full ${className}`}
            onClick={onClick}
        >
            <label
                key={label}
                htmlFor={htmlFor}
                className="text-text-primary text-base font-semibold mb-2"
            >
                {label}
            </label>
            {children}
        </div>
    );
}
