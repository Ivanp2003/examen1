const API_KEY: string = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

interface GeminiPart {
  text: string;
}

interface GeminiContent {
  role: 'user' | 'model';
  parts: GeminiPart[];
}

interface GeminiResponse {
  candidates: {
    content: { parts: GeminiPart[] };
  }[];
}

export const askGemini = async (prompt: string, history: GeminiContent[] = []): Promise<string> => {
  const contents: GeminiContent[] = [
    ...history,
    { role: 'user', parts: [{ text: prompt }] },
  ];

  const response = await fetch(`${API_URL}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data: GeminiResponse = await response.json();
  return data.candidates[0].content.parts[0].text;
};
