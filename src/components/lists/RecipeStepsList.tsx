import { useState, useRef, useEffect } from "react";
import StepInterface from "../../api/interfaces/recipes/StepInterface";

export default function RecipeStepsList({
    steps,
    recipeEditMode,
    setRecipeEditMode,
    onChange,
    onSave,
}: {
    steps: StepInterface[];
    recipeEditMode?: boolean;
    setRecipeEditMode?: (editMode: boolean) => void;
    onChange?: (updatedSteps: StepInterface[]) => void;
    onSave?: (steps: StepInterface[]) => void;
}) {
    const [highlightedKey, setHighlightedKey] = useState<number | null>(null);

    const handleStepChange = (updatedStep: StepInterface) => {
        const updatedSteps = steps.find(step => step.key === updatedStep.key);
        if (updatedSteps) {
            updatedSteps.value = updatedStep.value;
        } else {
            steps.push({ key: updatedStep.key, value: updatedStep.value });
        }
        onChange?.(steps);
    };

    const handleAddStep = () => {
        steps.push({ key: steps.length + 1, value: "Nouvelle étape" });
        onChange?.(steps);
    };

    const handleRemoveStep = (index: number) => {
        const updatedSteps = steps.filter(step => step.key !== index + 1);
        for (let i = 0; i < updatedSteps.length; i++) {
            updatedSteps[i].key = i + 1;
        }
        onChange?.(updatedSteps);
    };

    return (
        <div className={`md:border-2 border-text-primary p-2 rounded-md mt-4 text-text-primary ${recipeEditMode ? "border border-dashed" : null}`}>
            <div className="flex justify-center items-center">
                <h2 className="font-bold text-lg underline text-text-primary">Préparation</h2>
                {!(recipeEditMode === undefined) &&
                    <button
                        className="ml-2 text-text-primary text-sm font-bold px-4 py-2 rounded-lg bg-confirmation-1 md:hover:bg-confirmation-2 md:p-2 md:rounded-md md:m-2 md:transition md:duration-200"
                        onClick={async () => {
                            if (recipeEditMode) {
                                await onSave?.(steps)
                            }
                            setRecipeEditMode?.(!recipeEditMode)
                        }}
                    >
                        {recipeEditMode ? "Sauvegarder" : "Modifier"}
                    </button>
                }
            </div>
            <div className="">
                {[...steps].sort((a, b) => a.key - b.key).map((step) => (
                    <Step
                        key={step.key}
                        step={step}
                        editMode={recipeEditMode}
                        highlighted={highlightedKey === step.key}
                        onHighlight={() => setHighlightedKey(highlightedKey === step.key ? null : step.key)}
                        onChange={(updatedStep) => handleStepChange(updatedStep)}
                        onRemove={() => handleRemoveStep(step.key - 1)}
                    />
                ))}
            </div>
            {recipeEditMode &&
                <button
                    className="ml-2 text-text-primary text-sm font-bold px-4 py-2 rounded-lg bg-confirmation-1 md:hover:bg-confirmation-2 md:p-2 md:rounded-md md:m-2 md:transition md:duration-200"
                    onClick={handleAddStep}
                >
                    Ajouter étape
                </button>
            }
        </div>
    );
}

export function Step({
    step,
    editMode,
    highlighted,
    onHighlight,
    onChange,
    onRemove,
}: {
    step: StepInterface;
    editMode?: boolean;
    highlighted?: boolean;
    onHighlight?: () => void;
    onChange: (updatedStep: StepInterface) => void;
    onRemove: () => void;
}) {

    const handleStepChange = (value: string) => {
        onChange({ key: step.key, value: value });
    }

    return (
        <div className="flex items-center justify-start py-2 mb-2 mx-auto xl:w-1/2">
            {!editMode ? (
                <DefaultMode step={step} highlighted={highlighted} onHighlight={onHighlight} />
            ) : (
                <EditMode step={step} onChange={handleStepChange} onRemove={onRemove} />
            )}
        </div>
    );
}

function DefaultMode({
    step,
    highlighted,
    onHighlight,
}: {
    step: StepInterface;
    highlighted?: boolean;
    onHighlight?: () => void;
}) {
    return (
        <div
            className="flex flex-col cursor-pointer rounded-xl px-3 py-2 -mx-3 transition-all duration-300 ease-out md:hover:scale-[1.05] md:hover:bg-secondary/50 md:hover:shadow-md"
            style={{
                transform: highlighted ? "scale(1.05)" : undefined,
                background: highlighted ? "var(--color-secondary)" : undefined,
                boxShadow: highlighted ? "0 4px 12px rgba(0,0,0,0.08)" : undefined,
            }}
            onClick={onHighlight}
        >
            <h3 className="font-extrabold mb-1 text-left">Etape {step.key}:</h3>
            <pre className="break-word whitespace-normal w-full md:w-[33vw] text-left">{step.value}</pre>
        </div>
    )
}

function EditMode({
    step,
    onChange,
    onRemove
}: {
    step: StepInterface;
    onChange: (value: string) => void;
    onRemove: () => void;
}) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [rows, setRows] = useState(textareaRef.current?.textContent ? (textareaRef.current?.textContent.split("\n").length) : 1);

    // Initial rows calculation
    useEffect(() => {
        if (textareaRef.current?.textContent) {
            const maxRows = 5;
            const newRows = Math.min(
                textareaRef.current.textContent.split("\n").length,
                maxRows
            );
            setRows(newRows);
        }
    }, [textareaRef.current?.textContent]);

    const handleChange = (value: string) => {
        if (textareaRef.current) {
            const maxRows = 5;
            const newRows = Math.min(
                value.split("\n").length,
                maxRows
            );
            setRows(newRows);
        }
        onChange(value);
    };

    return (
        <div className="w-full">
            <h3>Étape {step.key}</h3>
            <div className="flex">
                <textarea
                    ref={textareaRef}
                    value={step.value}
                    className="w-full bg-bg-color text-text-primary p-2 rounded-md resize-none overflow-y-hidden"
                    rows={rows}
                    style={{ lineHeight: "24px" }}
                    onChange={(e) => handleChange(e.target.value)}
                />
                <button
                    className="bg-cancel-1 hover:bg-cancel-2 text-text-primary p-2 rounded-md transition duration-200 mx-2 my-auto h-min"
                    onClick={onRemove}
                >
                    🗑
                </button>
            </div>
        </div>
    );
}
