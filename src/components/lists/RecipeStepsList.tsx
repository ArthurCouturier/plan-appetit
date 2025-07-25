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
        <div className="border-2 border-text-primary p-2 rounded-md mt-4 text-text-primary">
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
            <div className="w-full mx-auto">
                {steps.map((step) => (
                    <Step
                        key={step.key}
                        step={step}
                        editMode={recipeEditMode}
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
    onChange,
    onRemove,
}: {
    step: StepInterface;
    editMode?: boolean;
    onChange: (updatedStep: StepInterface) => void;
    onRemove: () => void;
}) {

    const handleStepChange = (value: string) => {
        onChange({ key: step.key, value: value });
    }

    return (
        <div className="flex items-center justify-center p-2 mb-2 mx-auto md:w-1/2">
            {!editMode ? (
                <DefaultMode step={step}/>
            ) : (
                <EditMode step={step} onChange={handleStepChange} onRemove={onRemove} />
            )}
        </div>
    );
}

function DefaultMode({
    step,
}: {
    step: StepInterface;
}) {
    return (
        <div className="flex flex-col">
            <h3 className="font-extrabold mb-1">Etape {step.key}:</h3>
            <pre className="break-word whitespace-normal w-full md:w-[50vw]">{step.value}</pre>
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
