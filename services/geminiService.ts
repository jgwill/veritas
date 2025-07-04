import { GoogleGenerativeAI } from "@google/generative-ai"
import type { DigitalModel, DigitalElement } from "../types"

// Initialize Gemini AI
let genAI: GoogleGenerativeAI | null = null

// Check if we're on the server side and have an API key
const isServer = typeof window === "undefined"
const apiKey = isServer
  ? process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.API_KEY || process.env.VITE_GOOGLE_API_KEY
  : null

if (isServer && apiKey) {
  try {
    genAI = new GoogleGenerativeAI(apiKey)
  } catch (error) {
    console.warn("Failed to initialize Gemini AI:", error)
  }
}

// Helper function to get the model
function getModel() {
  if (!genAI) {
    return null
  }
  return genAI.getGenerativeModel({ model: "gemini-pro" })
}

// Helper function to parse AI JSON responses
function parseAIJsonResponse(text: string): any {
  try {
    // First, try to parse as-is
    return JSON.parse(text)
  } catch (error) {
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\}|\[[\s\S]*?\])\s*```/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1])
      }

      // Try to find JSON-like content
      const jsonStart = text.indexOf("{")
      const jsonEnd = text.lastIndexOf("}")
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        const jsonStr = text.substring(jsonStart, jsonEnd + 1)
        return JSON.parse(jsonStr)
      }

      // Try to find array-like content
      const arrayStart = text.indexOf("[")
      const arrayEnd = text.lastIndexOf("]")
      if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
        const arrayStr = text.substring(arrayStart, arrayEnd + 1)
        return JSON.parse(arrayStr)
      }

      throw new Error("No valid JSON found")
    } catch (parseError) {
      console.warn("Failed to parse AI response as JSON:", text)
      return null
    }
  }
}

// Generate model from description
export async function generateModelFromDescription(description: string, type: number): Promise<DigitalModel> {
  const model = getModel()

  if (!model) {
    console.warn("Gemini API key not found. Using mock data.")
    return createMockModel(description, type)
  }

  try {
    const modelTypeText = type === 1 ? "Decision Making" : "Performance Review"
    const prompt = `Create a ${modelTypeText} model based on this description: "${description}"

Please respond with a valid JSON object with this exact structure:
{
  "name": "Model Name",
  "description": "Brief description",
  "elements": [
    {
      "DisplayName": "Element Name",
      "Description": "Element description",
      "Weight": 0.2,
      "Idug": "unique-id-1"
    }
  ]
}

Generate 4-6 relevant elements with weights that sum to 1.0. Make element names concise but descriptive.`

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    })

    const response = await result.response
    const text = response.text()

    if (!text) {
      throw new Error("Empty response from AI")
    }

    const aiData = parseAIJsonResponse(text)

    if (!aiData || !aiData.elements) {
      throw new Error("Invalid AI response format")
    }

    // Create the model with AI-generated data
    const modelId = `ai-model-${Date.now()}`
    return {
      Idug: modelId,
      DisplayName: aiData.name || `AI Generated ${modelTypeText} Model`,
      Description: aiData.description || description,
      Type: type,
      Elements: aiData.elements.map((element: any, index: number) => ({
        Idug: element.Idug || `element-${modelId}-${index}`,
        DisplayName: element.DisplayName || `Element ${index + 1}`,
        Description: element.Description || "",
        Weight: element.Weight || 1 / aiData.elements.length,
        ParentIdug: modelId,
        Type: type === 1 ? "Alternative" : "Criterion",
        Status: "Active",
        CreatedDate: new Date().toISOString(),
        ModifiedDate: new Date().toISOString(),
      })),
      Status: "Active",
      CreatedDate: new Date().toISOString(),
      ModifiedDate: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Failed to generate model from description via Gemini:", error)
    return createMockModel(description, type)
  }
}

// Create mock model for fallback
function createMockModel(description: string, type: number): DigitalModel {
  const modelId = `mock-model-${Date.now()}`
  const modelTypeText = type === 1 ? "Decision Making" : "Performance Review"

  const mockElements =
    type === 1
      ? [
          { name: "Cost Effectiveness", desc: "Financial impact and budget considerations", weight: 0.25 },
          { name: "Implementation Feasibility", desc: "Ease of implementation and resource requirements", weight: 0.2 },
          { name: "Strategic Alignment", desc: "Alignment with organizational goals and strategy", weight: 0.25 },
          { name: "Risk Assessment", desc: "Potential risks and mitigation strategies", weight: 0.15 },
          { name: "Stakeholder Impact", desc: "Effect on stakeholders and user satisfaction", weight: 0.15 },
        ]
      : [
          { name: "Quality Metrics", desc: "Measurable quality indicators and standards", weight: 0.3 },
          { name: "Efficiency Measures", desc: "Process efficiency and productivity metrics", weight: 0.25 },
          { name: "Customer Satisfaction", desc: "Customer feedback and satisfaction scores", weight: 0.2 },
          { name: "Innovation Index", desc: "Innovation and improvement initiatives", weight: 0.15 },
          { name: "Compliance Status", desc: "Regulatory and policy compliance levels", weight: 0.1 },
        ]

  return {
    Idug: modelId,
    DisplayName: `${modelTypeText} Model`,
    Description: description,
    Type: type,
    Elements: mockElements.map((element, index) => ({
      Idug: `element-${modelId}-${index}`,
      DisplayName: element.name,
      Description: element.desc,
      Weight: element.weight,
      ParentIdug: modelId,
      Type: type === 1 ? "Alternative" : "Criterion",
      Status: "Active",
      CreatedDate: new Date().toISOString(),
      ModifiedDate: new Date().toISOString(),
    })),
    Status: "Active",
    CreatedDate: new Date().toISOString(),
    ModifiedDate: new Date().toISOString(),
  }
}

// Suggest elements from topic
export async function suggestElementsFromTopic(topic: string, modelType: number): Promise<DigitalElement[]> {
  const model = getModel()

  if (!model) {
    console.warn("Gemini API key not found. Using mock suggestions.")
    return createMockElements(topic, modelType)
  }

  try {
    const typeText = modelType === 1 ? "decision-making alternatives" : "performance criteria"
    const prompt = `Suggest 5-7 ${typeText} for the topic: "${topic}"

Please respond with a valid JSON array of objects with this structure:
[
  {
    "DisplayName": "Element Name",
    "Description": "Detailed description of this element",
    "Weight": 0.15
  }
]

Make sure weights sum to approximately 1.0 and element names are concise but descriptive.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    if (!text) {
      throw new Error("Empty response from AI")
    }

    const suggestions = parseAIJsonResponse(text)

    if (!Array.isArray(suggestions)) {
      throw new Error("AI response is not an array")
    }

    return suggestions.map((suggestion: any, index: number) => ({
      Idug: `suggested-${Date.now()}-${index}`,
      DisplayName: suggestion.DisplayName || `Element ${index + 1}`,
      Description: suggestion.Description || "",
      Weight: suggestion.Weight || 1 / suggestions.length,
      ParentIdug: "",
      Type: modelType === 1 ? "Alternative" : "Criterion",
      Status: "Active",
      CreatedDate: new Date().toISOString(),
      ModifiedDate: new Date().toISOString(),
    }))
  } catch (error) {
    console.error("Failed to suggest elements via Gemini:", error)
    return createMockElements(topic, modelType)
  }
}

// Create mock elements for fallback
function createMockElements(topic: string, modelType: number): DigitalElement[] {
  const mockSuggestions =
    modelType === 1
      ? [
          { name: "Option A", desc: `Primary alternative for ${topic}`, weight: 0.2 },
          { name: "Option B", desc: `Secondary alternative for ${topic}`, weight: 0.2 },
          { name: "Option C", desc: `Third alternative for ${topic}`, weight: 0.2 },
          { name: "Hybrid Approach", desc: `Combined approach for ${topic}`, weight: 0.2 },
          { name: "Status Quo", desc: `Maintain current state for ${topic}`, weight: 0.2 },
        ]
      : [
          { name: "Performance", desc: `Performance metrics for ${topic}`, weight: 0.25 },
          { name: "Quality", desc: `Quality standards for ${topic}`, weight: 0.25 },
          { name: "Efficiency", desc: `Efficiency measures for ${topic}`, weight: 0.25 },
          { name: "Impact", desc: `Overall impact of ${topic}`, weight: 0.25 },
        ]

  return mockSuggestions.map((suggestion, index) => ({
    Idug: `mock-${Date.now()}-${index}`,
    DisplayName: suggestion.name,
    Description: suggestion.desc,
    Weight: suggestion.weight,
    ParentIdug: "",
    Type: modelType === 1 ? "Alternative" : "Criterion",
    Status: "Active",
    CreatedDate: new Date().toISOString(),
    ModifiedDate: new Date().toISOString(),
  }))
}

// Generate analysis summary
export async function generateAnalysisSummary(model: DigitalModel): Promise<string> {
  const model_ai = getModel()

  if (!model_ai) {
    return generateMockAnalysisSummary(model)
  }

  try {
    const elementsText = model.Elements.map((e) => `- ${e.DisplayName} (Weight: ${e.Weight}): ${e.Description}`).join(
      "\n",
    )

    const modelTypeText = model.Type === 1 ? "Decision Making" : "Performance Review"

    const prompt = `Analyze this ${modelTypeText} model and provide a comprehensive summary:

Model: ${model.DisplayName}
Description: ${model.Description}

Elements:
${elementsText}

Please provide:
1. Overall assessment of the model structure
2. Key insights about the element weights and balance
3. Potential strengths and areas for improvement
4. Recommendations for optimization

Keep the response concise but informative (2-3 paragraphs).`

    const result = await model_ai.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return text || generateMockAnalysisSummary(model)
  } catch (error) {
    console.error("Failed to generate analysis summary via Gemini:", error)
    return generateMockAnalysisSummary(model)
  }
}

// Generate mock analysis summary
function generateMockAnalysisSummary(model: DigitalModel): string {
  const modelTypeText = model.Type === 1 ? "decision-making" : "performance evaluation"
  const elementCount = model.Elements.length
  const avgWeight = 1 / elementCount
  const maxWeight = Math.max(...model.Elements.map((e) => e.Weight))
  const minWeight = Math.min(...model.Elements.map((e) => e.Weight))

  return `This ${modelTypeText} model contains ${elementCount} elements with weights ranging from ${minWeight.toFixed(2)} to ${maxWeight.toFixed(2)}. The model appears ${maxWeight > avgWeight * 1.5 ? "to have some heavily weighted elements, suggesting clear priorities" : "to have relatively balanced weighting across elements"}.

The structure suggests a ${model.Type === 1 ? "comprehensive approach to evaluating alternatives" : "well-rounded performance measurement framework"}. ${elementCount > 5 ? "The detailed breakdown allows for nuanced analysis" : "The focused approach should facilitate clear decision-making"}.

Consider reviewing the element weights to ensure they align with your strategic priorities and stakeholder expectations. ${model.Type === 2 ? "For performance models, ensure metrics are measurable and actionable." : "For decision models, verify that all critical alternatives are represented."}`
}

// Generate action suggestions
export async function generateActionSuggestions(elements: DigitalElement[]): Promise<string[]> {
  const model = getModel()

  if (!model) {
    return generateMockActionSuggestions(elements)
  }

  try {
    const criticalElements = elements.filter(
      (e) =>
        e.Weight > 0.2 ||
        e.DisplayName.toLowerCase().includes("critical") ||
        e.DisplayName.toLowerCase().includes("important"),
    )

    const elementsText = criticalElements
      .map((e) => `- ${e.DisplayName}: ${e.Description} (Weight: ${e.Weight})`)
      .join("\n")

    const prompt = `Based on these critical model elements, suggest 3-5 specific actionable recommendations:

${elementsText}

Please provide practical, specific actions that can be taken to improve or address these elements. Format as a JSON array of strings.

Example format:
["Action 1 description", "Action 2 description", "Action 3 description"]`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    if (!text) {
      throw new Error("Empty response from AI")
    }

    const suggestions = parseAIJsonResponse(text)

    if (Array.isArray(suggestions)) {
      return suggestions.filter((s) => typeof s === "string" && s.length > 0)
    }

    // If not an array, try to extract suggestions from text
    const lines = text
      .split("\n")
      .filter((line) => line.trim().length > 0 && (line.includes("-") || line.includes("•") || line.match(/^\d+\./)))

    return lines
      .slice(0, 5)
      .map((line) => line.replace(/^[-•\d.\s]+/, "").trim())
      .filter((suggestion) => suggestion.length > 0)
  } catch (error) {
    console.error("Failed to generate action suggestions via Gemini:", error)
    return generateMockActionSuggestions(elements)
  }
}

// Generate mock action suggestions
function generateMockActionSuggestions(elements: DigitalElement[]): string[] {
  const suggestions = [
    "Review and validate element weights based on current strategic priorities",
    "Gather stakeholder feedback on the relevance of each model element",
    "Establish clear measurement criteria for quantitative assessment",
    "Create implementation timeline with specific milestones and deliverables",
    "Develop monitoring and evaluation framework for ongoing assessment",
  ]

  // Customize suggestions based on element characteristics
  const highWeightElements = elements.filter((e) => e.Weight > 0.25)
  if (highWeightElements.length > 0) {
    suggestions.unshift(
      `Focus immediate attention on high-priority elements: ${highWeightElements.map((e) => e.DisplayName).join(", ")}`,
    )
  }

  const lowWeightElements = elements.filter((e) => e.Weight < 0.1)
  if (lowWeightElements.length > 0) {
    suggestions.push(
      `Consider consolidating or removing low-impact elements: ${lowWeightElements.map((e) => e.DisplayName).join(", ")}`,
    )
  }

  return suggestions.slice(0, 5)
}

// Create chat session
export function createChatSession(model: DigitalModel) {
  const ai_model = getModel()

  if (!ai_model) {
    // Return mock chat session
    return {
      sendMessage: async (message: string): Promise<string> => {
        // Simple mock responses based on message content
        const lowerMessage = message.toLowerCase()

        if (lowerMessage.includes("help") || lowerMessage.includes("what")) {
          return `I can help you analyze your ${model.DisplayName} model. You can ask me about element weights, relationships, or request suggestions for improvement.`
        }

        if (lowerMessage.includes("weight") || lowerMessage.includes("important")) {
          const topElements = model.Elements.sort((a, b) => b.Weight - a.Weight)
            .slice(0, 3)
            .map((e) => `${e.DisplayName} (${(e.Weight * 100).toFixed(1)}%)`)
            .join(", ")
          return `The most heavily weighted elements in your model are: ${topElements}. These should be your primary focus areas.`
        }

        if (lowerMessage.includes("improve") || lowerMessage.includes("suggest")) {
          return `To improve your model, consider: 1) Validating element weights with stakeholders, 2) Adding measurable criteria for each element, 3) Regular review and updates based on changing priorities.`
        }

        return `I understand you're asking about "${message}". Based on your ${model.DisplayName} model with ${model.Elements.length} elements, I'd recommend focusing on the highest-weighted elements first and ensuring all elements have clear, measurable criteria.`
      },
    }
  }

  // Return real chat session
  return {
    sendMessage: async (message: string): Promise<string> => {
      try {
        const context = `You are an AI assistant helping with a ${model.Type === 1 ? "Decision Making" : "Performance Review"} model called "${model.DisplayName}".

Model Description: ${model.Description}

Model Elements:
${model.Elements.map((e) => `- ${e.DisplayName} (Weight: ${e.Weight}): ${e.Description}`).join("\n")}

Please provide helpful, specific advice about this model. Keep responses concise and actionable.`

        const prompt = `${context}\n\nUser Question: ${message}`

        const result = await ai_model.generateContent(prompt)
        const response = await result.response
        const text = response.text()

        return text || "I apologize, but I was unable to generate a response. Please try rephrasing your question."
      } catch (error) {
        console.error("Chat session error:", error)
        return "I encountered an error processing your message. Please try again or rephrase your question."
      }
    },
  }
}

// Export all functions
export {
  generateModelFromDescription,
  suggestElementsFromTopic,
  generateAnalysisSummary,
  generateActionSuggestions,
  createChatSession,
}
