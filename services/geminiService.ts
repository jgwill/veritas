import { GoogleGenerativeAI } from "@google/generative-ai";
import { DigitalModel, DigitalElement } from '../types';

const GEMINI_KEY_STORAGE = 'VERITAS_USER_GEMINI_API_KEY';

// Get API key - checks localStorage first (user's key), then env var (server default)
const getApiKey = (): string | null => {
  // Client-side: check localStorage for user's personal API key
  if (typeof window !== 'undefined') {
    const userKey = localStorage.getItem(GEMINI_KEY_STORAGE);
    if (userKey) return userKey;
  }
  // Server-side or fallback: use environment variable
  if (typeof process !== 'undefined' && process.env?.VERITAS_GEMINI_API_KEY) {
    return process.env.VERITAS_GEMINI_API_KEY;
  }
  return null;
};

// Create a fresh Gemini AI instance with current API key
const getGenAI = (): GoogleGenerativeAI | null => {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  try {
    return new GoogleGenerativeAI(apiKey);
  } catch (error) {
    console.warn('Failed to initialize Gemini AI:', error);
    return null;
  }
};

// Helper function to parse AI JSON responses
function parseAIJsonResponse(text: string): any {
  try {
    // First try direct parsing
    return JSON.parse(text);
  } catch (error) {
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\}|\[[\s\S]*?\])\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }

      // Try to find JSON-like content
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        const jsonStr = text.substring(jsonStart, jsonEnd + 1);
        return JSON.parse(jsonStr);
      }

      // Try to find array-like content
      const arrayStart = text.indexOf('[');
      const arrayEnd = text.lastIndexOf(']');
      if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
        const arrayStr = text.substring(arrayStart, arrayEnd + 1);
        return JSON.parse(arrayStr);
      }

      throw new Error('No valid JSON found');
    } catch (parseError) {
      console.warn('Failed to parse AI response as JSON:', text);
      return null;
    }
  }
}

// Generate model from description
export async function generateModelFromDescription(description: string, type: number): Promise<DigitalModel> {
  const genAI = getGenAI();
  if (!genAI) {
    console.warn('Gemini API not available, using mock data');
    return createMockModel(description, type);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const modelTypeText = type === 1 ? 'Decision Making' : 'Performance Review';
    
    const prompt = `Create a ${modelTypeText} model based on this description: "${description}"

Please respond with a valid JSON object with this exact structure:
{
  "name": "Model Name",
  "description": "Brief description",
  "elements": [
    {
      "DisplayName": "Element Name",
      "Description": "Element description",
      "DominanceFactor": 0.2,
      "Idug": "unique-id-1"
    }
  ]
}

Generate 4-6 relevant elements with dominance factors that represent their relative importance. Make element names concise but descriptive.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error('Empty response from AI');
    }

    const aiData = parseAIJsonResponse(text);
    if (!aiData || !aiData.elements) {
      throw new Error('Invalid AI response format');
    }

    // Create the model with AI-generated data
    const modelId = `ai-model-${Date.now()}`;
    const elements = aiData.elements.map((element: any, index: number) => ({
      SortNo: index,
      TelescopedModel: null,
      ComparationCompleted: false,
      ComparationTableData: {},
      DominanceFactor: element.DominanceFactor || 0.2,
      DominantElementItIS: false,
      Meta: null,
      DtModified: new Date().toISOString(),
      DtCreated: new Date().toISOString(),
      Tlid: `tl-${modelId}-${index}`,
      NameElement: element.DisplayName || `Element ${index + 1}`,
      DisplayName: element.DisplayName || `Element ${index + 1}`,
      Description: element.Description || '',
      TwoOnly: false,
      TwoFlag: false,
      TwoFlagAnswered: false,
      ThreeFlag: 0,
      ThreeFlagAnswered: false,
      Idug: element.Idug || `element-${modelId}-${index}`,
      Status: 1,
      Question: false,
    }));

    return {
      AutoSaveModel: true,
      HasIssue: false,
      Model: elements,
      Note: null,
      ModelName: aiData.name || `AI Generated ${modelTypeText} Model`,
      DigitalThinkingModelType: type,
      DigitalTopic: aiData.description || description,
      Decision: false,
      Decided: false,
      Idug: modelId,
      FileSuffix: '',
      Valid: true,
      FileId: '',
      TwoOnly: false,
      history: []
    };
  } catch (error) {
    console.error('Failed to generate model from description via Gemini:', error);
    return createMockModel(description, type);
  }
}

// Create mock model for fallback
function createMockModel(description: string, type: number): DigitalModel {
  const modelId = `mock-model-${Date.now()}`;
  const modelTypeText = type === 1 ? 'Decision Making' : 'Performance Review';

  const mockElements = type === 1 ? [
    { name: 'Cost Effectiveness', desc: 'Financial impact and budget considerations', dominance: 0.25 },
    { name: 'Implementation Feasibility', desc: 'Ease of implementation and resource requirements', dominance: 0.2 },
    { name: 'Strategic Alignment', desc: 'Alignment with organizational goals and strategy', dominance: 0.25 },
    { name: 'Risk Assessment', desc: 'Potential risks and mitigation strategies', dominance: 0.15 },
    { name: 'Stakeholder Impact', desc: 'Effect on stakeholders and user satisfaction', dominance: 0.15 }
  ] : [
    { name: 'Quality Metrics', desc: 'Measurable quality indicators and standards', dominance: 0.3 },
    { name: 'Efficiency Measures', desc: 'Process efficiency and productivity metrics', dominance: 0.25 },
    { name: 'Customer Satisfaction', desc: 'Customer feedback and satisfaction scores', dominance: 0.2 },
    { name: 'Innovation Index', desc: 'Innovation and improvement initiatives', dominance: 0.15 },
    { name: 'Compliance Status', desc: 'Regulatory and policy compliance levels', dominance: 0.1 }
  ];

  const elements = mockElements.map((element, index) => ({
    SortNo: index,
    TelescopedModel: null,
    ComparationCompleted: false,
    ComparationTableData: {},
    DominanceFactor: element.dominance,
    DominantElementItIS: false,
    Meta: null,
    DtModified: new Date().toISOString(),
    DtCreated: new Date().toISOString(),
    Tlid: `tl-${modelId}-${index}`,
    NameElement: element.name,
    DisplayName: element.name,
    Description: element.desc,
    TwoOnly: false,
    TwoFlag: false,
    TwoFlagAnswered: false,
    ThreeFlag: 0,
    ThreeFlagAnswered: false,
    Idug: `element-${modelId}-${index}`,
    Status: 1,
    Question: false,
  }));

  return {
    AutoSaveModel: true,
    HasIssue: false,
    Model: elements,
    Note: null,
    ModelName: `${modelTypeText} Model`,
    DigitalThinkingModelType: type,
    DigitalTopic: description,
    Decision: false,
    Decided: false,
    Idug: modelId,
    FileSuffix: '',
    Valid: true,
    FileId: '',
    TwoOnly: false,
    history: []
  };
}

// Suggest elements from topic - returns simplified format for GeminiAssistant
export async function suggestElementsFromTopic(topic: string, modelType: number): Promise<{name: string; description: string}[]> {
  const genAI = getGenAI();
  if (!genAI) {
    console.warn('Gemini API not available, using mock suggestions');
    return createMockSuggestions(topic, modelType);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const typeText = modelType === 1 ? 'decision-making alternatives' : 'performance criteria';
    
    const prompt = `Suggest 5-7 ${typeText} for the topic: "${topic}"

Please respond with a valid JSON array of objects with this structure:
[
  {
    "name": "Element Name",
    "description": "Detailed description of this element"
  }
]

Make element names concise but descriptive and descriptions informative.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error('Empty response from AI');
    }

    const suggestions = parseAIJsonResponse(text);
    if (!Array.isArray(suggestions)) {
      throw new Error('AI response is not an array');
    }

    return suggestions.map((suggestion: any, index: number) => ({
      name: suggestion.name || `Element ${index + 1}`,
      description: suggestion.description || ''
    }));
  } catch (error) {
    console.error('Failed to suggest elements via Gemini:', error);
    return createMockSuggestions(topic, modelType);
  }
}

// Create mock suggestions for fallback
function createMockSuggestions(topic: string, modelType: number): {name: string; description: string}[] {
  const mockSuggestions = modelType === 1 ? [
    { name: 'Option A', description: `Primary alternative for ${topic}` },
    { name: 'Option B', description: `Secondary alternative for ${topic}` },
    { name: 'Option C', description: `Third alternative for ${topic}` },
    { name: 'Hybrid Approach', description: `Combined approach for ${topic}` },
    { name: 'Status Quo', description: `Maintain current state for ${topic}` }
  ] : [
    { name: 'Performance', description: `Performance metrics for ${topic}` },
    { name: 'Quality', description: `Quality standards for ${topic}` },
    { name: 'Efficiency', description: `Efficiency measures for ${topic}` },
    { name: 'Impact', description: `Overall impact of ${topic}` }
  ];

  return mockSuggestions;
}

// Generate analysis summary
export async function generateAnalysisSummary(model: DigitalModel): Promise<string> {
  const genAI = getGenAI();
  if (!genAI) {
    return generateMockAnalysisSummary(model);
  }

  try {
    const ai_model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const elementsText = model.Model.map(e => 
      `- ${e.DisplayName} (Dominance: ${e.DominanceFactor}): ${e.Description}`
    ).join('\n');

    const modelTypeText = model.DigitalThinkingModelType === 1 ? 'Decision Making' : 'Performance Review';

    const prompt = `Analyze this ${modelTypeText} model and provide a comprehensive summary:

Model: ${model.ModelName}
Topic: ${model.DigitalTopic}

Elements:
${elementsText}

Please provide:
1. Overall assessment of the model structure
2. Key insights about the element weights and balance
3. Potential strengths and areas for improvement
4. Recommendations for optimization

Keep the response concise but informative (2-3 paragraphs).`;

    const result = await ai_model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text || generateMockAnalysisSummary(model);
  } catch (error) {
    console.error('Failed to generate analysis summary via Gemini:', error);
    return generateMockAnalysisSummary(model);
  }
}

// Generate mock analysis summary
function generateMockAnalysisSummary(model: DigitalModel): string {
  const modelTypeText = model.DigitalThinkingModelType === 1 ? 'decision-making' : 'performance evaluation';
  const elementCount = model.Model.length;
  const avgDominance = 1 / elementCount;
  const maxDominance = Math.max(...model.Model.map(e => e.DominanceFactor));
  const minDominance = Math.min(...model.Model.map(e => e.DominanceFactor));

  return `This ${modelTypeText} model contains ${elementCount} elements with dominance factors ranging from ${minDominance.toFixed(2)} to ${maxDominance.toFixed(2)}. The model appears ${maxDominance > avgDominance * 1.5 ? 'to have some heavily weighted elements, suggesting clear priorities' : 'to have relatively balanced weighting across elements'}.

The structure suggests a ${model.DigitalThinkingModelType === 1 ? 'comprehensive approach to evaluating alternatives' : 'well-rounded performance measurement framework'}. ${elementCount > 5 ? 'The detailed breakdown allows for nuanced analysis' : 'The focused approach should facilitate clear decision-making'}.

Consider reviewing the element weights to ensure they align with your strategic priorities and stakeholder expectations. ${model.DigitalThinkingModelType === 2 ? 'For performance models, ensure metrics are measurable and actionable.' : 'For decision models, verify that all critical alternatives are represented.'}`;
}

// Generate action suggestions
export async function generateActionSuggestions(model: DigitalModel): Promise<string[]> {
  const genAI = getGenAI();
  if (!genAI) {
    return generateMockActionSuggestions(model.Model);
  }

  try {
    const ai_model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const criticalElements = model.Model.filter(e => 
      e.DominanceFactor > 0.2 || 
      e.DisplayName.toLowerCase().includes('critical') || 
      e.DisplayName.toLowerCase().includes('important')
    );

    const elementsText = criticalElements.map(e => 
      `- ${e.DisplayName}: ${e.Description} (Dominance: ${e.DominanceFactor})`
    ).join('\n');

    const prompt = `Based on these critical model elements, suggest 3-5 specific actionable recommendations:

${elementsText}

Please provide practical, specific actions that can be taken to improve or address these elements. Format as a JSON array of strings.

Example format:
["Action 1 description", "Action 2 description", "Action 3 description"]`;

    const result = await ai_model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error('Empty response from AI');
    }

    const suggestions = parseAIJsonResponse(text);
    if (Array.isArray(suggestions)) {
      return suggestions.filter((s: any) => typeof s === 'string' && s.length > 0);
    }

    // If not an array, try to extract suggestions from text
    const lines = text.split('\n')
      .filter(line => line.trim().length > 0 && (line.includes('-') || line.includes('•') || line.match(/^\d+\./)));

    return lines.slice(0, 5)
      .map(line => line.replace(/^[-•\d.\s]+/, '').trim())
      .filter(suggestion => suggestion.length > 0);
  } catch (error) {
    console.error('Failed to generate action suggestions via Gemini:', error);
    return generateMockActionSuggestions(model.Model);
  }
}

// Generate mock action suggestions
function generateMockActionSuggestions(elements: DigitalElement[]): string[] {
  const suggestions = [
    'Review and validate element weights based on current strategic priorities',
    'Gather stakeholder feedback on the relevance of each model element',
    'Establish clear measurement criteria for quantitative assessment',
    'Create implementation timeline with specific milestones and deliverables',
    'Develop monitoring and evaluation framework for ongoing assessment'
  ];

  // Customize suggestions based on element characteristics
  const highDominanceElements = elements.filter(e => e.DominanceFactor > 0.25);
  if (highDominanceElements.length > 0) {
    suggestions.unshift(
      `Focus immediate attention on high-priority elements: ${highDominanceElements.map(e => e.DisplayName).join(', ')}`
    );
  }

  const lowDominanceElements = elements.filter(e => e.DominanceFactor < 0.1);
  if (lowDominanceElements.length > 0) {
    suggestions.push(
      `Consider consolidating or removing low-impact elements: ${lowDominanceElements.map(e => e.DisplayName).join(', ')}`
    );
  }

  return suggestions.slice(0, 5);
}

// Create chat session
export function createChatSession(model: DigitalModel) {
  const genAI = getGenAI();
  if (!genAI) {
    // Return mock chat session
    return {
      sendMessage: async ({ message }: { message: string }) => {
        // Simple mock responses based on message content
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes('help') || lowerMessage.includes('what')) {
          return {
            text: `I can help you analyze your ${model.ModelName} model. You can ask me about element weights, relationships, or request suggestions for improvement.`
          };
        }

        if (lowerMessage.includes('weight') || lowerMessage.includes('important')) {
          const topElements = model.Model.sort((a, b) => b.DominanceFactor - a.DominanceFactor)
            .slice(0, 3)
            .map(e => `${e.DisplayName} (${(e.DominanceFactor * 100).toFixed(1)}%)`)
            .join(', ');
          return {
            text: `The most heavily weighted elements in your model are: ${topElements}. These should be your primary focus areas.`
          };
        }

        if (lowerMessage.includes('improve') || lowerMessage.includes('suggest')) {
          return {
            text: `To improve your model, consider: 1) Validating element weights with stakeholders, 2) Adding measurable criteria for each element, 3) Regular review and updates based on changing priorities.`
          };
        }

        return {
          text: `I understand you're asking about "${message}". Based on your ${model.ModelName} model with ${model.Model.length} elements, I'd recommend focusing on the highest-weighted elements first and ensuring all elements have clear, measurable criteria.`
        };
      }
    };
  }

  // Return real chat session
  const ai_model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  
  return {
    sendMessage: async ({ message }: { message: string }) => {
      try {
        const context = `You are an AI assistant helping with a ${model.DigitalThinkingModelType === 1 ? 'Decision Making' : 'Performance Review'} model called "${model.ModelName}".

Model Topic: ${model.DigitalTopic}

Model Elements:
${model.Model.map(e => `- ${e.DisplayName} (Dominance: ${e.DominanceFactor}): ${e.Description}`).join('\n')}

Please provide helpful, specific advice about this model. Keep responses concise and actionable.`;

        const prompt = `${context}\n\nUser Question: ${message}`;

        const result = await ai_model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return {
          text: text || 'I apologize, but I was unable to generate a response. Please try rephrasing your question.'
        };
      } catch (error) {
        console.error('Chat session error:', error);
        return {
          text: 'I encountered an error processing your message. Please try again or rephrase your question.'
        };
      }
    }
  };
}
