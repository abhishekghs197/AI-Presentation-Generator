
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ControlsPanel } from './components/ControlsPanel';
import { PresentationView } from './components/PresentationView';
import { generatePresentation, generateImage } from './services/geminiService';
import type { SlideContent, Theme, SavedSession } from './types';
import { Loader } from './components/Loader';

const SESSION_STORAGE_key = 'aiPresentationSession';
const MOBILE_BREAKPOINT = 768;

const App: React.FC = () => {
  const [topic, setTopic] = useState<string>('The Future of Renewable Energy');
  const [audience, setAudience] = useState<string>('University Students');
  const [slideCount, setSlideCount] = useState<number>(5);
  const [theme, setTheme] = useState<Theme>('dark');
  const [generateImages, setGenerateImages] = useState<boolean>(true);
  
  const [slides, setSlides] = useState<SlideContent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isLoadable, setIsLoadable] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>('');

  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      // Keep controls visible on desktop, respect current state on mobile
      if (!mobile) {
        setIsControlsVisible(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    if (localStorage.getItem(SESSION_STORAGE_key)) {
      setIsLoadable(true);
    }
  }, []);
  
  // Hide controls on mobile after generation to show the presentation
  useEffect(() => {
    if (isMobile && slides.length > 0) {
      setIsControlsVisible(false);
    }
  }, [slides, isMobile]);


  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setLoadingText('Generating presentation text...');
    setError(null);
    setSlides([]);
    setCurrentSlide(0);

    try {
      const generatedSlides = await generatePresentation(topic, audience, slideCount, theme);
      setSlides(generatedSlides);

      if (generateImages) {
        for (let index = 0; index < generatedSlides.length; index++) {
          const slide = generatedSlides[index];

          setLoadingText(`Generating image ${index + 1} of ${generatedSlides.length}...`);
          
          const imageResult = await generateImage(slide.title, slide.content, theme, topic);

          setSlides(prevSlides => 
            prevSlides.map((s, i) => (i === index ? { ...s, imageUrl: imageResult.imageUrl ?? undefined, imageError: imageResult.error ?? undefined } : s))
          );
          
          await new Promise(resolve => setTimeout(resolve, 20000));
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(`Failed to generate presentation: ${err.message}`);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
      setLoadingText('');
    }
  }, [topic, audience, slideCount, theme, generateImages]);

  const handleSaveSession = useCallback(() => {
    if (slides.length > 0) {
      const session: SavedSession = {
        topic,
        audience,
        slideCount,
        theme,
        generateImages,
        slides,
        currentSlide,
      };
      localStorage.setItem(SESSION_STORAGE_key, JSON.stringify(session));
      setIsLoadable(true);
      alert('Session saved!');
    }
  }, [topic, audience, slideCount, theme, generateImages, slides, currentSlide]);

  const handleLoadSession = useCallback(() => {
    const savedSession = localStorage.getItem(SESSION_STORAGE_key);
    if (savedSession) {
      try {
        const session: SavedSession = JSON.parse(savedSession);
        setTopic(session.topic);
        setAudience(session.audience);
        setSlideCount(session.slideCount);
        setTheme(session.theme);
        setGenerateImages(session.generateImages ?? true);
        setSlides(session.slides);
        setCurrentSlide(session.currentSlide);
        setError(null);
        setIsLoading(false);
        if (isMobile) {
          setIsControlsVisible(false);
        }
      } catch (e) {
        setError("Failed to load session. The saved data might be corrupted.");
        localStorage.removeItem(SESSION_STORAGE_key);
        setIsLoadable(false);
      }
    }
  }, [isMobile]);

  const handleNextSlide = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  }, [currentSlide, slides.length]);

  const handlePrevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  }, [currentSlide]);

  const handleImageUpload = (slideIndex: number, newImageUrl: string) => {
    setSlides(prevSlides =>
      prevSlides.map((slide, index) =>
        index === slideIndex ? { ...slide, imageUrl: newImageUrl, imageError: undefined } : slide
      )
    );
  };

  return (
    <div className="flex flex-col h-screen font-sans bg-slate-900 text-slate-100">
      <Header 
        showToggle={isMobile && slides.length > 0}
        isControlsVisible={isControlsVisible}
        onToggleControls={() => setIsControlsVisible(prev => !prev)}
      />
      <main className="flex-grow flex flex-col md:flex-row overflow-hidden">
        {isControlsVisible && (
          <ControlsPanel
            topic={topic}
            setTopic={setTopic}
            audience={audience}
            setAudience={setAudience}
            slideCount={slideCount}
            setSlideCount={setSlideCount}
            theme={theme}
            setTheme={setTheme}
            generateImages={generateImages}
            setGenerateImages={setGenerateImages}
            onGenerate={handleGenerate}
            isLoading={isLoading}
            onSave={handleSaveSession}
            onLoad={handleLoadSession}
            isSavable={slides.length > 0}
            isLoadable={isLoadable}
          />
        )}
        <div className="flex-grow flex flex-col items-center justify-center p-2 sm:p-4 md:p-8 bg-slate-800/50 overflow-auto">
          {isLoading ? (
            <Loader text={loadingText} />
          ) : error ? (
            <div className="text-center text-red-400 bg-red-900/50 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold mb-2">Error</h2>
              <p>{error}</p>
            </div>
          ) : slides.length > 0 ? (
            <PresentationView 
              slides={slides} 
              currentSlide={currentSlide}
              onNext={handleNextSlide}
              onPrev={handlePrevSlide}
              theme={theme}
              generateImages={generateImages}
              onImageUpload={handleImageUpload}
            />
          ) : (
            <div className="text-center text-slate-400 px-4">
              <h2 className="text-2xl font-bold mb-2">Welcome to the AI Presentation Generator</h2>
              <p>Fill in the details and click "Generate" to create your presentation.</p>
              {isLoadable && <p className="mt-4">Or, load your previously saved session.</p>}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
