
import React, { useState, useEffect } from 'react';
import { SpinnerIcon } from './icons';
import { LOADING_MESSAGES } from '../constants';

const Loader: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % LOADING_MESSAGES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-brand-gray-dark rounded-xl shadow-2xl animate-fade-in">
      <SpinnerIcon className="w-16 h-16 text-brand-purple-light animate-spin mb-6" />
      <h2 className="text-2xl font-bold text-white mb-2">Generating Your Cinematic Video</h2>
      <p className="text-gray-400 text-center max-w-md transition-opacity duration-500">
        {LOADING_MESSAGES[messageIndex]}
      </p>
    </div>
  );
};

export default Loader;
