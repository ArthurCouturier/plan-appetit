import { mediumHaptic } from "../../haptics/medium";
import type { ChoiceComponentSchema, FeedbackComponentProps } from "./types";

export default function ChoiceComponent({
  schema,
  value,
  onChange,
  onInteract,
}: FeedbackComponentProps<ChoiceComponentSchema>) {
  const { label, options, required } = schema.props;
  const current = typeof value === "string" ? value : null;

  const handleSelect = (v: string) => {
    if (v !== current) mediumHaptic();
    onChange(v);
    onInteract?.(v);
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-text-primary">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </span>
      <div className="flex flex-col gap-2">
        {options.map((opt) => {
          const selected = current === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt.value)}
              className={`text-left rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                selected
                  ? "border-cout-purple bg-white/90 font-semibold"
                  : "border-border-color bg-white/70 text-text-primary hover:bg-white/80"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <span
                  className={`inline-flex items-center justify-center w-4 h-4 rounded-full border-2 ${
                    selected ? "border-cout-purple" : "border-border-color"
                  }`}
                >
                  {selected && <span className="w-2 h-2 rounded-full bg-cout-purple" />}
                </span>
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
