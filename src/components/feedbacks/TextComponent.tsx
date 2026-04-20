import type { FeedbackComponentProps, TextComponentSchema } from "./types";

const VARIANT_CLASSES: Record<string, string> = {
  default: "text-text-primary",
  muted: "text-text-secondary",
  warning: "text-amber-600",
};

export default function TextComponent({ schema }: FeedbackComponentProps<TextComponentSchema>) {
  const variant = schema.props.variant ?? "default";
  const variantClass = VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.default;
  return (
    <p className={`text-sm leading-relaxed ${variantClass}`}>
      {schema.props.text}
    </p>
  );
}
