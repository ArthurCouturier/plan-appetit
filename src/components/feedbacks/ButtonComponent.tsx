import type { ButtonComponentSchema, FeedbackComponentProps } from "./types";

const VARIANT_CLASSES: Record<string, string> = {
  primary: "bg-accent text-white hover:opacity-90",
  secondary: "bg-secondary text-text-primary hover:bg-secondary/80",
  ghost: "text-text-primary hover:bg-secondary",
};

export default function ButtonComponent({
  schema,
  onInteract,
}: FeedbackComponentProps<ButtonComponentSchema>) {
  const { label, action, url, variant } = schema.props;
  const variantClass = VARIANT_CLASSES[variant ?? "primary"] ?? VARIANT_CLASSES.primary;

  const handleClick = () => {
    onInteract?.(action);
    if (action === "open_url" && url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${variantClass}`}
    >
      {label}
    </button>
  );
}
