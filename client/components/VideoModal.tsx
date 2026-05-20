import { X } from "lucide-react";
import { useEffect, useState } from "react";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
}

export default function VideoModal({ isOpen, onClose, videoUrl, title }: VideoModalProps) {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
    if (isOpen && videoUrl) {
      console.log('VideoModal opened with URL:', videoUrl);
    }
  }, [videoUrl, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-5xl mx-4" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-purple-500 transition-colors"
        >
          <X className="w-8 h-8" />
        </button>
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          {!videoUrl ? (
            <div className="flex items-center justify-center h-full text-white">
              <p>No video URL provided</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-white">
              <p>Unable to load video. Please try again.</p>
            </div>
          ) : (
            <video
              key={videoUrl}
              src={videoUrl}
              title={title}
              className="w-full h-full"
              controls
              controlsList="nodownload"
              playsInline
              preload="auto"
              onError={(e) => {
                console.error('Video error:', e);
                setError(true);
              }}
              onLoadedData={() => console.log('Video loaded successfully')}
            />
          )}
        </div>
      </div>
    </div>
  );
}
