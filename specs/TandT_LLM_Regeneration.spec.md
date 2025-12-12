# TandT Digital Thinking Guidance (LLM Regeneration Spec)

`[For LLM: This document provides a complete and unambiguous specification for regenerating the TandT application. Adhere strictly to the data structures, component behaviors, and logic described herein.]`

---
## 1. Core Application Intent & Setup

- **Goal**: Create a React 18 application using TypeScript and Tailwind CSS. The app allows users to create and manage "Digital Models" for decision-making and performance review.
- **Dependencies**: Use an `importmap` in `index.html` to load the following libraries from a CDN like `esm.sh`:
  - `react@18.2.0`
  - `react-dom@18.2.0`
  - `zustand@4.5.4`
  - `recharts@2.12.7`
  - `@google/genai@1.7.0`
- **Global State**: All application state must be managed in a single Zustand store.
- **Persistence**: All model data must be persisted in the browser's `localStorage` under the key `TANDT_MODELS`.

---
## 2. Data Structures (types.ts)

Implement the following TypeScript interfaces exactly.

\`\`\`typescript
export interface HistoryEntry {
  id: string; // e.g., timestamp
  timestamp: string; // ISO string
  description: string;
  modelState: DigitalElement[]; // Deep snapshot
}

export interface ChatMessage {
  id:string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ActionSuggestion {
  area: string;
  suggestion: string;
}

export interface DigitalElement {
  Idug: string; // Unique ID
  DisplayName: string;
  Description: string | null;
  // For Decision Models (Type 1)
  ComparationTableData: { [key: string]: number }; // key is other element's Idug, value is -1, 0, or 1
  DominanceFactor: number;
  // For Analysis
  TwoFlag: boolean; // Acceptable (true) / Unacceptable (false)
  TwoFlagAnswered: boolean;
  ThreeFlag: number; // Trend: -1 (Declining), 0 (Stable), 1 (Improving)
  ThreeFlagAnswered: boolean;
  // Other metadata
  SortNo: number;
  NameElement: string;
  // Deprecated/unused fields from original model can be included for import compatibility
  [key: string]: any;
}

export interface DigitalModel {
  Idug: string; // Unique ID
  DigitalTopic: string;
  ModelName: string;
  DigitalThinkingModelType: number; // 1 for Decision, 2 for Performance
  Model: DigitalElement[];
  history?: HistoryEntry[];
  [key: string]: any;
}

export enum AppMode {
  Modeling = 'Modeling',
  Analyzing = 'Analyzing',
  Structuring = 'Structuring'
}

export type ModelId = string;

export interface ModelSummary {
  id: ModelId;
  name: string;
  type: number;
  description: string;
}
\`\`\`

---
## 3. Application Flow & Screens

The application is a single-page app. The root `App` component will conditionally render views based on the state from the Zustand store.

### 3.1. Initial View: ModelListView
- **Condition**: When `store.model` is `null`.
- **Behavior**:
  - Fetch all models from `localStorage` via the `modelService`.
  - Display each model as a `ModelCard`.
  - Each `ModelCard` shows the model's name, type, and description. It has buttons for "Load", "Export", and "Delete".
  - Deletion must be a two-step confirmation process contained within the card.
  - Display a "Create New Model" card that opens the `CreateNewModelModal`.
  - Display an "Import Model" button that opens a file picker.
  - **On Load Click**: Call `store.loadModel(modelId)`.
  - **On Import**: Read the file, parse as JSON, validate it's a `DigitalModel`, and save it via `modelService`. Handle parse errors with an alert.

### 3.2. Main View: Active Model
- **Condition**: When `store.model` is not `null`.
- **Layout**: Render a `Header` component and a main content area.
- **Content**: The content area renders one of three views based on `store.mode`:
  - `ModelingView`
  - `AnalyzingView`
  - `StructuringView`

### 3.3. Header Component
- **Behavior**:
  - A "Back" button that calls `store.closeModel()`, setting the active model to `null`.
  - A segmented control to switch the `AppMode` between "Modeling", "Analyzing", and "Structuring".
  - Buttons to toggle the visibility of the `HistoryPanel` and `ConversationalAnalyst` overlays.
  - A button to toggle the light/dark theme.

### 3.4. Modeling View
- **Behavior**:
  - Display a grid of `ElementCard` components for every element in `model.Model`.
  - Provide an "Edit" button on each card that opens an `EditElementModal` to change `DisplayName` and `Description`. The modal must also contain a "Delete" button for the element.
  - **If `model.DigitalThinkingModelType === 1` (Decision):**
    - Each card shows the `DominanceFactor`.
    - Each card has a "Compare" button that opens the `ComparisonModal`, passing the selected element as the `comparingElement`.
  - Include a `GeminiAssistant` button to suggest new elements.

### 3.5. ComparisonModal (for Decision Models)
- **Behavior**:
  - Receives a `comparingElement` and a list of `otherElements`.
  - It iterates through `otherElements`, asking the user to compare each one against `comparingElement`.
  - The question is: "If you have `[comparingElement.DisplayName]` but you don't have `[otherElement.DisplayName]`... Is the decision still YES?".
  - "YES" means `comparingElement` dominates `otherElement`. Record this as `results[otherElement.Idug] = 1`.
  - "NO" means `otherElement` dominates `comparingElement`. Record this as `results[otherElement.Idug] = -1`.
  - After all comparisons are done, call the `onComplete` callback with the results object.
  - **`onComplete` Logic**: For each result, update the `ComparationTableData` for *both* elements involved (the base element and the other element). The relationship is inverse (e.g., if A dominates B (1), then B is dominated by A (-1)). Then, recalculate the `DominanceFactor` for *all* elements in the model. The `DominanceFactor` is the count of `1`'s in an element's `ComparationTableData`. Save the updated model.

### 3.6. Analyzing View
- **Behavior**:
  - Display a grid of `ElementCard` components.
  - Each card has controls to set `TwoFlag` (Acceptable/Unacceptable) and, for Type 2 models, `ThreeFlag` (Trend).
  - Clicking a control updates the element in the store and triggers an auto-save.
  - **If `model.DigitalThinkingModelType === 1` (Decision):**
    - Calculate the final decision. The decision is "NO" if any element with `TwoFlag === false` (Unacceptable) has a `DominanceFactor` greater than or equal to any element with `TwoFlag === true` (Acceptable). A simpler, sufficient algorithm is: sort elements by `DominanceFactor` descending. Iterate through the sorted list. The first element encountered that has been evaluated as Unacceptable (`TwoFlagAnswered === true` and `TwoFlag === false`) makes the final decision "NO". If the loop completes without finding such a case, the decision is "YES".
    - Display the decision and reason prominently.
  - Include a button to trigger the "AI Summary" feature.

### 3.7. Structuring View
- **Behavior**:
  - **If `model.DigitalThinkingModelType === 1` (Decision):**
    - Use `recharts` to render a vertical `BarChart`.
    - Y-axis: `DisplayName` of elements.
    - X-axis: `DominanceFactor` of elements.
    - Sort the data so bars are displayed in ascending order of dominance.
  - **If `model.DigitalThinkingModelType === 2` (Performance):**
    - Display a prioritized list of all elements. The sort order is critical:
      1. Primary Sort Key: Unacceptable (`TwoFlag === false`) elements come before Acceptable (`TwoFlag === true`).
      2. Secondary Sort Key: Declining (`ThreeFlag === -1`) elements come before Stable (`ThreeFlag === 0`), which come before Improving (`ThreeFlag === 1`).
    - Use background colors and border colors on list items to visually indicate their status (e.g., red for "Unacceptable & Declining").
    - Provide a button to trigger "AI Action Suggestions" for the highest-priority items.

---
## 4. Services

### 4.1. `modelService.ts`
- **Responsibility**: All interactions with `localStorage`.
- **Functions**:
  - `getAvailableModels()`: Reads all models from storage and returns a list of `ModelSummary`.
  - `getModel(modelId)`: Retrieves a single model and performs pre-processing (resetting analysis flags, ensuring comparison tables are initialized).
  - `saveModel(model)`: Saves a single model back into the array in `localStorage`.
  - `createModel(...)`: Creates a new `DigitalModel` object and adds it to storage.
  - `deleteModel(modelId)`: Removes a model from storage.
  - `importModel(modelJson)`: Adds an imported model to storage. Handles ID conflicts by creating a new ID.
  - `exportModel(modelId)`: Retrieves a model for download.

### 4.2. `geminiService.ts`
- **Responsibility**: All communication with the Google GenAI API. Initialize with `new GoogleGenAI({ apiKey: process.env.API_KEY })`. Handle cases where the API key is missing by disabling AI features.
- **Functions**:
  - Each function must construct a specific prompt and request a JSON response (`responseMimeType: "application/json"`).
  - Each function must parse the response, including stripping markdown code fences (` ```json ... ``` `).
  - Implement the following functions with prompts tailored to their purpose:
    - `suggestElementsFromTopic(topic, modelType)`: Generates a list of `{name, description}` objects.
    - `generateModelFromDescription(description, modelType)`: Generates a `{DigitalTopic, Model}` object.
    - `generateAnalysisSummary(model)`: Generates a plain text summary.
    - `generateActionSuggestions(model)`: Generates a list of `{area, suggestion}` objects.
    - `createChatSession(model)`: Creates a `Chat` instance with a system instruction containing the full context of the provided model.

---
## 5. State Management (Zustand)

- **`store.ts`**: Create a single store to hold all of the following state and actions.
- **State**:
  - `model: DigitalModel | null`
  - `availableModels: ModelSummary[]`
  - `mode: AppMode`
  - `theme: 'light' | 'dark'`
  - `isLoading: boolean`
  - `isChatAnalystOpen: boolean`
  - All other UI state (modal visibility, etc.).
- **Actions**:
  - Create actions that wrap the `modelService` and `geminiService` calls.
  - Actions should manage the `isLoading` state (set to `true` at the start, `false` at the end).
  - The `saveModel` action must also append a new `HistoryEntry` to the model's `history` array before saving.
  - The `loadModel` action must reset all analysis-related UI state (e.g., close chat panel, clear AI suggestions).
