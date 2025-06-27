import { type NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"

// In-memory storage for demo purposes
// In production, this would be replaced with a database
const models: any[] = [
  {
    id: "1d807fb4-5293-471e-85f6-4c8dad6b3648",
    modelName: "habitav1b24042419",
    digitalTopic: "lieu habitat qui convient v1b",
    digitalThinkingModelType: 1,
    twoOnly: true,
    decided: false,
    valid: true,
    autoSaveModel: true,
    hasIssue: true,
    note: null,
    model: [
      {
        idug: "8e83ba14-8d25-4691-982a-a875fe2a20f4",
        nameElement: "VoisinageCalmeNuit",
        displayName: "Calme la nuit",
        description: " Bruits naturels et tranquilité.",
        sortNo: 0,
        status: 3,
        twoFlag: false,
        twoFlagAnswered: false,
        threeFlag: 0,
        threeFlagAnswered: false,
        dominanceFactor: 4,
        dominantElementItIS: false,
        comparationCompleted: true,
        question: false,
        comparationTableData: {
          "703aec8f-e2ae-4992-8eaa-621eb4b175fc": 0,
          "56ce826a-a357-4a8c-a55b-7f2d3867934d": 1,
          "a6aaf8a1-5a02-49be-82b7-c86256fffd36": 1,
          "49018796-53c2-4b77-bfa0-e5357dedbdd5": 0,
          "29a86815-3509-4678-9caa-d57f91cd9746": 0,
          "0c7a6199-4654-46d1-8abd-cb5a0b96f209": 0,
          "93fd84e7-7310-40dd-94d2-884394c53b65": 1,
          "ca910f82-bb56-43d9-84c9-023d11398eee": 0,
          "9f5e7184-4244-41d0-a50f-857e40151de2": 0,
          "1389ed65-0148-4d05-93d3-3f7e4f0fc9e3": 0,
          "00b2b068-b686-4099-8874-ad9d818e8d0c": 0,
          "5748e571-a84b-44b5-a948-12eb6cf979e2": 0,
          "733b92f8-2c03-4876-8667-08cf3559b025": 1,
        },
      },
      {
        idug: "703aec8f-e2ae-4992-8eaa-621eb4b175fc",
        nameElement: "Cuisinepratique",
        displayName: "Cuisine pratique",
        description: " Spacieuse et fonctionnelle pour deux personnes.",
        sortNo: 0,
        status: 1,
        twoFlag: true,
        twoFlagAnswered: false,
        threeFlag: 0,
        threeFlagAnswered: false,
        dominanceFactor: 5,
        dominantElementItIS: true,
        comparationCompleted: true,
        question: false,
        comparationTableData: {
          "8e83ba14-8d25-4691-982a-a875fe2a20f4": 1,
          "56ce826a-a357-4a8c-a55b-7f2d3867934d": 1,
          "a6aaf8a1-5a02-49be-82b7-c86256fffd36": 1,
          "49018796-53c2-4b77-bfa0-e5357dedbdd5": 0,
          "29a86815-3509-4678-9caa-d57f91cd9746": 0,
          "0c7a6199-4654-46d1-8abd-cb5a0b96f209": 0,
          "93fd84e7-7310-40dd-94d2-884394c53b65": 1,
          "ca910f82-bb56-43d9-84c9-023d11398eee": 0,
          "9f5e7184-4244-41d0-a50f-857e40151de2": 0,
          "1389ed65-0148-4d05-93d3-3f7e4f0fc9e3": 0,
          "00b2b068-b686-4099-8874-ad9d818e8d0c": 0,
          "5748e571-a84b-44b5-a948-12eb6cf979e2": 0,
          "733b92f8-2c03-4876-8667-08cf3559b025": 1,
        },
      },
    ],
  },
  {
    id: "8a3d07cd-216c-44c7-8a0b-2cc5c9e02c55",
    modelName: "ModelDigitalPerformanceReview",
    digitalTopic: "Digital Performance Review Model",
    digitalThinkingModelType: 2,
    twoOnly: false,
    decided: true,
    valid: true,
    autoSaveModel: true,
    hasIssue: false,
    note: null,
    model: [
      {
        idug: "a9bfea53-7917-487e-aa26-745307600f05",
        nameElement: "MatchbetweenbusinessofferingandMarket",
        displayName: "Match between business offering and Market",
        description: null,
        sortNo: 0,
        status: 3,
        twoFlag: false,
        twoFlagAnswered: true,
        threeFlag: 1,
        threeFlagAnswered: true,
        dominanceFactor: 0,
        dominantElementItIS: true,
        comparationCompleted: false,
        question: false,
        comparationTableData: {
          "a831661e-1b23-4f0f-ba19-9d7d8f346548": 0,
          "651cc7fe-5bfe-46e8-b561-319e4c363718": 0,
          "c07c2d6c-897e-48df-adaa-ef6bfefe3e7e": 0,
          "50b70c5f-377a-4189-9481-f9b871648d10": 0,
          "b880c6b7-d9a9-47b2-bef4-f74cd2cd695b": 0,
          "15ec5056-dd00-4abb-8511-2820975baa2d": 0,
          "dc643a80-e8d7-4f4f-906d-b1c430c20c5c": 0,
          "544caa9e-9966-42fb-8145-be6ac1e392cf": 0,
        },
      },
    ],
  },
]

export async function GET() {
  try {
    // Calculate summary statistics for each model
    const modelSummaries = models.map((model) => {
      const elementCount = model.model.length
      const totalComparisons = (elementCount * (elementCount - 1)) / 2
      const completedComparisons =
        model.model.reduce((sum: number, element: any) => {
          return sum + Object.values(element.comparationTableData).filter((val: any) => val !== 0).length
        }, 0) / 2 // Divide by 2 since each comparison is counted twice

      return {
        id: model.id,
        modelName: model.modelName,
        digitalTopic: model.digitalTopic,
        digitalThinkingModelType: model.digitalThinkingModelType,
        elementCount,
        completedComparisons,
        totalComparisons,
        decided: model.decided,
        lastModified: new Date().toISOString(), // Mock timestamp
      }
    })

    return NextResponse.json(modelSummaries)
  } catch (error) {
    console.error("Error fetching models:", error)
    return NextResponse.json({ error: "Failed to fetch models" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { modelName, digitalTopic, digitalThinkingModelType, twoOnly, note } = body

    // Validate required fields
    if (!modelName || !digitalTopic || !digitalThinkingModelType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create new model
    const newModel = {
      id: uuidv4(),
      modelName,
      digitalTopic,
      digitalThinkingModelType,
      twoOnly: twoOnly ?? true,
      decided: false,
      valid: true,
      autoSaveModel: true,
      hasIssue: false,
      note: note || null,
      model: [], // Empty elements array
    }

    // Add to storage
    models.push(newModel)

    return NextResponse.json(newModel, { status: 201 })
  } catch (error) {
    console.error("Error creating model:", error)
    return NextResponse.json({ error: "Failed to create model" }, { status: 500 })
  }
}
