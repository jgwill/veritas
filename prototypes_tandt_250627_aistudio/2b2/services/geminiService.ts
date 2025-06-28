import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. AI features will be disabled. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const suggestElementsFromTopic = async (topic: string, modelType: number): Promise<{ name: string; description: string }[]> => {
  const isDecisionModel = modelType === 1;

  if (!API_KEY) {
    // Return mock data if API key is not available
    console.log("Using mock data for Gemini service.");
    if (isDecisionModel) {
        return [
          { name: "Cost", description: "The overall price and budget considerations." },
          { name: "Quality", description: "The standard of materials and craftsmanship." },
          { name: "Features", description: "Specific functionalities and capabilities." },
        ];
    } else {
        return [
            { name: "Team Velocity", description: "The rate at which the team completes work." },
            { name: "Code Quality", description: "The standard of the code being produced, measured by bugs or code reviews." },
            { name: "Stakeholder Satisfaction", description: "The level of satisfaction from project stakeholders." },
        ];
    }
  }
  
  const prompt = isDecisionModel
    ? `
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
  `
    : `
    Based on the performance review topic "${topic}", generate a list of 5 to 8 relevant key performance indicators (KPIs) or areas to evaluate.
    These should be things you can measure or assess.
    Return the response as a JSON array where each object has a "name" (string) and a "description" (string, max 2 sentences).
    Do not include any other text or markdown formatting outside of the JSON array.

    Example for topic "Quarterly Team Performance":
    [
      {
        "name": "Project Delivery Rate",
        "description": "The percentage of projects completed on time and within budget."
      },
      {
        "name": "Quality of Work",
        "description": "The level of bugs, errors, or rework required for completed tasks."
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