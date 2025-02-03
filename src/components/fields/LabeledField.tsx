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
            className={`flex flex-col my-4 w-[60vw] mx-auto ${className}`}
            onClick={onClick}
        >
            <label
                key={label}
                htmlFor={htmlFor}
                className="text-text-primary text-lg font-bold mb-2"
            >
                {label}
            </label>
            {children}
        </div>
    );
}
