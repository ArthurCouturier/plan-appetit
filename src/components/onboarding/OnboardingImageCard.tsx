interface OnboardingImageCardProps {
  src: string;
}

export default function OnboardingImageCard({ src }: OnboardingImageCardProps) {
  return (
    <div className="rounded-2xl overflow-hidden aspect-square">
      <img
        src={src}
        alt=""
        className="w-full h-full object-cover"
        draggable={false}
      />
    </div>
  );
}
