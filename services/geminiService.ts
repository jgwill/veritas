import { GoogleGenerativeAI } from "@google/generative-ai"
import type { DigitalElement, ModelData, ChatMessage } from "../types"

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "")

// Helper function to parse AI JSON responses more robustly
function parseAIJsonResponse(text: string): any {
  try {
    // First, try direct JSON parsing
    return JSON.parse(text)
  } catch (error) {
    // If that fails, try to extract JSON from markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1])
      } catch (e) {
        console.warn("Failed to parse JSON from code block:", e)
      }
    }

    // Try to find JSON-like content between curly braces
    const braceMatch = text.match(/\{[\s\S]*\}/)
    if (braceMatch) {
      try {
        // Clean up common issues in AI-generated JSON
        const cleanJson = braceMatch[0]
          .replace(/,\s*}/g, "}") // Remove trailing commas
          .replace(/,\s*]/g, "]") // Remove trailing commas in arrays
          .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Quote unquoted keys
          .replace(/:\s*'([^']*)'/g, ': "$1"') // Replace single quotes with double quotes
          .replace(/\n/g, " ") // Remove newlines
          .replace(/\s+/g, " ") // Normalize whitespace

        return JSON.parse(cleanJson)
      } catch (e) {
        console.warn("Failed to parse cleaned JSON:", e)
      }
    }

    console.error("Could not extract valid JSON from AI response:", text)
    throw new Error("Invalid JSON response from AI")
  }
}

// Generate a model structure from a description using Gemini
export async function generateModelFromDescription(description: string): Promise<ModelData> {
  try {
    if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
      console.warn("No Gemini API key found, using mock data")
      return generateMockModel(description)
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    })

    const prompt = `
Create a decision-making model based on this description: "${description}"

Generate a JSON response with the following structure:
{
  "name": "Model Name",
  "description": "Brief description of the model",
  "elements": [
    {
      "id": "unique-id",
      "name": "Element Name",
      "type": "criterion" | "alternative" | "objective",
      "description": "Element description",
      "weight": 0.5,
      "value": 0.7,
      "children": []
    }
  ]
}

Rules:
- Include 3-5 main criteria/objectives
- Include 2-4 alternatives to evaluate
- Weights should sum to 1.0 for criteria at the same level
- Values should be between 0 and 1
- Use descriptive names and clear descriptions
- Make it relevant to the provided description

Return only valid JSON, no additional text or formatting.
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    if (!text) {
      throw new Error("Empty response from Gemini API")
    }

    console.log("Raw Gemini response:", text)

    try {
      const modelData = parseAIJsonResponse(text)

      // Validate the structure
      if (!modelData.name || !modelData.elements || !Array.isArray(modelData.elements)) {
        throw new Error("Invalid model structure from AI")
      }

      // Ensure all elements have required properties
      modelData.elements = modelData.elements.map((element: any, index: number) => ({
        id: element.id || `element-${index}`,
        name: element.name || `Element ${index + 1}`,
        type: element.type || "criterion",
        description: element.description || "",
        weight: typeof element.weight === "number" ? element.weight : 0.2,
        value: typeof element.value === "number" ? element.value : 0.5,
        children: Array.isArray(element.children) ? element.children : [],
      }))

      return {
        id: `model-${Date.now()}`,
        name: modelData.name,
        description: modelData.description || description,
        elements: modelData.elements,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError)
      console.log("Falling back to mock data")
      return generateMockModel(description)
    }
  } catch (error) {
    console.error("Error generating model from Gemini:", error)
    return generateMockModel(description)
  }
}

// Generate mock model data as fallback
function generateMockModel(description: string): ModelData {
  const mockElements: DigitalElement[] = [
    {
      id: "criterion-1",
      name: "Cost Effectiveness",
      type: "criterion",
      description: "Evaluate the cost-benefit ratio",
      weight: 0.3,
      value: 0.7,
      children: [],
    },
    {
      id: "criterion-2",
      name: "Implementation Feasibility",
      type: "criterion",
      description: "Assess how easy it is to implement",
      weight: 0.25,
      value: 0.6,
      children: [],
    },
    {
      id: "criterion-3",
      name: "Strategic Alignment",
      type: "criterion",
      description: "How well it aligns with strategic goals",
      weight: 0.25,
      value: 0.8,
      children: [],
    },
    {
      id: "criterion-4",
      name: "Risk Level",
      type: "criterion",
      description: "Associated risks and mitigation strategies",
      weight: 0.2,
      value: 0.5,
      children: [],
    },
    {
      id: "alternative-1",
      name: "Option A",
      type: "alternative",
      description: "First alternative solution",
      weight: 0.33,
      value: 0.7,
      children: [],
    },
    {
      id: "alternative-2",
      name: "Option B",
      type: "alternative",
      description: "Second alternative solution",
      weight: 0.33,
      value: 0.6,
      children: [],
    },
    {
      id: "alternative-3",
      name: "Option C",
      type: "alternative",
      description: "Third alternative solution",
      weight: 0.34,
      value: 0.8,
      children: [],
    },
  ]

  return {
    id: `mock-model-${Date.now()}`,
    name: `Decision Model: ${description.slice(0, 50)}${description.length > 50 ? "..." : ""}`,
    description: `AI-generated decision model for: ${description}`,
    elements: mockElements,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

// Analyze model performance using Gemini
export async function analyzeModelPerformance(modelData: ModelData): Promise<string> {
  try {
    if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
      return generateMockAnalysis(modelData)
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `
Analyze this decision-making model and provide insights:

Model: ${modelData.name}
Description: ${modelData.description}

Elements:
${modelData.elements
  .map((el) => `- ${el.name} (${el.type}): Weight=${el.weight}, Value=${el.value} - ${el.description}`)
  .join("\n")}

Please provide:
1. Overall model assessment
2. Weight distribution analysis
3. Potential improvements
4. Risk considerations
5. Recommendations

Keep the analysis concise but insightful.
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return text || generateMockAnalysis(modelData)
  } catch (error) {
    console.error("Error analyzing model performance:", error)
    return generateMockAnalysis(modelData)
  }
}

// Generate mock analysis as fallback
function generateMockAnalysis(modelData: ModelData): string {
  const criteriaCount = modelData.elements.filter((el) => el.type === "criterion").length
  const alternativesCount = modelData.elements.filter((el) => el.type === "alternative").length

  return `
## Model Analysis: ${modelData.name}

### Overall Assessment
This model contains ${criteriaCount} evaluation criteria and ${alternativesCount} alternatives. The structure appears well-balanced for decision-making purposes.

### Weight Distribution
The criteria weights are distributed across the evaluation factors. Consider reviewing if the weight allocation reflects the true importance of each criterion in your decision context.

### Key Insights
- The model provides a structured approach to evaluating alternatives
- Weight distribution should be validated with stakeholders
- Consider adding sensitivity analysis for critical decisions

### Recommendations
1. Validate criterion weights with domain experts
2. Consider adding sub-criteria for complex factors
3. Implement regular model reviews and updates
4. Document assumptions and constraints

### Risk Considerations
- Ensure all relevant factors are captured
- Monitor for changing priorities over time
- Consider external factors that might affect the decision
`
}

// Generate conversational analysis using Gemini
export async function generateConversationalAnalysis(
  modelData: ModelData,
  userQuestion: string,
  chatHistory: ChatMessage[] = [],
): Promise<string> {
  try {
    if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
      return generateMockConversationalResponse(userQuestion, modelData)
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const historyContext =
      chatHistory.length > 0
        ? `Previous conversation:\n${chatHistory.map((msg) => `${msg.role}: ${msg.content}`).join("\n")}\n\n`
        : ""

    const prompt = `
${historyContext}You are an AI assistant helping with decision-making analysis. 

Current model: ${modelData.name}
Description: ${modelData.description}

Model elements:
${modelData.elements
  .map((el) => `- ${el.name} (${el.type}): Weight=${el.weight}, Value=${el.value} - ${el.description}`)
  .join("\n")}

User question: ${userQuestion}

Please provide a helpful, conversational response that:
1. Directly addresses the user's question
2. References relevant model data when appropriate
3. Provides actionable insights
4. Maintains context from previous conversation
5. Asks follow-up questions if helpful

Keep the tone professional but conversational.
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return text || generateMockConversationalResponse(userQuestion, modelData)
  } catch (error) {
    console.error("Error generating conversational analysis:", error)
    return generateMockConversationalResponse(userQuestion, modelData)
  }
}

// Generate mock conversational response as fallback
function generateMockConversationalResponse(question: string, modelData: ModelData): string {
  const responses = [
    `That's a great question about ${modelData.name}. Based on the model structure, I can see that you have ${modelData.elements.length} key elements to consider. What specific aspect would you like to explore further?`,

    `Looking at your model "${modelData.name}", the criteria seem well-balanced. The question you're asking touches on an important aspect of decision-making. Let me break this down for you...`,

    `I understand you're asking about the model analysis. From what I can see in "${modelData.name}", there are several factors that could influence your decision. Would you like me to focus on any particular criterion?`,

    `That's an insightful question. In the context of your model "${modelData.name}", this relates to how we weight and evaluate different factors. Let me provide some perspective on this...`,
  ]

  return responses[Math.floor(Math.random() * responses.length)]
}

// Regenerate model elements using Gemini
export async function regenerateModelElements(modelData: ModelData, feedback: string): Promise<DigitalElement[]> {
  try {
    if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
      return generateMockElements(modelData, feedback)
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    })

    const prompt = `
Based on this feedback: "${feedback}"

Improve the following model elements:
${JSON.stringify(modelData.elements, null, 2)}

Generate improved elements as a JSON array with this structure:
[
  {
    "id": "unique-id",
    "name": "Element Name",
    "type": "criterion" | "alternative" | "objective",
    "description": "Element description",
    "weight": 0.5,
    "value": 0.7,
    "children": []
  }
]

Rules:
- Incorporate the feedback to improve the model
- Maintain the same number of elements unless feedback suggests otherwise
- Ensure weights sum to 1.0 for elements of the same type
- Values should be between 0 and 1
- Keep existing IDs where possible

Return only valid JSON array, no additional text.
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    if (!text) {
      throw new Error("Empty response from Gemini API")
    }

    try {
      const elements = parseAIJsonResponse(text)

      if (!Array.isArray(elements)) {
        throw new Error("Response is not an array")
      }

      // Validate and clean up elements
      return elements.map((element: any, index: number) => ({
        id: element.id || `element-${index}`,
        name: element.name || `Element ${index + 1}`,
        type: element.type || "criterion",
        description: element.description || "",
        weight: typeof element.weight === "number" ? element.weight : 0.2,
        value: typeof element.value === "number" ? element.value : 0.5,
        children: Array.isArray(element.children) ? element.children : [],
      }))
    } catch (parseError) {
      console.error("Failed to parse regenerated elements:", parseError)
      return generateMockElements(modelData, feedback)
    }
  } catch (error) {
    console.error("Error regenerating model elements:", error)
    return generateMockElements(modelData, feedback)
  }
}

// Generate mock elements as fallback
function generateMockElements(modelData: ModelData, feedback: string): DigitalElement[] {
  // Return slightly modified version of existing elements
  return modelData.elements.map((element) => ({
    ...element,
    description: `${element.description} (Updated based on: ${feedback.slice(0, 50)}...)`,
  }))
}
