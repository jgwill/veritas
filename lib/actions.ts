"use server"

import type { CreateModelRequest } from "./types"
import { createModel as createModelInLib, getAllModels, getModelById } from "./models"

export async function createModel(request: CreateModelRequest) {
  try {
    const model = await createModelInLib(request)
    return { success: true, model }
  } catch (error) {
    console.error("Error creating model:", error)
    return { success: false, error: "Failed to create model" }
  }
}

export async function fetchAllModels() {
  try {
    const models = await getAllModels()
    return { success: true, models }
  } catch (error) {
    console.error("Error fetching models:", error)
    return { success: false, error: "Failed to fetch models" }
  }
}

export async function fetchModel(id: string) {
  try {
    const model = await getModelById(id)
    if (!model) {
      return { success: false, error: "Model not found" }
    }
    return { success: true, model }
  } catch (error) {
    console.error("Error fetching model:", error)
    return { success: false, error: "Failed to fetch model" }
  }
}
