
import React, { useRef } from 'react';
import type { SlideContent, Theme } from '../types';
import { ChevronRightIcon, ImageIcon, ErrorIcon, UploadIcon } from './icons';

interface SlideProps {
  slide: SlideContent;
  theme: Theme;
  generateImages: boolean;
  slideNumber: number;
  totalSlides: number;
  isForExport?: boolean;
  onImageUpload?: (newImageUrl: string) => void;
}

const themeStyles = {
  dark: {
    bg: 'radial-gradient(circle at 10% 20%, rgb(30 41 59 / 0.9), rgb(15 23 42 / 0.95) 90%)',
    border: 'border-slate-700',
    title: 'text-cyan-300',
    titleBorder: 'border-slate-700/80',
    content: 'text-slate-300',
    accent: 'text-cyan-400',
    slideNumber: 'text-slate-500',
  },
  light: {
    bg: 'radial-gradient(circle at 10% 20%, rgb(241 245 249 / 0.9), rgb(226 232 255 / 0.95))',
    border: 'border-slate-300',
    title: 'text-slate-800',
    titleBorder: 'border-slate-300',
    content: 'text-slate-600',
    accent: 'text-blue-600',
    slideNumber: 'text-slate-400',
  },
  corporate: {
    bg: 'radial-gradient(circle at 10% 20%, rgb(239 246 255 / 0.9), rgb(219 234 254 / 0.95))',
    border: 'border-blue-200',
    title: 'text-blue-900',
    titleBorder: 'border-blue-200',
    content: 'text-slate-700',
    accent: 'text-blue-700',
    slideNumber: 'text-blue-300',
  },
  creative: {
    bg: 'radial-gradient(circle at 10% 20%, rgb(254 252 239 / 0.9), rgb(253 230 240 / 0.95))',
    border: 'border-purple-200',
    title: 'text-purple-700',
    titleBorder: 'border-purple-200',
    content: 'text-gray-800',
    accent: 'text-pink-500',
    slideNumber: 'text-purple-300',
  },
  ocean: {
    bg: 'radial-gradient(circle at 10% 20%, rgb(39, 105, 137, 0.9), rgb(11, 79, 108, 0.95))',
    border: 'border-cyan-700',
    title: 'text-white',
    titleBorder: 'border-cyan-600',
    content: 'text-cyan-100',
    accent: 'text-teal-300',
    slideNumber: 'text-cyan-400',
  },
  sunset: {
    bg: 'radial-gradient(circle at 10% 20%, rgb(109, 3, 62, 0.9), rgb(201, 75, 75, 0.95))',
    border: 'border-orange-600',
    title: 'text-white',
    titleBorder: 'border-orange-400',
    content: 'text-yellow-100',
    accent: 'text-yellow-300',
    slideNumber: 'text-orange-200',
  },
  forest: {
    bg: 'radial-gradient(circle at 10% 20%, rgb(26, 67, 20, 0.9), rgb(15, 43, 11, 0.95))',
    border: 'border-green-700',
    title: 'text-white',
    titleBorder: 'border-green-500',
    content: 'text-green-100',
    accent: 'text-lime-300',
    slideNumber: 'text-green-300',
  },
  galaxy: {
    bg: 'radial-gradient(circle at 10% 20%, rgb(40, 26, 67, 0.9), rgb(11, 15, 43, 0.95))',
    border: 'border-indigo-500',
    title: 'text-white',
    titleBorder: 'border-indigo-300',
    content: 'text-indigo-100',
    accent: 'text-violet-400',
    slideNumber: 'text-indigo-300',
  },
};

const ImagePlaceholder: React.FC<{ onUploadClick: () => void }> = ({ onUploadClick }) => (
    <div className="w-full h-full bg-slate-700/50 rounded-lg flex flex-col items-center justify-center text-center p-4">
        <div className="animate-pulse">
            <ImageIcon className="w-12 h-12 sm:w-16 sm:h-16 text-slate-500" />
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-2">Generating AI image...</p>
        <div className="h-px w-20 bg-slate-600 my-2 sm:my-4"></div>
        <button onClick={onUploadClick} className="flex items-center bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-3 sm:px-4 rounded-md transition-colors text-xs sm:text-sm">
            <UploadIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Upload Custom
        </button>
    </div>
);

const ImageErrorPlaceholder: React.FC<{ error: string; onUploadClick: () => void }> = ({ error, onUploadClick }) => (
    <div className="w-full h-full bg-red-900/20 border border-red-500/30 rounded-lg flex flex-col items-center justify-center p-4 text-center">
        <ErrorIcon className="w-10 h-10 sm:w-12 sm:h-12 text-red-400 mb-2" />
        <p className="text-sm font-semibold text-red-300">Image Generation Failed</p>
        <p className="text-xs text-red-400 mt-1">{error}</p>
        <button onClick={onUploadClick} className="mt-4 flex items-center bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-md transition-colors">
            <UploadIcon className="w-5 h-5 mr-2" />
            Upload Image
        </button>
    </div>
);


export const Slide: React.FC<SlideProps> = ({ slide, theme, generateImages, slideNumber, totalSlides, isForExport = false, onImageUpload }) => {
  const currentTheme = themeStyles[theme] || themeStyles.dark;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const textShadowStyle = { textShadow: '0 2px 6px rgba(0, 0, 0, 0.5)' };
  const contentTextShadowStyle = { textShadow: '0 1px 3px rgba(0, 0, 0, 0.4)' };
  
  const handleImageUploadClick = () => {
    if (!isForExport) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && onImageUpload) {
          const reader = new FileReader();
          reader.onloadend = () => {
              onImageUpload(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const contentSection = (
    <div className={generateImages ? 'w-full md:w-3/5' : 'w-full'}>
      <h2 
        className={`text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4 sm:mb-6 pb-4 border-b-2 ${!isForExport && 'animate-fadeInDown'} ${currentTheme.title} ${currentTheme.titleBorder}`}
        style={textShadowStyle}
      >
        {slide.title}
      </h2>
      <ul className={`space-y-3 sm:space-y-4 text-base sm:text-lg md:text-xl list-none leading-relaxed ${currentTheme.content}`}>
        {slide.content.map((point, index) => (
          <li 
            key={index} 
            className={`flex items-start ${!isForExport && 'animate-fadeInUp'}`}
            style={{ animationDelay: isForExport ? '0s' : `${100 + index * 150}ms`, opacity: isForExport ? 1 : 0, ...contentTextShadowStyle }}
          >
            <ChevronRightIcon className={`w-6 h-6 sm:w-7 sm:h-7 mr-2 sm:mr-3 mt-1 flex-shrink-0 ${currentTheme.accent}`} />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  const imageSection = (
    <div className="w-full md:w-2/5 h-48 sm:h-64 md:h-full mt-6 md:mt-0 md:pl-8 relative group">
        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden"
            accept="image/*"
        />
        {slide.imageUrl ? (
            <>
                <img 
                    src={slide.imageUrl} 
                    alt={slide.title} 
                    className={`w-full h-full object-cover rounded-lg shadow-2xl ${!isForExport && 'animate-imageFadeIn'}`} 
                />
                {!isForExport && (
                    <button
                        onClick={handleImageUploadClick}
                        className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"
                        aria-label="Change image for this slide"
                    >
                        <UploadIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white/90" />
                        <span className="ml-2 text-white/90 font-semibold">Change Image</span>
                    </button>
                )}
            </>
        ) : slide.imageError ? (
            <ImageErrorPlaceholder error={slide.imageError} onUploadClick={handleImageUploadClick} />
        ) : (
            <ImagePlaceholder onUploadClick={handleImageUploadClick} />
        )}
    </div>
  );

  return (
    <div 
      className={`w-full h-full border rounded-lg shadow-2xl overflow-hidden relative ${!isForExport && 'animate-fadeIn'} ${currentTheme.border}`}
    >
      {/* Background Layer */}
      {generateImages && slide.imageUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center filter blur-lg brightness-50 scale-110"
          style={{ backgroundImage: `url(${slide.imageUrl})` }}
        />
      )}

      {/* Overlay Layer */}
      <div
        className="absolute inset-0"
        style={{ background: currentTheme.bg }}
      />
      
      {/* Content Layer */}
      <div className="relative z-10 p-4 sm:p-8 md:p-10 flex flex-col md:flex-row h-full w-full overflow-y-auto">
        {contentSection}
        {generateImages && imageSection}
      </div>

      <div className={`absolute bottom-2 sm:bottom-4 right-3 sm:right-6 text-xs sm:text-sm font-mono z-10 ${currentTheme.slideNumber}`}>
        {slideNumber} / {totalSlides}
      </div>
    </div>
  );
};
