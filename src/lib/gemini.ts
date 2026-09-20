import { GoogleGenAI } from '@google/genai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Lazy initialization of GoogleGenAI client if API key is present
let aiClient: GoogleGenAI | null = null;
if (apiKey && apiKey.trim().length > 0) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (error) {
    console.warn('Failed to initialize GoogleGenAI client:', error);
  }
}

export interface KisanMitraAIRequest {
  query: string;
  lang: 'te' | 'hi' | 'en' | string;
  activeTokenInfo?: string;
}

/**
  * Send prompt to Google AI Studio Gemini API with agricultural persona system instruction
  */
export async function askKisanMitraAI({
  query,
  lang,
  activeTokenInfo,
}: KisanMitraAIRequest): Promise<string | null> {
  const currentKey = import.meta.env.VITE_GEMINI_API_KEY || apiKey;
  
  if (!currentKey || !currentKey.trim()) {
    console.warn('Google AI Studio API Key (VITE_GEMINI_API_KEY) is not set in environment variables.');
    return null;
  }

  if (!aiClient) {
    try {
      aiClient = new GoogleGenAI({ apiKey: currentKey });
    } catch (e) {
      console.error('Error creating GoogleGenAI instance:', e);
      return null;
    }
  }

  const languageMap: Record<string, string> = {
    te: 'Telugu (తెలుగు)',
    hi: 'Hindi (हिंदी)',
    en: 'English',
  };

  const targetLang = languageMap[lang] || 'English';

  const systemInstruction = `You are "KisanMitra" (కిసాన్ మిత్ర / किसान मित्र), a warm, empathetic, and expert AI Agricultural Assistant for Indian farmers using the KisanConnect platform in Andhra Pradesh and Telangana.

Key Directives:
1. Always respond strictly in ${targetLang}.
2. Keep your answers concise, practical, helpful, and formatted clearly with bullet points if listing steps.
3. Help farmers with crop guidance, pest management, weather advisories, minimum support prices (MSP), fertilizer advice, quality testing, and government schemes.
4. Maintain a polite and respectful tone (e.g. using Namaste / నమస్కారం / నమస్తే).
5. If token or queue information is provided, incorporate it accurately into your reply: ${activeTokenInfo || 'No active token specified'}.
6. Avoid overly technical jargon; explain agricultural practices in simple terms actionable by farmers.`;

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: query,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    if (response && response.text) {
      return response.text.trim();
    }
    return null;
  } catch (error) {
    console.error('Google AI Studio Gemini API Call Error:', error);
    return null;
  }
}
