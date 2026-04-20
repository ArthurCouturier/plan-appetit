import { useCallback, useId, useRef, useState } from "react";
import { heavyHaptic } from "../../haptics/heavy";
import useIsMobile from "../../hooks/useIsMobile";
import type { ContactOptInComponentSchema, FeedbackComponentProps } from "./types";

const KEYBOARD_SPACER_HEIGHT = 320;
const SCROLL_DELAY_MS = 300;

export default function ContactOptInComponent({
  schema,
  value,
  onChange,
  onInteract,
}: FeedbackComponentProps<ContactOptInComponentSchema>) {
  const { checkboxLabel, inputLabel, inputPlaceholder } = schema.props;
  const stringValue = typeof value === "string" ? value : "";
  const [checked, setChecked] = useState(stringValue.length > 0);
  const [focused, setFocused] = useState(false);
  const inputId = useId();
  const isMobile = useIsMobile();
  const inputWrapperRef = useRef<HTMLDivElement>(null);

  const handleToggle = useCallback(() => {
    const next = !checked;
    setChecked(next);
    heavyHaptic();
    if (!next) {
      onChange("");
      onInteract?.("");
    }
  }, [checked, onChange, onInteract]);

  const handleInputChange = useCallback(
    (v: string) => {
      onChange(v);
      onInteract?.(v);
    },
    [onChange, onInteract]
  );

  return (
    <div className="flex flex-col gap-3">
      <label className="flex items-center gap-2.5 cursor-pointer">
        <div
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            checked ? "bg-cout-purple border-cout-purple" : "border-border-color"
          }`}
          onClick={handleToggle}
        >
          {checked && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <span className="text-sm text-text-primary" onClick={handleToggle}>
          {checkboxLabel}
        </span>
      </label>

      {checked && (
        <div ref={inputWrapperRef} className="flex flex-col gap-1.5 pl-7">
          <label htmlFor={inputId} className="text-sm font-medium text-text-primary">
            {inputLabel}
          </label>
          <input
            id={inputId}
            type="text"
            value={stringValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => {
              if (!isMobile) return;
              setFocused(true);
              setTimeout(() => {
                inputWrapperRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
              }, SCROLL_DELAY_MS);
            }}
            onBlur={() => setFocused(false)}
            placeholder={inputPlaceholder}
            maxLength={75}
            className="w-full rounded-lg border border-border-color bg-secondary px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      )}
      {focused && <div style={{ height: KEYBOARD_SPACER_HEIGHT }} aria-hidden="true" />}
    </div>
  );
}
