"use server"

import type { CreateModelRequest, DigitalModel } from "./types"
import { createModel as createModelLib, loadModelsFromSamples } from "./models"

export async function createModelAction(request: CreateModelRequest): Promise<DigitalModel> {
  return createModelLib(request)
}

export async function getModelsAction(): Promise<DigitalModel[]> {
  return loadModelsFromSamples()
}
