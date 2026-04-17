import { useCallback, useId, useRef, useState } from "react";
import useIsMobile from "../../hooks/useIsMobile";
import type { FeedbackComponentProps, TextInputComponentSchema } from "./types";

const KEYBOARD_SPACER_HEIGHT = 320;
const SCROLL_DELAY_MS = 300;

export default function TextInputComponent({
  schema,
  value,
  onChange,
  onInteract,
}: FeedbackComponentProps<TextInputComponentSchema>) {
  const { label, placeholder, multiline, maxLength, required } = schema.props;
  const stringValue = typeof value === "string" ? value : "";
  const inputId = useId();
  const isMobile = useIsMobile();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);

  const handleChange = (newValue: string) => {
    onChange(newValue);
    onInteract?.(newValue);
  };

  const handleFocus = useCallback(() => {
    if (!isMobile) return;
    setFocused(true);
    setTimeout(() => {
      wrapperRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, SCROLL_DELAY_MS);
  }, [isMobile]);

  const handleBlur = useCallback(() => {
    setFocused(false);
  }, []);

  return (
    <>
      <div ref={wrapperRef} className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm font-medium text-text-primary">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {multiline ? (
          <textarea
            id={inputId}
            value={stringValue}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            maxLength={maxLength}
            rows={3}
            className="w-full rounded-lg border border-border-color bg-secondary px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent resize-none"
          />
        ) : (
          <input
            id={inputId}
            type="text"
            value={stringValue}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            maxLength={maxLength}
            className="w-full rounded-lg border border-border-color bg-secondary px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
          />
        )}
        {maxLength && (
          <span className="text-xs text-text-secondary self-end">
            {stringValue.length} / {maxLength}
          </span>
        )}
      </div>
      {focused && <div style={{ height: KEYBOARD_SPACER_HEIGHT }} aria-hidden="true" />}
    </>
  );
}
