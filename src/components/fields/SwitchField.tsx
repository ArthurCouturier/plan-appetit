import { Switch } from "@material-tailwind/react";
import LabeledField from "./LabeledField";

export default function SwitchField({
    value,
    onChange,
    label,
    htmlFor = "switchField",
    className = "",
}: {
    value: boolean,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    label: string,
    htmlFor?: string,
    className?: string,
}) {
    // Change checked value
    const handleClick = () => {
        onChange({ target: { checked: !value } } as React.ChangeEvent<HTMLInputElement>);
    }
    return (
        <div className="mx-auto">
            <Switch
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                crossOrigin={undefined}
                color="blue"
                label={
                    <LabeledField
                        label={label}
                        htmlFor={htmlFor}
                        className={className + "w-fit translate-y-1"}
                        onClick={handleClick}
                    />
                }
                defaultChecked={false}
                checked={value}
                className={"-translate-x-4 bg-red-500"}
                onChange={onChange}

            />
        </div>
    )
}
