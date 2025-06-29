import { GoogleGenAI } from "@google/genai";
import { DigitalModel } from "../types";

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


export const generateModelFromDescription = async (description: string, modelType: number): Promise<{ DigitalTopic: string; Model: { name: string; description: string }[] }> => {
  if (!API_KEY) {
    console.log("Using mock data for Gemini model generation.");
    return {
      DigitalTopic: `Mock: ${description.substring(0, 20)}`,
      Model: [
        { name: "Generated Factor 1", description: "This is the first mock factor." },
        { name: "Generated Factor 2", description: "This is the second mock factor." },
      ]
    };
  }

  const isDecisionModel = modelType === 1;

  const prompt = `
    You are an expert consultant who helps users structure their thinking.
    A user has provided a description of a goal. Your task is to generate a complete digital thinking model structure based on this description.

    User's Goal: "${description}"
    Model Type: ${isDecisionModel ? "Decision Making" : "Performance Review"}

    Instructions:
    1.  Analyze the user's goal to determine a concise and clear "DigitalTopic". This should be a short title for their model.
    2.  Based on the goal and model type, generate a list of 5 to 8 relevant elements.
        -   If the model type is "Decision Making", these elements should be critical factors or criteria for making the decision.
        -   If the model type is "Performance Review", these elements should be key performance indicators (KPIs) or areas to evaluate.
    3.  Each element must have a "name" (string, title-cased) and a "description" (string, 1-2 sentences).

    Return the response as a single JSON object with the following structure:
    {
      "DigitalTopic": "A concise topic name you generated",
      "Model": [
        {
          "name": "First Element Name",
          "description": "A clear description for the first element."
        },
        {
          "name": "Second Element Name",
          "description": "A clear description for the second element."
        }
      ]
    }

    Do not include any other text, explanations, or markdown formatting outside of the JSON object.
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

    if (parsedData && parsedData.DigitalTopic && Array.isArray(parsedData.Model)) {
      return parsedData;
    } else {
      console.error("Gemini model generation response is not in the expected format:", parsedData);
      throw new Error("Failed to generate model due to unexpected format.");
    }
  } catch (error) {
    console.error("Failed to generate model from description via Gemini:", error);
    throw error;
  }
};

export const generateAnalysisSummary = async (model: DigitalModel): Promise<string> => {
    if (!API_KEY) {
        console.log("Using mock data for Gemini analysis summary.");
        return model.DigitalThinkingModelType === 1 
            ? "This is a mock decision summary. The decision is YES because all critical factors seem to be in order based on the provided mock analysis."
            : "This is a mock performance summary. Key areas to focus on are 'Declining Locus of Control' and the 'Regulatory Environment' based on the mock analysis.";
    }

    const isDecisionModel = model.DigitalThinkingModelType === 1;

    // Create a concise summary of the model state to send to the AI
    const analysisData = model.Model
        .filter(el => el.TwoFlagAnswered) // Only include evaluated elements
        .map(el => {
            let status = `Status: ${el.TwoFlag ? 'Acceptable' : 'Unacceptable'}`;
            if (!isDecisionModel && el.ThreeFlagAnswered) {
                const trend = el.ThreeFlag === 1 ? 'Improving' : (el.ThreeFlag === -1 ? 'Declining' : 'Stable');
                status += `, Trend: ${trend}`;
            }
            if (isDecisionModel) {
                status += `, Dominance Factor: ${el.DominanceFactor}`;
            }
            return `- ${el.DisplayName}: ${status}`;
        }).join('\n');
    
    if (analysisData.length === 0) {
        return "No elements have been evaluated yet. Please evaluate at least one element to get a summary.";
    }

    const prompt = isDecisionModel
    ? `
        You are an expert strategic consultant. Below is a "Decision Making" model analysis for the topic "${model.DigitalTopic}".
        A decision is "NO" if any highly dominant factor is "Unacceptable". Otherwise, it's "YES".
        Based *only* on the provided data, generate a concise, natural-language summary explaining the final decision.
        Start by stating the decision (e.g., "The analysis points to a clear 'YES' decision."). Then, explain the one or two most critical reasons why.
        Do not invent information. Be direct and insightful.

        Analysis Data:
        ${analysisData}
    `
    : `
        You are an expert management consultant. Below is a "Performance Review" analysis for the topic "${model.DigitalTopic}".
        The goal is to identify the most critical areas needing attention. Priority should be given to items that are "Unacceptable", especially if they are also "Declining".
        Based *only* on the provided data, generate a concise, natural-language summary.
        Highlight the top 1-3 most urgent priorities and briefly explain why they are critical.
        If all items are acceptable and stable/improving, provide a positive summary.
        Do not invent information. Be direct and actionable.

        Analysis Data:
        ${analysisData}
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Failed to fetch analysis summary from Gemini:", error);
        throw new Error("The AI analyst is currently unavailable. Please try again later.");
    }
};