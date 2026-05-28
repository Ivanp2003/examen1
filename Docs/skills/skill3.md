Native Google Gemini Chat Interface
To power the "Asistente de IA Gemini" chat without heavy dependency overhead, use direct HTTPS REST processing:

const askGemini = async (prompt: string, apiKey: string): Promise<string> => {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });
  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};