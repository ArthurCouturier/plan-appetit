import { ComponentType } from "react";
import TitleComponent from "./TitleComponent";
import TextComponent from "./TextComponent";
import RatingComponent from "./RatingComponent";
import TextInputComponent from "./TextInputComponent";
import ChoiceComponent from "./ChoiceComponent";
import LinkComponent from "./LinkComponent";
import ButtonComponent from "./ButtonComponent";
import ContactOptInComponent from "./ContactOptInComponent";
import type { FeedbackComponentProps, FeedbackComponentType } from "./types";

export const FEEDBACK_COMPONENT_REGISTRY: Record<
  FeedbackComponentType,
  ComponentType<FeedbackComponentProps<any>>
> = {
  title: TitleComponent,
  text: TextComponent,
  rating: RatingComponent,
  text_input: TextInputComponent,
  choice: ChoiceComponent,
  link: LinkComponent,
  button: ButtonComponent,
  contact_opt_in: ContactOptInComponent,
};

export const INTERACTIVE_COMPONENT_TYPES: FeedbackComponentType[] = [
  "rating",
  "text_input",
  "choice",
];

export function isInteractiveComponent(type: FeedbackComponentType): boolean {
  return INTERACTIVE_COMPONENT_TYPES.includes(type);
}
