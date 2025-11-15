import React from 'react';

interface LoaderProps {
  text?: string;
}

export const Loader: React.FC<LoaderProps> = ({ text }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative w-24 h-24">
        <div className="absolute border-4 border-slate-500 rounded-full w-full h-full animate-spin border-t-cyan-400"></div>
        <div className="absolute border-4 border-slate-600 rounded-full w-full h-full animate-ping opacity-50"></div>
      </div>
      <h2 className="text-xl font-semibold text-slate-300 mt-6">{text || 'Generating Presentation...'}</h2>
      <p className="text-slate-400 mt-2">The AI is working its magic. This may take a moment.</p>
    </div>
  );
};
