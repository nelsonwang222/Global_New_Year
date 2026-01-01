
import { GoogleGenAI } from "@google/genai";

export const generatePostTemplate = async (
  language: string,
  location: string,
  culturalPrompt: string
): Promise<string> => {
  // Create a new instance right before making an API call to ensure it uses the most up-to-date API key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Enhance understanding for specific Chinese variants
  let linguisticContext = "";
  if (language === "Canton Chinese") {
    linguisticContext = "Use Traditional Chinese characters (繁體中文). Use authentic Cantonese phrasing for New Year greetings like '新年快樂' or '恭喜發財'.";
  } else if (language === "Taiwanese Mandarin") {
    linguisticContext = "Use Traditional Chinese characters (繁體中文) as used in Taiwan. Use standard Mandarin phrasing like '新年快樂'.";
  } else if (language === "Mandarin Chinese") {
    linguisticContext = "Use Simplified Chinese characters (简体中文) unless the location suggests otherwise.";
  }

  const prompt = `Create a high-quality, professional Instagram post template (square 1:1). 
  Primary Content: The text "Wishing you a happy new year" written in ${language}.
  ${linguisticContext}
  Secondary Content: Visual symbols and traditional aesthetics that represent the culture of the ${language} language and the specific location: ${location}.
  Context: ${culturalPrompt}.
  Style: Celebratory, elegant, and vibrant. The composition must be optimized for Instagram. 
  Ensure the text is legible, correctly written in the proper script, and beautifully integrated with the cultural symbols.
  Avoid any blurry elements or low-quality artifacts.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: "1K"
      }
    }
  });

  const candidate = response.candidates?.[0];
  if (!candidate) throw new Error("No candidates returned from Gemini");

  for (const part of candidate.content.parts) {
    if (part.inlineData) {
      return part.inlineData.data;
    }
  }

  throw new Error("No image data returned from Gemini");
};

export const editPostTemplate = async (
  base64Image: string,
  editPrompt: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image,
            mimeType: 'image/png'
          }
        },
        {
          text: `Modify this Instagram post template based on this instruction: "${editPrompt}". 
          Ensure the final result remains a high-quality 1:1 aspect ratio square image. 
          Preserve the "Wishing you a happy new year" message and the cultural heritage elements unless the user specifically asks to change them.
          Maintain linguistic accuracy for the chosen script and dialect.`
        }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: "1K"
      }
    }
  });

  const candidate = response.candidates?.[0];
  if (!candidate) throw new Error("No candidates returned from Gemini");

  for (const part of candidate.content.parts) {
    if (part.inlineData) {
      return part.inlineData.data;
    }
  }

  throw new Error("No edited image data returned from Gemini");
};
