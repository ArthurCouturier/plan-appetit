import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import type { FeedbackComponentProps, LinkComponentSchema } from "./types";

export default function LinkComponent({
  schema,
  onInteract,
}: FeedbackComponentProps<LinkComponentSchema>) {
  const { label, url, external } = schema.props;

  const handleClick = () => {
    onInteract?.(url);
  };

  if (external) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
      >
        {label}
        <ArrowTopRightOnSquareIcon className="w-4 h-4" />
      </a>
    );
  }

  return (
    <Link
      to={url}
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
    >
      {label}
    </Link>
  );
}
