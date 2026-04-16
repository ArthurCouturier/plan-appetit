import { useId } from "react";
import type { FeedbackComponentProps, TextInputComponentSchema } from "./types";

export default function TextInputComponent({
  schema,
  value,
  onChange,
  onInteract,
}: FeedbackComponentProps<TextInputComponentSchema>) {
  const { label, placeholder, multiline, maxLength, required } = schema.props;
  const stringValue = typeof value === "string" ? value : "";
  const inputId = useId();

  const handleChange = (newValue: string) => {
    onChange(newValue);
    onInteract?.(newValue);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-text-primary">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {multiline ? (
        <textarea
          id={inputId}
          value={stringValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={3}
          className="w-full rounded-lg border border-border-color bg-primary px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent resize-none"
        />
      ) : (
        <input
          id={inputId}
          type="text"
          value={stringValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className="w-full rounded-lg border border-border-color bg-primary px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
        />
      )}
      {maxLength && (
        <span className="text-xs text-text-secondary self-end">
          {stringValue.length} / {maxLength}
        </span>
      )}
    </div>
  );
}
