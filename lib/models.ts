import fs from "fs"
import path from "path"

export interface DigitalModel {
  id: string
  modelName: string
  digitalTopic: string
  digitalThinkingModelType: number
  twoOnly: boolean
  decided: boolean
  valid: boolean
  autoSaveModel: boolean
  hasIssue: boolean
  note?: string
  model: DigitalElement[]
}

export interface DigitalElement {
  idug: string
  nameElement: string
  displayName: string
  description: string
  sortNo: number
  status: number
  twoFlag: boolean
  twoFlagAnswered: boolean
  threeFlag: number
  threeFlagAnswered: boolean
  dominanceFactor: number
  dominantElementItIS: boolean
  comparationCompleted: boolean
  question: boolean
  comparationTableData: Record<string, number>
}

// In-memory storage for development
let modelsCache: DigitalModel[] | null = null

export function loadModelsFromSamples(): DigitalModel[] {
  if (modelsCache) {
    return modelsCache
  }

  const models: DigitalModel[] = []

  try {
    const samplesDir = path.join(process.cwd(), "samples")

    if (fs.existsSync(samplesDir)) {
      const files = fs.readdirSync(samplesDir)

      for (const file of files) {
        if (file.endsWith(".json")) {
          try {
            const filePath = path.join(samplesDir, file)
            const fileContent = fs.readFileSync(filePath, "utf-8")
            const modelData = JSON.parse(fileContent)

            // Extract ID from filename if not present in data
            if (!modelData.id) {
              const match = file.match(/([a-f0-9-]{36})/i)
              if (match) {
                modelData.id = match[1]
              } else {
                modelData.id = file.replace(".json", "")
              }
            }

            models.push(modelData)
          } catch (error) {
            console.error(`Error loading model from ${file}:`, error)
          }
        }
      }
    }
  } catch (error) {
    console.error("Error loading models from samples:", error)
  }

  modelsCache = models
  return models
}

export function getModelById(id: string): DigitalModel | null {
  const models = loadModelsFromSamples()
  return models.find((model) => model.id === id) || null
}

export function updateModel(id: string, updates: Partial<DigitalModel>): DigitalModel | null {
  const models = loadModelsFromSamples()
  const modelIndex = models.findIndex((model) => model.id === id)

  if (modelIndex === -1) {
    return null
  }

  models[modelIndex] = { ...models[modelIndex], ...updates }
  modelsCache = models // Update cache

  return models[modelIndex]
}

export function deleteModel(id: string): boolean {
  const models = loadModelsFromSamples()
  const modelIndex = models.findIndex((model) => model.id === id)

  if (modelIndex === -1) {
    return false
  }

  models.splice(modelIndex, 1)
  modelsCache = models // Update cache

  return true
}

export function createModel(modelData: Omit<DigitalModel, "id">): DigitalModel {
  const models = loadModelsFromSamples()
  const newModel: DigitalModel = {
    ...modelData,
    id: crypto.randomUUID(),
  }

  models.push(newModel)
  modelsCache = models // Update cache

  return newModel
}
