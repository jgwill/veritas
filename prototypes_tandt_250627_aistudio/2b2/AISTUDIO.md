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