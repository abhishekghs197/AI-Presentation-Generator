import React, { useState, useRef, useEffect } from 'react';
import * as ReactDOMClient from 'react-dom/client';
import { Slide } from './Slide';
import { ChevronLeftIcon, ChevronRightIcon, ExportIcon, PlayIcon, PauseIcon } from './icons';
import type { SlideContent, Theme } from '../types';

interface PresentationViewProps {
  slides: SlideContent[];
  currentSlide: number;
  onNext: () => void;
  onPrev: () => void;
  theme: Theme;
  generateImages: boolean;
  onImageUpload: (slideIndex: number, newImageUrl: string) => void;
}

export const PresentationView: React.FC<PresentationViewProps> = ({ slides, currentSlide, onNext, onPrev, theme, generateImages, onImageUpload }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportingMessage, setExportingMessage] = useState('');
  const [exportOpen, setExportOpen] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [autoPlayInterval, setAutoPlayInterval] = useState(5000);
  const [libsLoaded, setLibsLoaded] = useState({ pdf: false, pptx: false });
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Poll to check if the external CDN scripts for exporting have loaded.
    let attempts = 0;
    const maxAttempts = 60; // Stop checking after 30 seconds

    const checkLibs = () => {
        attempts++;
        const pdfReady = !!(window.jspdf?.jsPDF && window.html2canvas);
        const pptxReady = !!window.pptxgenjs?.PptxGenJS;

        setLibsLoaded({ pdf: pdfReady, pptx: pptxReady });

        if ((pdfReady && pptxReady) || attempts >= maxAttempts) {
            clearInterval(intervalId);
        }
    };

    const intervalId = setInterval(checkLibs, 500);
    checkLibs(); // Initial check right away

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setExportOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  useEffect(() => {
    if (!isAutoPlaying || currentSlide >= slides.length - 1) {
      if (isAutoPlaying && currentSlide >= slides.length - 1) {
        setIsAutoPlaying(false); // Stop playing at the end
      }
      return;
    }

    const timerId = setTimeout(() => {
      onNext();
    }, autoPlayInterval);

    return () => clearTimeout(timerId);
  }, [isAutoPlaying, currentSlide, autoPlayInterval, onNext, slides.length]);


  if (slides.length === 0) return null;
  
  const currentPresentationSlide = slides[currentSlide];
  if (!currentPresentationSlide) {
      return (
          <div className="text-center text-red-400 bg-red-900/50 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold mb-2">Error</h2>
              <p>Could not find slide data for index {currentSlide}. The presentation state might be corrupted.</p>
          </div>
      );
  }


  const handleExportJSON = () => {
    setExportOpen(false);
    const jsonString = JSON.stringify(slides, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'presentation.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportPPTX = async () => {
    setExportOpen(false);
    if (!libsLoaded.pptx) {
      alert('PPTX export library is not available. Please check your internet connection and refresh.');
      return;
    }
    setExportingMessage('Preparing PPTX export...');
    setIsExporting(true);

    try {
        const pptx = new window.pptxgenjs.PptxGenJS();
        pptx.layout = 'LAYOUT_16x9';

        const themeColors = {
            dark: { bg: '1E293B', text: 'E0F2FE', accent: '22D3EE' },
            light: { bg: 'F1F5F9', text: '334155', accent: '2563EB' },
            corporate: { bg: 'EFF6FF', text: '1E3A8A', accent: '1D4ED8' },
            creative: { bg: 'FEFCE8', text: '701A75', accent: 'EC4899' },
            ocean: { bg: '0B4F6C', text: 'FBFBFF', accent: '20BF55' },
            sunset: { bg: '4D194D', text: 'FFFFFF', accent: 'FF9505' },
            forest: { bg: '1A4314', text: 'E8F5E9', accent: '9CCC65' },
            galaxy: { bg: '191970', text: 'E6E6FA', accent: '9370DB' },
        };
        const currentThemeColors = themeColors[theme] || themeColors.dark;

        for (let i = 0; i < slides.length; i++) {
            const slide = slides[i];
            setExportingMessage(`Adding slide ${i + 1} of ${slides.length} to PPTX...`);
            await new Promise(resolve => setTimeout(resolve, 50)); // Small delay for UX

            const pptxSlide = pptx.addSlide();
            pptxSlide.background = { color: currentThemeColors.bg };

            const hasImage = generateImages && slide.imageUrl;
            const textWidth = hasImage ? 5.5 : 9; // inches

            // Add Title
            pptxSlide.addText(slide.title, {
                x: 0.5,
                y: 0.25,
                w: textWidth,
                h: 1,
                fontSize: 32,
                bold: true,
                color: currentThemeColors.accent,
                align: 'left',
            });

            // Add Content
            pptxSlide.addText(slide.content.join('\n'), {
                x: 0.5,
                y: 1.25,
                w: textWidth,
                h: 4,
                fontSize: 18,
                color: currentThemeColors.text,
                align: 'left',
                bullet: { type: 'bullet' },
            });

            if (hasImage && slide.imageUrl) {
                pptxSlide.addImage({
                    data: slide.imageUrl,
                    x: 6.25,
                    y: 0.56,
                    w: 3.5,
                    h: 4.5,
                });
            }
        }
        
        setExportingMessage('Finalizing and downloading PPTX...');
        await pptx.writeFile({ fileName: 'presentation.pptx' });
    } catch (error) {
        console.error("Failed to export PPTX:", error);
        alert("An error occurred while exporting to PowerPoint.");
    } finally {
        setIsExporting(false);
        setExportingMessage('');
    }
  };

  const handleExportPDF = async () => {
    setExportOpen(false);
    if (!libsLoaded.pdf) {
      alert('PDF export libraries not loaded. Please refresh the page.');
      return;
    }
    setIsExporting(true);
    setExportingMessage('Preparing PDF export...');

    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = '1280px';
    tempContainer.style.height = '720px';
    document.body.appendChild(tempContainer);

    const root = ReactDOMClient.createRoot(tempContainer);
    
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [1280, 720],
    });

    try {
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        setExportingMessage(`Rendering slide ${i + 1} of ${slides.length}...`);
        
        root.render(
          <div className="w-full h-full flex">
            <Slide slide={slide} theme={theme} generateImages={generateImages} slideNumber={i + 1} totalSlides={slides.length} isForExport={true} />
          </div>
        );

        // Wait for the next browser paint cycle to ensure the component is fully rendered
        await new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 50)));

        const canvas = await window.html2canvas(tempContainer, { 
            scale: 2, // Higher scale for better quality
            useCORS: true, 
        });
        const imgData = canvas.toDataURL('image/png');
        
        if (i > 0) {
          pdf.addPage([1280, 720], 'landscape');
        }
        
        pdf.addImage(imgData, 'PNG', 0, 0, 1280, 720, undefined, 'FAST');
      }
      
      setExportingMessage('Saving PDF file...');
      pdf.save('presentation.pdf');

    } catch (error) {
        console.error("Failed to export PDF:", error);
        alert("An error occurred while creating the PDF. Please check the console for details.");
    } finally {
        root.unmount();
        document.body.removeChild(tempContainer);
        setIsExporting(false);
        setExportingMessage('');
    }
  };

  return (
    <div className="w-full max-w-4xl h-full flex flex-col">
      <div className="flex-grow relative overflow-hidden rounded-lg aspect-video">
          <Slide 
            key={currentSlide} 
            slide={currentPresentationSlide} 
            theme={theme} 
            generateImages={generateImages}
            slideNumber={currentSlide + 1}
            totalSlides={slides.length}
            onImageUpload={(newImageUrl) => onImageUpload(currentSlide, newImageUrl)}
          />
          {isExporting && (
            <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center rounded-lg z-20">
              <div className="w-16 h-16 border-4 border-slate-500 border-t-cyan-400 rounded-full animate-spin"></div>
              <p className="mt-4 text-lg text-slate-300">{exportingMessage}</p>
            </div>
          )}
           {isAutoPlaying && currentSlide < slides.length - 1 && (
            <div className="absolute bottom-0 left-0 h-1 bg-cyan-400/80 rounded-full"
                key={currentSlide}
                style={{ animation: `progressBar ${autoPlayInterval / 1000}s linear forwards` }}
            />
           )}
      </div>
      <div className="flex items-center justify-between p-2 sm:p-4 mt-4 bg-slate-900/50 rounded-lg shadow-inner flex-wrap gap-y-2">
        <div className="flex items-center justify-center flex-grow-[2]">
            <button
            onClick={onPrev}
            disabled={currentSlide === 0 || isExporting}
            className="p-2 rounded-full bg-slate-700 hover:bg-cyan-600 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous slide"
            >
            <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <span className="mx-4 sm:mx-6 text-base sm:text-lg font-semibold text-slate-300 tabular-nums">
            Slide {currentSlide + 1} of {slides.length}
            </span>
            <button
            onClick={onNext}
            disabled={currentSlide === slides.length - 1 || isExporting}
            className="p-2 rounded-full bg-slate-700 hover:bg-cyan-600 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors"
            aria-label="Next slide"
            >
            <ChevronRightIcon className="w-6 h-6" />
            </button>
        </div>
        
        <div className="h-6 w-px bg-slate-700 mx-4 hidden md:block"></div>

        <div className="flex items-center justify-center flex-grow">
            <button
            onClick={() => setIsAutoPlaying(p => !p)}
            disabled={isExporting}
            className="p-2 rounded-full bg-slate-700 hover:bg-cyan-600 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors"
            aria-label={isAutoPlaying ? "Pause auto-advance" : "Start auto-advance"}
            >
            {isAutoPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
            </button>
            <select
            value={autoPlayInterval}
            onChange={(e) => setAutoPlayInterval(Number(e.target.value))}
            disabled={isExporting}
            className="ml-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm py-1.5 px-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition appearance-none text-sm"
            aria-label="Auto-advance interval"
            >
                <option value="3000">3s</option>
                <option value="5000">5s</option>
                <option value="10000">10s</option>
                <option value="15000">15s</option>
            </select>
        </div>

        <div className="relative flex-grow flex justify-end" ref={dropdownRef}>
          <button
            onClick={() => setExportOpen(prev => !prev)}
            disabled={isExporting}
            className="p-2 rounded-full bg-slate-700 hover:bg-cyan-600 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors flex items-center"
            aria-label="Export presentation"
          >
            <ExportIcon className="w-6 h-6" />
          </button>
          {exportOpen && (
            <div className="absolute bottom-full right-0 mb-2 w-48 bg-slate-700 rounded-md shadow-lg z-10 border border-slate-600">
              <ul className="py-1">
                <li>
                  <button
                    onClick={handleExportPPTX}
                    disabled={!libsLoaded.pptx || isExporting}
                    className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={!libsLoaded.pptx ? "Export service is loading..." : "Export as PowerPoint"}
                  >
                    Export as PPTX {!libsLoaded.pptx && '...'}
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleExportPDF}
                    disabled={!libsLoaded.pdf || isExporting}
                    className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                     title={!libsLoaded.pdf ? "Export service is loading..." : "Export as PDF"}
                  >
                    Export as PDF {!libsLoaded.pdf && '...'}
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleExportJSON}
                    className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-cyan-600 transition-colors"
                  >
                    Export as JSON
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};