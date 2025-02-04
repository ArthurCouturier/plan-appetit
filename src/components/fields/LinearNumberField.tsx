import NumberFlow from "@number-flow/react";
import LabeledField from "./LabeledField";
import { Slider } from "@material-tailwind/react";
import React from "react";

export default function LinearNumberField({
    label,
    value,
    onChange,
    htmlFor = "numberField",
    className = "",
}: {
    label: string,
    value: number,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    htmlFor?: string,
    className?: string,
}) {
    return (
        <LabeledField label={label} className={`text-text-secondary mx-auto ${className}`} htmlFor={htmlFor}>
            <div className="flex items-center justify-center">
                <Button
                    onChange={() => onChange({ target: { value: value - 10 > 0 ? value - 10 : 0 } } as unknown as React.ChangeEvent<HTMLInputElement>)}
                >
                    -10€
                </Button>
                <Button
                    onChange={() => onChange({ target: { value: value - 1 > 0 ? value - 1 : 0 } } as unknown as React.ChangeEvent<HTMLInputElement>)}
                >
                    -1€
                </Button>
                <Button
                    onChange={() => onChange({ target: { value: value - 0.1 > 0 ? value - 0.1 : 0 } } as unknown as React.ChangeEvent<HTMLInputElement>)}
                >
                    -0.1€
                </Button>
                <Button
                    onChange={() => onChange({ target: { value: value - 0.01 > 0 ? value - 0.01 : 0 } } as unknown as React.ChangeEvent<HTMLInputElement>)}
                >
                    -0.01€
                </Button>
                <div className="bg-bg-color rounded-lg w-20 px-2 py-1 mx-6">
                    <NumberFlow
                        value={value}
                        format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                        suffix="€"
                    />
                </div>
                <Button
                    onChange={() => onChange({ target: { value: value + 0.01 < 1000 ? value + 0.01 : 999.99 } } as unknown as React.ChangeEvent<HTMLInputElement>)}
                >
                    +0.01€
                </Button>
                <Button
                    onChange={() => onChange({ target: { value: value + 0.1 < 1000 ? value + 0.1 : 999.99 } } as unknown as React.ChangeEvent<HTMLInputElement>)}
                >
                    +0.1€
                </Button>
                <Button
                    onChange={() => onChange({ target: { value: value + 1 < 1000 ? value + 1 : 999.99 } } as unknown as React.ChangeEvent<HTMLInputElement>)}
                >
                    +1€
                </Button>
                <Button
                    onChange={() => onChange({ target: { value: value + 10 < 1000 ? value + 10 : 999.99 } } as unknown as React.ChangeEvent<HTMLInputElement>)}
                >
                    +10€
                </Button>
            </div>
            <div className="flex items-center justify-between w-[45vw] mx-auto">
                0€
                <Slider
                    onPointerEnterCapture={undefined}
                    onPointerLeaveCapture={undefined}
                    placeholder={undefined}
                    value={value < 100 ? value > 0.01 ? value : 0.01 : 100}
                    onChange={onChange}
                    color="blue"
                    defaultValue={10}
                    step={0.01}
                    id={htmlFor}
                    className="mx-4 bg-secondary rounded-2xl"
                />
                100€
            </div>
        </LabeledField>
    )
}

function Button({
    onChange,
    className,
    children
}: {
    onChange: () => void,
    className?: string,
    children: React.ReactNode
}) {
    return (
        <button
            onClick={onChange}
            className={`bg-secondary text-text-secondary rounded-lg px-1 py-0.5 w-fit m-1 hover:scale-95 hover:opacity-85 active:scale-100 active:opacity-95 ${className}`}
        >
            {children}
        </button>
    )
}
