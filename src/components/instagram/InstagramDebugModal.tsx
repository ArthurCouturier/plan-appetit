import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface Props {
  debugData: {
    frameCount: number;
    frames: string[];
    frameAnalyses: string[];
    audioTranscription: string | null;
    recipeUuid: string;
    recipeName: string;
  };
  onClose: () => void;
}

export default function InstagramDebugModal({ debugData, onClose }: Props) {
  const navigate = useNavigate();
  const [frameIndex, setFrameIndex] = useState(0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-primary rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-border-color">
        <div className="sticky top-0 bg-primary border-b border-border-color p-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-lg font-bold text-text-primary">Debug Import Instagram</h2>
            <p className="text-sm text-text-secondary">{debugData.recipeName} - {debugData.frameCount} frames</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { navigate(`/recettes/${debugData.recipeUuid}`); onClose(); }}
              className="px-4 py-2 bg-cout-purple text-white font-semibold rounded-lg hover:bg-cout-base transition-colors"
            >
              Voir la recette
            </button>
            <button onClick={onClose} className="p-2 hover:bg-bg-color rounded-lg transition-colors">
              <XMarkIcon className="w-5 h-5 text-text-secondary" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Frame viewer */}
          <div>
            <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wide">
              Frame {frameIndex + 1}/{debugData.frameCount}
            </h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFrameIndex(Math.max(0, frameIndex - 1))}
                disabled={frameIndex === 0}
                className="p-2 bg-bg-color rounded-lg hover:bg-border-color transition-colors disabled:opacity-30"
              >
                <ChevronLeftIcon className="w-5 h-5 text-text-primary" />
              </button>
              <div className="flex-1 flex flex-col items-center">
                <img
                  src={debugData.frames[frameIndex]}
                  alt={`Frame ${frameIndex + 1}`}
                  className="rounded-lg max-h-64 object-contain border border-border-color"
                />
                <p className="mt-3 text-sm text-text-primary bg-bg-color rounded-lg p-3 w-full">
                  {debugData.frameAnalyses[frameIndex]}
                </p>
              </div>
              <button
                onClick={() => setFrameIndex(Math.min(debugData.frameCount - 1, frameIndex + 1))}
                disabled={frameIndex === debugData.frameCount - 1}
                className="p-2 bg-bg-color rounded-lg hover:bg-border-color transition-colors disabled:opacity-30"
              >
                <ChevronRightIcon className="w-5 h-5 text-text-primary" />
              </button>
            </div>
            <div className="flex gap-1.5 mt-3 overflow-x-auto pb-2">
              {debugData.frames.map((frame, i) => (
                <button
                  key={i}
                  onClick={() => setFrameIndex(i)}
                  className={`flex-shrink-0 rounded-md overflow-hidden border-2 transition-colors ${
                    i === frameIndex ? "border-cout-purple" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={frame} alt={`Thumb ${i + 1}`} className="w-14 h-14 object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Audio transcription */}
          {debugData.audioTranscription && (
            <div>
              <h3 className="text-sm font-semibold text-text-secondary mb-2 uppercase tracking-wide">Transcription audio</h3>
              <p className="text-sm text-text-primary bg-bg-color rounded-lg p-3 whitespace-pre-wrap">{debugData.audioTranscription}</p>
            </div>
          )}

          {/* All analyses */}
          <div>
            <h3 className="text-sm font-semibold text-text-secondary mb-2 uppercase tracking-wide">Toutes les analyses</h3>
            <div className="space-y-2">
              {debugData.frameAnalyses.map((analysis, i) => (
                <div
                  key={i}
                  onClick={() => setFrameIndex(i)}
                  className={`text-sm p-2 rounded-lg cursor-pointer transition-colors ${
                    i === frameIndex
                      ? "bg-cout-purple/10 border border-cout-purple/30 text-text-primary"
                      : "bg-bg-color text-text-secondary hover:bg-border-color"
                  }`}
                >
                  <span className="font-semibold text-cout-purple">#{i + 1}</span> {analysis}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
