
import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

function getAI() {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
}

export async function parseReceiptWithGemini(base64Image: string) {
  try {
    const aiInstance = getAI();
    const response = await aiInstance.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          {
            text: `Analyze this receipt image and extract the following data in strict JSON format:
            {
              "total": number,
              "date": "YYYY-MM-DD" (use today if not found),
              "establishment": string (store name),
              "items": [
                { "name": string, "quantity": number, "unitPrice": number, "unit": string }
              ]
            }
            If you cannot read the image, return null.`
          }
        ]
      },
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini OCR Error:", error);
    throw error;
  }
}
