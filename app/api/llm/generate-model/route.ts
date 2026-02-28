import { neon } from '@neondatabase/serverless'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { getUserFromRequest } from '@/lib/auth'

const sql = neon(process.env.DATABASE_URL!)

/**
 * Build DigitalElement objects from a simple element list.
 * For Performance Review (type 2) elements carry TwoFlag / ThreeFlag state.
 */
function buildElements(
  elements: Array<{ name: string; description?: string; state?: number; trend?: number }>,
  modelType: number
) {
  const ids = elements.map(() => uuidv4())
  return elements.map((el, i) => {
    const isPerf = modelType === 2
    // state: -1 declining, 0 neutral, 1 improving (ThreeFlag)
    // trend: false = concern, true = strength (TwoFlag)
    const threeFlag = isPerf ? (el.state ?? 0) : 0
    const twoFlag = isPerf ? (el.trend !== undefined ? el.trend !== 0 : false) : false

    const compTable: Record<string, number> = {}
    if (modelType === 1) {
      ids.forEach((id, j) => { if (j !== i) compTable[id] = 0 })
    }

    return {
      Idug: ids[i],
      SortNo: i,
      DisplayName: el.name,
      NameElement: el.name.replace(/[^a-zA-Z0-9]/g, ''),
      Description: el.description ?? null,
      TwoOnly: modelType === 1,
      TwoFlag: twoFlag,
      TwoFlagAnswered: isPerf,
      ThreeFlag: threeFlag,
      ThreeFlagAnswered: isPerf,
      ComparationTableData: compTable,
      ComparationCompleted: false,
      DominanceFactor: 0,
      DominantElementItIS: isPerf,
      Meta: {},
      DtModified: new Date().toISOString(),
      DtCreated: new Date().toISOString(),
      Tlid: Date.now().toString(),
      Status: isPerf ? 3 : 1,
      Question: false,
      TelescopedModel: null,
    }
  })
}

/**
 * POST /api/llm/generate-model
 *
 * Creates a Performance Review (type=2) or Decision Making (type=1) model
 * on behalf of the authenticated user and persists it to the database.
 *
 * Request body:
 * {
 *   "topic": "string",               // Required. Model title / subject.
 *   "model_type": 1 | 2,            // 1 = Decision Making, 2 = Performance Review (default: 2)
 *   "description": "string",         // Optional. Notes about the model.
 *   "elements": [                    // Required. 2–20 elements.
 *     {
 *       "name": "string",            // Required. Short element name.
 *       "description": "string",     // Optional. What this element measures.
 *       "state": -1 | 0 | 1,        // Performance Review only. -1 declining, 0 neutral, 1 improving.
 *       "trend": -1 | 0 | 1         // Performance Review only. -1 concern, 0 neutral, 1 strength.
 *     }
 *   ]
 * }
 *
 * Response:
 * {
 *   "model": { id, name, model_type, description, created_at },
 *   "message": "string"
 * }
 */
export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Provide a valid Bearer token (session or tandt_sk_* API key).' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { topic, model_type, description, elements } = body

    // --- validation ---
    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return NextResponse.json({ error: '"topic" is required and must be a non-empty string.' }, { status: 400 })
    }

    const modelType: number = model_type === 1 ? 1 : 2  // default to Performance Review

    if (!Array.isArray(elements) || elements.length < 2) {
      return NextResponse.json(
        { error: '"elements" must be an array with at least 2 items.' },
        { status: 400 }
      )
    }

    if (elements.length > 20) {
      return NextResponse.json({ error: '"elements" must have at most 20 items.' }, { status: 400 })
    }

    for (const el of elements) {
      if (!el.name || typeof el.name !== 'string') {
        return NextResponse.json({ error: 'Each element must have a "name" string.' }, { status: 400 })
      }
      if (modelType === 2 && el.state !== undefined && ![-1, 0, 1].includes(el.state)) {
        return NextResponse.json({ error: 'Element "state" must be -1, 0, or 1.' }, { status: 400 })
      }
      if (modelType === 2 && el.trend !== undefined && ![-1, 0, 1].includes(el.trend)) {
        return NextResponse.json({ error: 'Element "trend" must be -1, 0, or 1.' }, { status: 400 })
      }
    }

    // --- build model data ---
    const builtElements = buildElements(elements, modelType)
    const modelId = uuidv4()
    const modelData = {
      Model: builtElements,
      history: [],
    }

    const rows = await sql`
      INSERT INTO models (id, user_id, name, description, model_type, model_data)
      VALUES (
        ${modelId},
        ${user.id},
        ${topic.trim()},
        ${description ?? null},
        ${modelType},
        ${JSON.stringify(modelData)}
      )
      RETURNING id, name, model_type, description, created_at, updated_at
    `

    return NextResponse.json(
      {
        model: rows[0],
        message: `${modelType === 2 ? 'Performance Review' : 'Decision Making'} model "${topic.trim()}" created with ${elements.length} elements.`,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[llm/generate-model] Error:', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
