import { NextResponse } from 'next/server'

/**
 * GET /api/llm/schema
 *
 * Returns the OpenAPI-compatible schema for the TandT LLM API.
 * No authentication required – this is a public discovery endpoint.
 */
export async function GET() {
  const schema = {
    openapi: '3.1.0',
    info: {
      title: 'TandT LLM API',
      version: '1.0.0',
      description:
        'Programmatic API for LLMs to create and manage TandT Digital Thinking Models on behalf of a user. ' +
        'Authenticate with a tandt_sk_* API key issued from the app settings.',
    },
    servers: [{ url: '/api/llm' }],
    security: [{ bearerAuth: [] }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          description: 'Use a tandt_sk_* API key obtained from the TandT app settings.',
        },
      },
      schemas: {
        Element: {
          type: 'object',
          required: ['name'],
          properties: {
            name: {
              type: 'string',
              description: 'Short, descriptive element name (e.g. "Market Share", "Code Quality").',
            },
            description: {
              type: 'string',
              description: 'What this element measures or represents.',
            },
            state: {
              type: 'integer',
              enum: [-1, 0, 1],
              description:
                'Performance Review only. Current state: -1 = declining, 0 = stable/neutral, 1 = improving.',
            },
            trend: {
              type: 'integer',
              enum: [-1, 0, 1],
              description:
                'Performance Review only. Trend assessment: -1 = concern/weakness, 0 = neutral, 1 = strength.',
            },
          },
        },
        CreateModelRequest: {
          type: 'object',
          required: ['topic', 'elements'],
          properties: {
            topic: {
              type: 'string',
              description: 'The title or subject of the model (e.g. "Q2 Team Performance Review").',
            },
            model_type: {
              type: 'integer',
              enum: [1, 2],
              default: 2,
              description:
                '1 = Decision Making (pairwise dominance comparison). 2 = Performance Review (state + trend analysis). Defaults to 2.',
            },
            description: {
              type: 'string',
              description: 'Optional notes or context for the model.',
            },
            elements: {
              type: 'array',
              minItems: 2,
              maxItems: 20,
              items: { $ref: '#/components/schemas/Element' },
              description: 'The factors, dimensions, or criteria to include in the model.',
            },
          },
        },
        Model: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            model_type: { type: 'integer', enum: [1, 2] },
            description: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    paths: {
      '/generate-model': {
        post: {
          operationId: 'generateModel',
          summary: 'Create a new TandT model',
          description:
            'Generates a Performance Review or Decision Making model from a topic and list of elements, then saves it to the authenticated user\'s account.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateModelRequest' },
                examples: {
                  performanceReview: {
                    summary: 'Performance Review Model',
                    value: {
                      topic: 'Q2 Engineering Team Performance',
                      model_type: 2,
                      description: 'Mid-year review of the core engineering team.',
                      elements: [
                        { name: 'Code Quality', description: 'Test coverage, review process, and bug rate.', state: 1, trend: 1 },
                        { name: 'Delivery Velocity', description: 'Features shipped per sprint.', state: 0, trend: 0 },
                        { name: 'Team Collaboration', description: 'Communication and cross-functional work.', state: 1, trend: 1 },
                        { name: 'Technical Debt', description: 'Accumulated shortcuts and legacy issues.', state: -1, trend: -1 },
                        { name: 'Documentation', description: 'Quality and coverage of internal docs.', state: -1, trend: 0 },
                      ],
                    },
                  },
                  decisionMaking: {
                    summary: 'Decision Making Model',
                    value: {
                      topic: 'Choose a new database provider',
                      model_type: 1,
                      description: 'Evaluate options for the backend data layer.',
                      elements: [
                        { name: 'Cost', description: 'Monthly operational cost at scale.' },
                        { name: 'Developer Experience', description: 'Ease of use and tooling quality.' },
                        { name: 'Scalability', description: 'Ability to handle growth without re-architecture.' },
                        { name: 'Reliability', description: 'Uptime guarantees and failover support.' },
                      ],
                    },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Model created successfully.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      model: { $ref: '#/components/schemas/Model' },
                      message: { type: 'string' },
                    },
                  },
                },
              },
            },
            '400': { description: 'Invalid request body.' },
            '401': { description: 'Missing or invalid API key.' },
            '500': { description: 'Internal server error.' },
          },
        },
      },
    },
    'x-usage-notes': [
      'Set the Authorization header to: Bearer tandt_sk_<your_api_key>',
      'Generate your API key from the TandT app under Settings > API Access.',
      'For Performance Review models (type=2), set "state" and "trend" on each element to pre-populate the analysis.',
      'For Decision Making models (type=1), state/trend are ignored; elements are set up for pairwise comparison.',
    ],
  }

  return NextResponse.json(schema)
}
