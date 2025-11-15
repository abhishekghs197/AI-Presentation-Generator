declare global {
  interface Window {
    jspdf: any;
    html2canvas: (element: HTMLElement, options?: any) => Promise<HTMLCanvasElement>;
    pptxgenjs: any;
  }
}

export type Theme = 'dark' | 'light' | 'corporate' | 'creative' | 'ocean' | 'sunset' | 'forest' | 'galaxy';

export interface SlideContent {
  title: string;
  content: string[];
  imageUrl?: string;
  imageError?: string;
}

export interface SavedSession {
  topic: string;
  audience: string;
  slideCount: number;
  theme: Theme;
  slides: SlideContent[];
  currentSlide: number;
  generateImages: boolean;
}