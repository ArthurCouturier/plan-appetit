import { ComponentType } from "react";
import TitleComponent from "./TitleComponent";
import TextComponent from "./TextComponent";
import RatingComponent from "./RatingComponent";
import TextInputComponent from "./TextInputComponent";
import type { FeedbackComponentProps, FeedbackComponentType } from "./types";

export const FEEDBACK_COMPONENT_REGISTRY: Record<
  FeedbackComponentType,
  ComponentType<FeedbackComponentProps<any>>
> = {
  title: TitleComponent,
  text: TextComponent,
  rating: RatingComponent,
  text_input: TextInputComponent,
};

export const INTERACTIVE_COMPONENT_TYPES: FeedbackComponentType[] = [
  "rating",
  "text_input",
];

export function isInteractiveComponent(type: FeedbackComponentType): boolean {
  return INTERACTIVE_COMPONENT_TYPES.includes(type);
}
