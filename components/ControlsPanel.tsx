
import React from 'react';
import { SparklesIcon, ThemeIcon, SaveIcon, LoadIcon } from './icons';
import type { Theme } from '../types';

interface ControlsPanelProps {
  topic: string;
  setTopic: (value: string) => void;
  audience: string;
  setAudience: (value: string) => void;
  slideCount: number;
  setSlideCount: (value: number) => void;
  theme: Theme;
  setTheme: (value: Theme) => void;
  generateImages: boolean;
  setGenerateImages: (value: boolean) => void;
  onGenerate: () => void;
  isLoading: boolean;
  onSave: () => void;
  onLoad: () => void;
  isSavable: boolean;
  isLoadable: boolean;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  topic,
  setTopic,
  audience,
  setAudience,
  slideCount,
  setSlideCount,
  theme,
  setTheme,
  generateImages,
  setGenerateImages,
  onGenerate,
  isLoading,
  onSave,
  onLoad,
  isSavable,
  isLoadable,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic && audience && slideCount > 0) {
      onGenerate();
    }
  };

  return (
    <aside className="w-full md:w-96 bg-slate-800 p-6 flex-shrink-0 border-r border-slate-700/50 overflow-y-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-slate-300 mb-2">
            Presentation Topic
          </label>
          <input
            type="text"
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
            placeholder="e.g., The Future of AI"
            required
          />
        </div>
        <div>
          <label htmlFor="audience" className="block text-sm font-medium text-slate-300 mb-2">
            Target Audience
          </label>
          <input
            type="text"
            id="audience"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
            placeholder="e.g., High School Students"
            required
          />
        </div>
        <div>
          <label htmlFor="slideCount" className="block text-sm font-medium text-slate-300 mb-2">
            Number of Slides ({slideCount})
          </label>
          <input
            type="range"
            id="slideCount"
            min="3"
            max="15"
            value={slideCount}
            onChange={(e) => setSlideCount(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <div className="flex justify-between items-center">
            <div className="flex-grow pr-4">
                <label htmlFor="theme" className="block text-sm font-medium text-slate-300 mb-2">
                    Color Theme
                </label>
                <div className="relative">
                    <ThemeIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                    id="theme"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as Theme)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 pl-10 pr-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition appearance-none"
                    >
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                        <option value="corporate">Corporate</option>
                        <option value="creative">Creative</option>
                        <option value="ocean">Ocean</option>
                        <option value="sunset">Sunset</option>
                        <option value="forest">Forest</option>
                        <option value="galaxy">Galaxy</option>
                    </select>
                </div>
            </div>
            <div className="flex flex-col items-center">
                <label htmlFor="generateImages" className="block text-sm font-medium text-slate-300 mb-2">
                    AI Images
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" id="generateImages" className="sr-only peer" checked={generateImages} onChange={(e) => setGenerateImages(e.target.checked)} />
                    <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-cyan-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                    <span className="sr-only">Toggle AI Image Generation</span>
                </label>
            </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-md transition-all duration-200 ease-in-out disabled:bg-slate-500 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500 shadow-lg transform hover:scale-105"
        >
          <SparklesIcon className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Generating...' : 'Generate Presentation'}
        </button>
      </form>
      <div className="mt-6 pt-6 border-t border-slate-700/50 flex space-x-4">
        <button
          type="button"
          onClick={onSave}
          disabled={isLoading || !isSavable}
          className="w-full flex items-center justify-center bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"
        >
          <SaveIcon className="w-5 h-5 mr-2" />
          Save
        </button>
        <button
          type="button"
          onClick={onLoad}
          disabled={isLoading || !isLoadable}
          className="w-full flex items-center justify-center bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"
        >
          <LoadIcon className="w-5 h-5 mr-2" />
          Load
        </button>
      </div>
    </aside>
  );
};