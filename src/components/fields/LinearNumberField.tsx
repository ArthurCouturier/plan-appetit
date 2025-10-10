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
        <LabeledField label={label} className={`${className}`} htmlFor={htmlFor}>
            <div className="flex flex-col gap-4">
                {/* Value Display and Edit */}
                <div className="flex items-center justify-center gap-3">
                    {!isMobile && (
                        <div className="flex gap-1">
                            <Button onChange={() => onChange({ target: { value: Math.max(value - 10, 0) } } as any)}>-10</Button>
                            <Button onChange={() => onChange({ target: { value: Math.max(value - 1, 0) } } as any)}>-1</Button>
                            <Button onChange={() => onChange({ target: { value: Math.max(value - 0.1, 0) } } as any)}>-0.1</Button>
                        </div>
                    )}
                    
                    <div className="bg-secondary border border-border-color rounded-lg px-4 py-2 min-w-[100px] text-center">
                        {editing ? (
                            <input
                                ref={inputRef}
                                type="number"
                                inputMode="decimal"
                                id="number"
                                value={value}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                className="w-full bg-transparent text-center text-text-primary outline-none"
                            />
                        ) : (
                            <div className="text-text-primary font-semibold cursor-pointer" onClick={() => setEditing(true)}>
                                <NumberFlow
                                    value={value}
                                    format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                                    suffix=" €"
                                />
                            </div>
                        )}
                    </div>
                    
                    {!isMobile && (
                        <div className="flex gap-1">
                            <Button onChange={() => onChange({ target: { value: Math.min(value + 0.1, 999.99) } } as any)}>+0.1</Button>
                            <Button onChange={() => onChange({ target: { value: Math.min(value + 1, 999.99) } } as any)}>+1</Button>
                            <Button onChange={() => onChange({ target: { value: Math.min(value + 10, 999.99) } } as any)}>+10</Button>
                        </div>
                    )}
                </div>

                {/* Slider */}
                <div className="flex items-center gap-3 w-full">
                    <span className="text-text-secondary text-sm">0€</span>
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
                        className="flex-1"
                    />
                    <span className="text-text-secondary text-sm">100€</span>
                </div>
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
            className={`bg-secondary text-text-primary text-xs rounded-md px-2 py-1 hover:bg-cout-purple/20 transition-colors duration-200 ${className}`}
        >
            {children}
        </button>
    );
}
