const API_KEY: string = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY ?? '';
const MODEL = "deepseek/deepseek-chat-v3-0324";

export const askGemini = async (prompt: string, history: any[] = [], retries = 3): Promise<string> => {
  const url = "https://openrouter.ai/api/v1/chat/completions";

  // Formateamos el historial para formato OpenAI/OpenRouter
  const messages = history.map(msg => ({
    role: msg.role === 'model' ? 'assistant' : 'user',
    content: msg.parts?.[0]?.text || msg.text || ''
  }));

  // Agregamos el mensaje actual del usuario
  messages.push({
    role: 'user',
    content: prompt
  });

  console.log("📡 URL de petición:", url);
  console.log("📦 Payload sanitizado:", JSON.stringify({ model: MODEL, messages }));

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': 'https://petadopt.app',
        'X-Title': 'PetAdopt'
      },
      body: JSON.stringify({ 
        model: MODEL,
        messages 
      }),
    });

    const responseText = await response.text();

    if (!response.ok) {
      // Retry on 503 and 429 errors
      if ((response.status === 503 || response.status === 429) && retries > 0) {
        console.log(`⚠️ Error ${response.status}, reintentando... (${retries} intentos restantes)`);
        await new Promise(resolve => setTimeout(resolve, 3000));
        return askGemini(prompt, history, retries - 1);
      }

      throw new Error(`OpenRouter API error: ${response.status} - ${responseText}`);
    }

    const data = JSON.parse(responseText);
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error("OpenRouter no devolvió ninguna respuesta válida.");
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error("🔥 ERROR OPENROUTER DETALLADO:", error);
    throw error;
  }
};
