// Server-side only service for Gemini API
import type { DigitalModel, ActionSuggestion } from "../types"

// This will only work on the server side where environment variables are available
const getApiKey = () => {
  if (typeof window !== "undefined") {
    console.warn("Gemini service should only be used on the server side")
    return null
  }
  return process.env.API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
}

// Initialize Gemini AI only on server side
let ai: any = null

const initializeAI = async () => {
  if (typeof window !== "undefined") {
    return null // Don't initialize on client side
  }

  const apiKey = getApiKey()
  if (!apiKey) {
    console.warn("Gemini API key not found. AI features will be disabled.")
    return null
  }

  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai")
    ai = new GoogleGenerativeAI(apiKey)
    return ai
  } catch (error) {
    console.error("Failed to initialize GoogleGenerativeAI:", error)
    return null
  }
}

// Helper function to clean and parse JSON from AI response
const parseAIJsonResponse = (responseText: string): any => {
  let jsonStr = responseText.trim()

  // Remove markdown code fences if present
  const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s
  const match = jsonStr.match(fenceRegex)
  if (match && match[1]) {
    jsonStr = match[1].trim()
  }

  // Find the first { and last } to extract just the JSON part
  const firstBrace = jsonStr.indexOf("{")
  const lastBrace = jsonStr.lastIndexOf("}")

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    jsonStr = jsonStr.substring(firstBrace, lastBrace + 1)
  }

  // Clean up common JSON formatting issues
  jsonStr = jsonStr
    .replace(/,\s*}/g, "}") // Remove trailing commas before closing braces
    .replace(/,\s*]/g, "]") // Remove trailing commas before closing brackets
    .replace(/\n/g, " ") // Remove newlines that might break JSON
    .replace(/\s+/g, " ") // Normalize whitespace
    .replace(/([{,]\s*)(\w+)(\s*):/g, '$1"$2"$3:') // Add quotes around unquoted keys
    .replace(/:\s*'([^']*)'/g, ': "$1"') // Replace single quotes with double quotes

  try {
    return JSON.parse(jsonStr)
  } catch (parseError) {
    console.error("JSON parsing failed for:", jsonStr)
    console.error("Parse error:", parseError)
    throw new Error("Failed to parse AI response as valid JSON")
  }
}

export const createChatSession = (model: DigitalModel): any => {
  // Return a mock chat session for client-side usage
  if (typeof window !== "undefined") {
    return {
      sendMessage: async (message: string) => ({
        response: {
          text: () => `This is a mock response to: ${message}. The actual AI features require server-side processing.`,
        },
      }),
    }
  }

  if (!ai) {
    console.warn("Cannot create chat session: Gemini AI not initialized.")
    return null
  }

  const isDecisionModel = model.DigitalThinkingModelType === 1

  const modelContext = {
    DigitalTopic: model.DigitalTopic,
    DigitalThinkingModelType: isDecisionModel ? "Decision Making" : "Performance Review",
    ModelElements: model.Model.map((el) => {
      const elementContext: any = {
        Name: el.DisplayName,
        Description: el.Description,
      }

      if (isDecisionModel) {
        elementContext.DominanceFactor = el.DominanceFactor
      }

      if (el.TwoFlagAnswered) {
        elementContext.Evaluation = el.TwoFlag ? "Acceptable" : "Unacceptable"
      }

      if (!isDecisionModel && el.ThreeFlagAnswered) {
        const trend = el.ThreeFlag === 1 ? "Improving" : el.ThreeFlag === -1 ? "Declining" : "Stable"
        elementContext.Trend = trend
      }
      return elementContext
    }),
  }

  const modelJson = JSON.stringify(modelContext, null, 2)

  const systemInstruction = `You are a helpful and insightful AI analyst for the TandT Digital Thinking application. Your task is to answer the user's questions about their current thinking model. You must base your answers STRICTLY on the data provided below in the "MODEL CONTEXT". Do not invent any information or discuss topics outside of this model. Be concise and helpful.

MODEL CONTEXT:
${modelJson}`

  try {
    const genModel = ai.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: systemInstruction,
    })

    return {
      sendMessage: async (message: string) => {
        try {
          const result = await genModel.generateContent(message)
          const response = await result.response
          return {
            response: {
              text: () => response.text(),
            },
          }
        } catch (error) {
          console.error("Failed to send message:", error)
          return {
            response: {
              text: () => "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
            },
          }
        }
      },
    }
  } catch (error) {
    console.error("Failed to create chat session:", error)
    return null
  }
}

export const suggestElementsFromTopic = async (
  topic: string,
  modelType: number,
): Promise<{ name: string; description: string }[]> => {
  const isDecisionModel = modelType === 1

  // Initialize AI if not already done
  if (!ai) {
    ai = await initializeAI()
  }

  if (!ai) {
    console.log("Using mock data for Gemini service: suggestElementsFromTopic")
    if (isDecisionModel) {
      return [
        { name: "Cost", description: "The overall price and budget considerations." },
        { name: "Quality", description: "The standard of materials and craftsmanship." },
        { name: "Features", description: "Specific functionalities and capabilities." },
      ]
    } else {
      return [
        { name: "Team Velocity", description: "The rate at which the team completes work." },
        {
          name: "Code Quality",
          description: "The standard of the code being produced, measured by bugs or code reviews.",
        },
        { name: "Stakeholder Satisfaction", description: "The level of satisfaction from project stakeholders." },
      ]
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
  `

  try {
    const model = ai.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    })

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    if (!text) {
      throw new Error("Empty response from Gemini API")
    }

    let jsonStr = text.trim()
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s
    const match = jsonStr.match(fenceRegex)
    if (match && match[2]) {
      jsonStr = match[2].trim()
    }

    const parsedData = JSON.parse(jsonStr)

    if (Array.isArray(parsedData) && parsedData.every((item) => "name" in item && "description" in item)) {
      return parsedData
    } else {
      console.error("Gemini response is not in the expected format:", parsedData)
      throw new Error("Received an unexpected format from the AI.")
    }
  } catch (error) {
    console.error("Failed to fetch suggestions from Gemini:", error)
    throw new Error("The AI assistant is currently unavailable. Please try again later.")
  }
}

export const generateModelFromDescription = async (
  description: string,
  modelType: number,
): Promise<{ DigitalTopic: string; Model: { name: string; description: string }[] }> => {
  // Initialize AI if not already done
  if (!ai) {
    ai = await initializeAI()
  }

  if (!ai) {
    console.log("Using mock data for Gemini service: generateModelFromDescription")
    return {
      DigitalTopic: `Mock: ${description.substring(0, 20)}`,
      Model: [
        { name: "Generated Factor 1", description: "This is the first mock factor." },
        { name: "Generated Factor 2", description: "This is the second mock factor." },
      ],
    }
  }

  const isDecisionModel = modelType === 1

  const prompt = `
    You are an expert consultant who helps users structure their thinking.
    A user has provided a description of a goal. Your task is to generate a complete digital thinking model structure based on this description.

    User's Goal: "${description}"
    Model Type: ${isDecisionModel ? "Decision Making" : "Performance Review"}

    Instructions:
    1. Analyze the user's goal to determine a concise and clear "DigitalTopic". This should be a short title for their model.
    2. Based on the goal and model type, generate a list of 5 to 8 relevant elements.
        - If the model type is "Decision Making", these elements should be critical factors or criteria for making the decision.
        - If the model type is "Performance Review", these elements should be key performance indicators (KPIs) or areas to evaluate.
    3. Each element must have a "name" (string, title-cased) and a "description" (string, 1-2 sentences).

    Return ONLY a valid JSON object with this exact structure:
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

    Do not include any explanatory text, markdown formatting, or anything other than the JSON object.
  `

  try {
    const model = ai.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.3, // Lower temperature for more consistent JSON output
        maxOutputTokens: 1000,
        responseMimeType: "application/json", // Force JSON response
      },
    })

    const result = await model.generateContent(prompt)
    const response = await result.response
    const responseText = response.text()

    if (!responseText) {
      throw new Error("Empty response from Gemini API")
    }

    console.log("Raw AI response:", responseText) // Debug log

    // Try to parse directly first since we requested JSON format
    let parsedData: any
    try {
      parsedData = JSON.parse(responseText)
    } catch (directParseError) {
      console.log("Direct JSON parse failed, trying cleanup method")
      parsedData = parseAIJsonResponse(responseText)
    }

    console.log("Parsed data:", parsedData) // Debug log

    if (parsedData && parsedData.DigitalTopic && Array.isArray(parsedData.Model)) {
      // Validate that each model element has the required properties
      const isValidModel = parsedData.Model.every(
        (item: any) => item && typeof item.name === "string" && typeof item.description === "string",
      )

      if (isValidModel) {
        return parsedData
      } else {
        console.error("Model elements are not in the expected format:", parsedData.Model)
        throw new Error("Generated model elements are missing required properties.")
      }
    } else {
      console.error("Gemini model generation response is not in the expected format:", parsedData)
      throw new Error("Failed to generate model due to unexpected format from the AI.")
    }
  } catch (error) {
    console.error("Failed to generate model from description via Gemini:", error)

    // Provide a fallback response instead of throwing
    const fallbackTopic = description.length > 50 ? description.substring(0, 50) + "..." : description
    const fallbackElements = isDecisionModel
      ? [
          { name: "Cost", description: "Financial considerations and budget constraints." },
          { name: "Quality", description: "Standards and requirements that must be met." },
          { name: "Timeline", description: "Time constraints and scheduling considerations." },
          { name: "Resources", description: "Available resources and capabilities needed." },
          { name: "Risk", description: "Potential risks and mitigation strategies." },
        ]
      : [
          { name: "Efficiency", description: "How effectively resources are being utilized." },
          { name: "Quality", description: "The standard of output or deliverables." },
          { name: "Timeliness", description: "Meeting deadlines and schedule adherence." },
          { name: "Satisfaction", description: "Stakeholder and customer satisfaction levels." },
          { name: "Growth", description: "Progress toward goals and improvement metrics." },
        ]

    return {
      DigitalTopic: fallbackTopic,
      Model: fallbackElements,
    }
  }
}

export const generateAnalysisSummary = async (model: DigitalModel): Promise<string> => {
  // Initialize AI if not already done
  if (!ai) {
    ai = await initializeAI()
  }

  if (!ai) {
    console.log("Using mock data for Gemini analysis summary.")
    return model.DigitalThinkingModelType === 1
      ? "Decision: YES. This is a mock decision summary. All critical factors seem to be in order."
      : "- Urgent Priority: 'Declining Locus of Control' because it is declining.\n- Urgent Priority: 'Regulatory Environment' because it is also declining."
  }

  const isDecisionModel = model.DigitalThinkingModelType === 1

  // Create a concise summary of the model state to send to the AI
  const analysisData = model.Model.filter((el) => el.TwoFlagAnswered) // Only include evaluated elements
    .map((el) => {
      let status = `Status: ${el.TwoFlag ? "Acceptable" : "Unacceptable"}`
      if (!isDecisionModel && el.ThreeFlagAnswered) {
        const trend = el.ThreeFlag === 1 ? "Improving" : el.ThreeFlag === -1 ? "Declining" : "Stable"
        status += `, Trend: ${trend}`
      }
      if (isDecisionModel) {
        status += `, Dominance Factor: ${el.DominanceFactor}`
      }
      return `- ${el.DisplayName}: ${status}`
    })
    .join("\n")

  if (analysisData.length === 0) {
    return "No elements have been evaluated yet. Please evaluate at least one element to get a summary."
  }

  const prompt = isDecisionModel
    ? `
        You are an expert strategic consultant. Below is a "Decision Making" model analysis for the topic "${model.DigitalTopic}".
        A decision is "NO" if any highly dominant factor is "Unacceptable". Otherwise, it's "YES".
        Based ONLY on the provided data, explain the final decision.

        Instructions:
        1. Start your response with "Decision: YES" or "Decision: NO".
        2. Immediately follow with the one or two most critical reasons for that decision.
        3. Be direct and insightful. DO NOT use any introductory or concluding conversational text or framing sentences.

        Analysis Data:
        ${analysisData}
    `
    : `
        You are an expert management consultant. Below is a "Performance Review" analysis for the topic "${model.DigitalTopic}".
        The goal is to identify the most critical areas needing attention. Priority is given to items that are "Unacceptable", especially if they are also "Declining".
        Based ONLY on the provided data, generate a summary.

        Instructions:
        1. Directly list the top 1-3 most urgent priorities.
        2. For each priority, briefly explain why it is critical based on its status and trend.
        3. If all items are acceptable and stable/improving, state that there are no urgent priorities.
        4. Be direct and actionable. DO NOT use any introductory or concluding conversational text or framing sentences.

        Analysis Data:
        ${analysisData}
    `

  try {
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" })
    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text() || "No response received from AI"
  } catch (error) {
    console.error("Failed to fetch analysis summary from Gemini:", error)
    throw new Error("The AI analyst is currently unavailable. Please try again later.")
  }
}

export const generateActionSuggestions = async (model: DigitalModel): Promise<ActionSuggestion[]> => {
  // Initialize AI if not already done
  if (!ai) {
    ai = await initializeAI()
  }

  if (!ai) {
    console.log("Using mock data for Gemini action suggestions.")
    return [
      {
        area: "Locus of Market Control",
        suggestion:
          "Initiate a weekly sync to review key market metrics and empower the team to make tactical pricing adjustments.",
      },
      {
        area: "Regulatory / legal / union environment",
        suggestion:
          "Schedule a quarterly review with the legal team to proactively identify and mitigate upcoming regulatory risks.",
      },
    ]
  }

  // Find only the critical elements to focus on
  const criticalElements = model.Model.filter((el) => {
    const isUnacceptable = el.TwoFlagAnswered && !el.TwoFlag
    const isDeclining = el.ThreeFlagAnswered && el.ThreeFlag === -1
    return isUnacceptable || isDeclining
  })
    .map((el) => {
      let status = `Status: ${el.TwoFlag ? "Acceptable" : "Unacceptable"}`
      if (el.ThreeFlagAnswered) {
        const trend = el.ThreeFlag === 1 ? "Improving" : el.ThreeFlag === -1 ? "Declining" : "Stable"
        status += `, Trend: ${trend}`
      }
      return `- ${el.DisplayName}: ${status}`
    })
    .join("\n")

  if (criticalElements.length === 0) {
    return []
  }

  const prompt = `
    You are an expert management consultant specializing in creating actionable turnaround plans.
    A user is reviewing performance for the topic "${model.DigitalTopic}". They have identified the following critical issues.

    Critical Issues:
    ${criticalElements}

    Instructions:
    1. For each critical issue listed, provide one concrete, specific, and actionable suggestion to help improve the situation.
    2. The suggestions should be practical first steps a manager or team could take.
    3. Return the response as a JSON array where each object has an "area" (string, the name of the issue from the list) and a "suggestion" (string, your actionable advice).
    4. Do not include any other text or markdown formatting outside of the JSON array.

    Example response:
    [
      {
        "area": "Team Velocity",
        "suggestion": "Implement daily stand-up meetings to identify and resolve blockers more quickly."
      },
      {
        "area": "Stakeholder Satisfaction",
        "suggestion": "Schedule bi-weekly demo sessions with key stakeholders to gather feedback earlier in the development cycle."
      }
    ]
  `

  try {
    const model = ai.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    })

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    if (!text) {
      throw new Error("Empty response from Gemini API")
    }

    let jsonStr = text.trim()
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s
    const match = jsonStr.match(fenceRegex)
    if (match && match[2]) {
      jsonStr = match[2].trim()
    }

    const parsedData = JSON.parse(jsonStr)

    if (Array.isArray(parsedData) && parsedData.every((item) => "area" in item && "suggestion" in item)) {
      return parsedData as ActionSuggestion[]
    } else {
      console.error("Gemini action suggestions response is not in the expected format:", parsedData)
      throw new Error("Received an unexpected format from the AI for action suggestions.")
    }
  } catch (error) {
    console.error("Failed to fetch action suggestions from Gemini:", error)
    throw new Error("The AI assistant is currently unavailable. Please try again later.")
  }
}
