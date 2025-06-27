export interface SuggestedElement {
  nameElement: string
  displayName: string
  description: string
}

/**
 * Temporary stub that mocks the Gemini element suggestion.
 * Replace implementation with actual API call when credentials are available.
 */
export async function suggestElementsFromTopic(topic: string): Promise<SuggestedElement[]> {
  // TODO: integrate real Gemini/LLM API
  // For now, return mock elements based on topic keywords.
  const baseName = topic.split(" ").slice(0, 2).join(" ") || "Element"
  return Array.from({ length: 3 }).map((_, idx) => ({
    nameElement: `${baseName}${idx + 1}${Date.now().toString().slice(-4)}`,
    displayName: `${baseName} ${idx + 1}`,
    description: `Auto-generated suggestion related to ${topic}.`,
  }))
}
