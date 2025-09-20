

import React, { useRef, useEffect } from 'react';
import { DownloadIcon, ResetIcon } from './icons';

interface VideoPlayerProps {
  videoUrl: string;
  audioUrl: string | null;
  speechText?: string | null;
  audioVolume?: number;
  onReset: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, audioUrl, speechText, audioVolume, onReset }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !speechText) {
      window.speechSynthesis.cancel();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(speechText);

    const handlePlay = () => {
      window.speechSynthesis.cancel(); 
      window.speechSynthesis.speak(utterance);
    };

    const handlePauseOrEnd = () => {
      window.speechSynthesis.cancel();
    };

    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePauseOrEnd);
    videoElement.addEventListener('ended', handlePauseOrEnd);

    return () => {
      window.speechSynthesis.cancel();
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePauseOrEnd);
      videoElement.removeEventListener('ended', handlePauseOrEnd);
    };
  }, [videoUrl, speechText]);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (audioElement && audioVolume !== undefined) {
      audioElement.volume = audioVolume / 100;
    }
  }, [audioUrl, audioVolume]);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center animate-fade-in">
      <div className="w-full rounded-xl overflow-hidden shadow-2xl shadow-brand-purple/20 mb-6">
        <video ref={videoRef} src={videoUrl} controls autoPlay loop={!speechText} className="w-full h-full object-contain" />
      </div>
      {audioUrl && (
        <div className="w-full max-w-lg mb-6">
          <p className="text-center text-sm text-gray-400 mb-2">Background Audio</p>
          <audio ref={audioRef} src={audioUrl} controls autoPlay loop className="w-full" />
        </div>
      )}
      <div className="flex items-center space-x-4">
        <a
          href={videoUrl}
          download="cinematic_video.mp4"
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-brand-purple hover:bg-brand-purple-light transition-all duration-300 transform hover:scale-105"
        >
          <DownloadIcon className="w-5 h-5 mr-2" />
          Download
        </a>
        <button
            onClick={onReset}
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-600 text-base font-medium rounded-full text-gray-300 bg-brand-ray-light hover:bg-gray-600 hover:text-white transition-all duration-300"
        >
            <ResetIcon className="w-5 h-5 mr-2" />
            Create Another
        </button>
      </div>
    </div>
  );
};

export default VideoPlayer;