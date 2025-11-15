
import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { SlideContent, Theme } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const presentationSchema = {
  type: Type.ARRAY,
  description: "An array of presentation slides.",
  items: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: 'A concise and engaging title for the slide.',
      },
      content: {
        type: Type.ARRAY,
        description: 'An array of key bullet points for the slide content. Each string is a separate point.',
        items: {
          type: Type.STRING,
        },
      },
    },
    required: ['title', 'content'],
  },
};

export async function generatePresentation(
  topic: string,
  audience: string,
  slideCount: number,
  theme: Theme
): Promise<SlideContent[]> {
  const prompt = `
    Generate a professional presentation on the topic: "${topic}".
    The target audience for this presentation is: "${audience}".
    The desired visual theme for this presentation is "${theme}". Please ensure the tone of the content aligns with this theme (e.g., professional for 'corporate', vibrant for 'creative').
    Create exactly ${slideCount} slides for the core content.
    Each slide must have a clear, concise title and between 2 to 5 key bullet points for the content.
    The tone should be informative and engaging for the specified audience.
    Do not include an introductory "Title" slide or a final "Conclusion" slide. The first slide should be the beginning of the core content.
    Adhere strictly to the provided JSON schema for the output.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: presentationSchema,
        temperature: 0.7,
      },
    });

    const jsonText = response.text.trim();
    const presentationData: Omit<SlideContent, 'imageUrl'>[] = JSON.parse(jsonText);

    if (!Array.isArray(presentationData)) {
      throw new Error("API did not return an array of slides.");
    }
    
    presentationData.push({ title: 'Thank You!', content: ['Any Questions?'] });

    return presentationData;

  } catch (error) {
    console.error("Error generating presentation:", error);
    if (error instanceof Error) {
        throw new Error(`Gemini API call failed: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the Gemini API.");
  }
}

// Helper for delays
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function generateImage(
  title: string,
  content: string[],
  theme: Theme,
  topic: string
): Promise<{ imageUrl: string | null; error: string | null; }> {
  const styleHints = {
    dark: 'A sleek and modern image with a dark color palette, minimalist vector art, abstract.',
    light: 'A clean and bright image with a light color palette, minimalist vector art, professional.',
    corporate: 'A professional, photorealistic image suitable for a business presentation. Use corporate blues and greys. High-quality.',
    creative: 'A vibrant, abstract illustration with energetic colors like purple and pink. Be artistic and bold.',
    ocean: 'An underwater scene or a serene beach, with blues, teals, and greens. Calm and professional.',
    sunset: 'A warm and vibrant image with a gradient of sunset colors like orange, pink, and purple. Evokes a sense of calm and opportunity.',
    forest: 'A lush forest or nature-inspired scene. Use earthy tones, greens, and browns. Grounded and organic feel.',
    galaxy: 'A futuristic, space-themed image with deep blues, purples, and blacks. Think nebulae, stars, and cosmic dust. High-tech and imaginative.',
  };
  
  const isGenericSlide = /^(thank you|q&a|questions|conclusion)/i.test(title);
  
  const contentContext = isGenericSlide
    ? `The main topic of the presentation is "${topic}". Generate a beautiful, abstract background image that captures the essence of this topic. This image will be used on the final "Thank you" or "Q&A" slide.`
    : `The image must be directly relevant to the slide's content. The slide title and content may be in a language other than English; please analyze the core concepts and keywords to create a universally understandable and relevant image.\n**Slide Title**: "${title}"\n**Slide Content**:\n- ${content.join('\n- ')}`;

  const prompt = `
    Generate a single, visually stunning background image for a presentation slide.
    ${contentContext}
    The presentation has a "${theme}" theme.
    **Style guide**: ${styleHints[theme]}
    Do not include any text, words, or letters in the image. The image must be purely visual.
    Create a high-quality, professional-looking image. Aspect ratio should be 16:9.
  `;

  const MAX_RETRIES = 3;
  let lastError: any = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [{ text: prompt }] },
          config: {
              responseModalities: [Modality.IMAGE],
          },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64ImageBytes: string = part.inlineData.data;
          return { imageUrl: `data:image/png;base64,${base64ImageBytes}`, error: null };
        }
      }
      
      console.warn(`No image data returned from API for slide titled "${title}". This might be due to safety filters or other content restrictions.`);
      return { imageUrl: null, error: 'Image generation was blocked due to safety filters.' };

    } catch (error: any) {
      lastError = error;
      console.error(`Attempt ${attempt} failed for slide "${title}":`, error);
      
      const errorMessage = (JSON.stringify(error) || '').toLowerCase();

      // Check for retriable errors (rate limit, server error)
      const isRetriable = errorMessage.includes('resource_exhausted') || errorMessage.includes('429') || errorMessage.includes('500') || errorMessage.includes('unknown');
      
      if (isRetriable && attempt < MAX_RETRIES) {
        // Exponential backoff: 8s, 16s
        const delay = Math.pow(2, attempt) * 4000;
        console.log(`Retrying in ${delay / 1000}s due to retriable error...`);
        await sleep(delay);
      } else {
        // Not a retriable error or final attempt failed, so break
        break;
      }
    }
  }
  
  console.error(`Failed to generate image for slide "${title}" after ${MAX_RETRIES} attempts.`, lastError);

  if (lastError && typeof lastError.message === 'string' && lastError.message.toLowerCase().includes('resource_exhausted')) {
    return { imageUrl: null, error: 'API quota exceeded. Please check your plan and try again later.' };
  }
  return { imageUrl: null, error: 'A persistent API error occurred. Please try again later.' };
}
