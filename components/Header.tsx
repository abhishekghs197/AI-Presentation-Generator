
import React from 'react';
import { PresentationIcon, MenuIcon, CloseIcon } from './icons';

interface HeaderProps {
  showToggle: boolean;
  isControlsVisible: boolean;
  onToggleControls: () => void;
}

export const Header: React.FC<HeaderProps> = ({ showToggle, isControlsVisible, onToggleControls }) => {
  return (
    <header className="flex items-center justify-between p-4 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50 shadow-md flex-shrink-0">
      <div className="flex items-center">
        <PresentationIcon className="w-8 h-8 text-cyan-400 mr-3" />
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
          AI Presentation Generator
        </h1>
      </div>
      {showToggle && (
        <button 
          onClick={onToggleControls} 
          className="p-2 rounded-md text-slate-300 hover:bg-slate-700 md:hidden"
          aria-label={isControlsVisible ? "Hide controls" : "Show controls"}
        >
          {isControlsVisible ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
        </button>
      )}
    </header>
  );
};
