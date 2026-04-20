import type { FeedbackComponentProps, TitleComponentSchema } from "./types";

export default function TitleComponent({ schema }: FeedbackComponentProps<TitleComponentSchema>) {
  return (
    <h3 className="text-lg font-semibold text-text-primary">
      {schema.props.text}
    </h3>
  );
}
