import { useCallback, useId, useRef, useState } from "react";
import useIsMobile from "../../hooks/useIsMobile";
import { errorHaptic } from "../../haptics/error";
import type { FeedbackComponentProps, TextInputComponentSchema } from "./types";

const KEYBOARD_SPACER_HEIGHT = 320;
const SCROLL_DELAY_MS = 300;
const MAX_FLASH_MS = 2000;

export default function TextInputComponent({
  schema,
  value,
  onChange,
  onInteract,
}: FeedbackComponentProps<TextInputComponentSchema>) {
  const { label, placeholder, multiline, maxLength: propsMaxLength, required } = schema.props;
  const maxLength = Math.min(propsMaxLength ?? 1000, 1000);
  const stringValue = typeof value === "string" ? value : "";
  const inputId = useId();
  const isMobile = useIsMobile();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);
  const [atMax, setAtMax] = useState(false);
  const maxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (newValue: string) => {
    onChange(newValue);
    onInteract?.(newValue);

    if (maxLength && newValue.length >= maxLength && !atMax) {
      errorHaptic();
      setAtMax(true);
      if (maxTimerRef.current) clearTimeout(maxTimerRef.current);
      maxTimerRef.current = setTimeout(() => setAtMax(false), MAX_FLASH_MS);
    }
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

  const borderClass = atMax
    ? "border-red-500 focus:ring-red-500"
    : "border-border-color focus:ring-accent";

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
            className={`w-full rounded-lg border bg-secondary px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 resize-none transition-colors ${borderClass}`}
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
            className={`w-full rounded-lg border bg-secondary px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 transition-colors ${borderClass}`}
          />
        )}
        {maxLength && (
          <span className={`text-xs self-end transition-colors ${atMax ? "text-red-500 font-semibold" : "text-text-secondary"}`}>
            {stringValue.length} / {maxLength}
          </span>
        )}
      </div>
      {focused && <div style={{ height: KEYBOARD_SPACER_HEIGHT }} aria-hidden="true" />}
    </>
  );
}
