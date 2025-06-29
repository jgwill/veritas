# AI Studio Self-Correction and Strategy Guide

This document contains meta-instructions and strategies to improve response quality.

## Changelog Strategy

When completing a user request, update `CHANGELOG.md`. The entry should summarize the user's request and the key changes made to the application in response. Format the entry like this:

```markdown
# yyMMddHHMM

## > [User's core request paraphrased here]

### feat: [short description of feature]

- [Detailed change 1]
- [Detailed change 2]
```

## Generating Structured JSON

When a feature requires a structured JSON object or array from the Gemini API, follow these best practices in the prompt:

1.  **Explicitly state the format**: Clearly define the entire JSON structure, including keys and expected data types (e.g., `"name": string`, `"description": string`).
2.  **Provide a concrete example**: Show a snippet of the exact JSON output you expect. This is one of the most effective ways to guide the model.
3.  **Use `responseMimeType: "application/json"`**: This config option encourages the model to output raw JSON.
4.  **Instruct against extraneous text**: Add a command like "Do not include any other text, explanations, or markdown formatting outside of the JSON object/array."
5.  **Parse defensively**: In the client code, always trim whitespace and check for markdown code fences (```json ... ```) around the response text before parsing. Assume the response might not be perfect and use try-catch blocks.

## Summarization Prompts

When asking the AI to summarize data (e.g., an analysis result), provide clear context and constraints.

1.  **Define the Persona**: Start by giving the AI a role (e.g., "You are an expert strategic consultant.").
2.  **Provide All Data**: Give a concise but complete summary of the input data the AI should use.
3.  **Explain the Logic**: Briefly explain the rules or logic it should use for its analysis (e.g., "A decision is 'NO' if any highly dominant factor is 'Unacceptable'.").
4.  **Constrain the Output**: State the desired format and length (e.g., "generate a concise, natural-language summary," "Highlight the top 1-3 priorities").
5.  **Prohibit Hallucination**: Explicitly tell the model not to invent information (e.g., "Based *only* on the provided data.").