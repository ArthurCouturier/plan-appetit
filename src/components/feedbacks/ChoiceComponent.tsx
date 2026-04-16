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
                  ? "border-accent bg-accent/10 text-text-primary"
                  : "border-border-color text-text-primary hover:bg-secondary"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <span
                  className={`inline-block w-3 h-3 rounded-full border ${
                    selected ? "bg-accent border-accent" : "border-border-color"
                  }`}
                />
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
