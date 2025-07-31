import NumberFlow from "@number-flow/react";
import LabeledField from "./LabeledField";
import { Slider } from "@material-tailwind/react";
import React, { useEffect, useRef, useState } from "react";

export default function LinearNumberField({
    label,
    value,
    onChange,
    htmlFor = "numberField",
    className = "",
    isMobile
}: {
    label: string,
    value: number,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    htmlFor?: string,
    className?: string,
    isMobile: boolean
}) {
    const [editing, setEditing] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (editing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editing]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
                setEditing(false);
            }
        };
        if (editing) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [editing]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value
        let newValue = parseFloat(val);
        if (!isNaN(newValue)) {
            newValue = Math.min(Math.max(Math.round(newValue * 100) / 100, 0), 100);
            onChange({ target: { value: newValue } } as unknown as React.ChangeEvent<HTMLInputElement>);
        } else {
            onChange({ target: { value: 0 } } as unknown as React.ChangeEvent<HTMLInputElement>);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            setEditing(false);
        }
    };

    return (
        <LabeledField label={label} className={`flex items-center text-text-secondary w-full mx-auto ${className}`} htmlFor={htmlFor}>
            <div className="flex flex-col md:flex-row items-center justify-center">
                {!isMobile &&
                    <div className="md:flex">
                        <Button onChange={() => onChange({ target: { value: Math.max(value - 10, 0) } } as any)}>-10€</Button>
                        <Button onChange={() => onChange({ target: { value: Math.max(value - 1, 0) } } as any)}>-1€</Button>
                        <Button onChange={() => onChange({ target: { value: Math.max(value - 0.1, 0) } } as any)}>-0.1€</Button>
                        <Button onChange={() => onChange({ target: { value: Math.max(value - 0.01, 0) } } as any)}>-0.01€</Button>
                    </div>
                }
                <div className="bg-bg-color rounded-lg w-20 px-2 py-1 mx-6" >
                    {editing ? (
                        <input
                            ref={inputRef}
                            type="number"
                            inputMode="decimal"
                            id="number"
                            value={value}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}

                            className="rounded-sm p-1 text-center text-text-secondary w-16"
                        />
                    ) : (
                        <NumberFlow
                            value={value}
                            format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                            suffix=" €"
                            onClick={() => setEditing(true)}
                        />
                    )}
                </div>
                {!isMobile &&
                    <div className="md:flex">
                        <Button onChange={() => onChange({ target: { value: Math.min(value + 0.01, 999.99) } } as any)}>+0.01€</Button>
                        <Button onChange={() => onChange({ target: { value: Math.min(value + 0.1, 999.99) } } as any)}>+0.1€</Button>
                        <Button onChange={() => onChange({ target: { value: Math.min(value + 1, 999.99) } } as any)}>+1€</Button>
                        <Button onChange={() => onChange({ target: { value: Math.min(value + 10, 999.99) } } as any)}>+10€</Button>
                    </div>
                }
            </div>
            <div className="flex max-w-full items-center justify-between md:w-[45vw] md:mx-auto">
                0€
                <Slider
                    onPointerEnterCapture={undefined}
                    onPointerLeaveCapture={undefined}
                    placeholder={undefined}
                    value={Math.min(Math.max(value, 0.01), 100)}
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
    );
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
    );
}
