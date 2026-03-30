import InstagramGenerationLoader from "../instagram/InstagramGenerationLoader";

interface RecipeGenerationLoadingModalProps {
  isOpen: boolean;
  progress?: {
    step: string;
    currentFrame: number;
    totalFrames: number;
    percent: number;
  } | null;
}

export default function RecipeGenerationLoadingModal({ isOpen, progress }: RecipeGenerationLoadingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-cout-purple/95 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center w-full max-w-md px-6">
        <div className="relative w-32 h-32 mx-auto mb-6">
          {/* Spinning circles */}
          <div className="absolute inset-0 border-4 border-cout-yellow/30 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-cout-yellow rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-4 border-transparent border-t-white rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>

          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl animate-pulse">🍳</span>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Creation en cours...</h3>
        <p className="text-cout-yellow/90 text-lg mb-6">On vous cook ça...</p>

        {progress ? (
          <InstagramGenerationLoader progress={progress} />
        ) : (
          <div className="flex justify-center gap-1">
            <span className="w-2 h-2 bg-cout-yellow rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
            <span className="w-2 h-2 bg-cout-yellow rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
            <span className="w-2 h-2 bg-cout-yellow rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
          </div>
        )}
      </div>
    </div>
  );
}
