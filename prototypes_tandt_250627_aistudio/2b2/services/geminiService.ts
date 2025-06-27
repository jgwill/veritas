import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. AI features will be disabled. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const suggestElementsFromTopic = async (topic: string): Promise<{ name: string; description: string }[]> => {
  if (!API_KEY) {
    // Return mock data if API key is not available
    console.log("Using mock data for Gemini service.");
    return [
      { name: "Cost", description: "The overall price and budget considerations." },
      { name: "Quality", description: "The standard of materials and craftsmanship." },
      { name: "Features", description: "Specific functionalities and capabilities." },
    ];
  }
  
  const prompt = `
    Based on the decision-making topic "${topic}", generate a list of 5 to 8 relevant factors or criteria to consider.
    Return the response as a JSON array where each object has a "name" (string) and a "description" (string, max 2 sentences).
    Do not include any other text or markdown formatting outside of the JSON array.

    Example for topic "Choosing a new laptop":
    [
      {
        "name": "Performance",
        "description": "The processing power, RAM, and graphics capabilities for your intended tasks."
      },
      {
        "name": "Portability",
        "description": "The size, weight, and battery life of the laptop for on-the-go use."
      }
    ]
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    const parsedData = JSON.parse(jsonStr);
    
    if (Array.isArray(parsedData) && parsedData.every(item => 'name' in item && 'description' in item)) {
        return parsedData;
    } else {
        console.error("Gemini response is not in the expected format:", parsedData);
        return [];
    }

  } catch (error) {
    console.error("Failed to fetch suggestions from Gemini:", error);
    return [];
  }
};
