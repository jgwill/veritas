# TandT Digital Thinking Guidance
A sophisticated decision-making and performance review application that helps users externalize, structure, and analyze their thinking to move from subjective feelings to objective, data-driven conclusions. It is designed for individuals or teams facing complex choices or needing to assess performance systematically.

## Overview
The application's primary value is its implementation of two distinct, systematic evaluation methodologies, embodied by two model types:

1.  **Decision Making Model**: Guides a user to a definitive **YES/NO** decision. This is achieved by first helping the user build a "dominance hierarchy" of critical factors through pairwise comparison. Then, a specific scenario is evaluated against this hierarchy to produce a clear outcome. This is for making choices.

2.  **Performance Review Model**: Guides a user to a prioritized list of action items. This is achieved by evaluating a set of Key Performance Indicators (KPIs) on two axes: their current state (Acceptable/Unacceptable) and their trend (Improving/Stable/Declining). This is for assessing systems or processes.

The user journey for any model follows a three-mode process:
- **Modeling**: Defining the elements (factors or KPIs) of the thought process.
- **Analyzing**: Evaluating a real-world scenario against the defined elements.
- **Structuring**: Visualizing the results in a structured format (a dominance chart or a prioritized dashboard) to reveal insights.

The application is enhanced with optional, robust AI-powered assistance for generating ideas, summarizing results, suggesting actions, and answering questions about the model.

---
## Screens
### Model List View (Landing Page)
- **Purpose**: To provide a central hub for users to manage all their thinking models. This is the entry point to the application.
- **Behavior**: Users can see a list of all their saved models, each displayed on a card showing its name, type, and description. From here, users can load an existing model, create a new one, import a model from a file, export a model to a file, or delete a model.
- **Layout**: A clean, card-based grid layout. An explicit "Create New Model" card is always visible. A header provides global actions like "Import Model" and theme switching.
- **Navigation**: Clicking "Load Model" navigates the user into the main application view for that model. There is no direct navigation between models; users must return to this list.
- **Interactions**:
  - Click "Load Model" on a card to open it.
  - Click the "Delete" icon on a card to initiate a two-step deletion confirmation.
  - Click the "Export" icon to download the model as a JSON file.
  - Click "Create New Model" to open a creation modal.
  - Click "Import Model" to open a file picker.
- **Success Indicators**: The model list updates immediately after a model is created, imported, or deleted. A loading spinner appears while models are being fetched.

### Modeling View
- **Purpose**: To allow users to define the structure of their thinking by creating and editing the core elements of their model.
- **Behavior**: This view displays all elements of the current model as a grid of cards. Users can edit an element's title and description.
  - **For Decision Models**: Users can initiate a "pairwise comparison" process to build the dominance hierarchy. This is the primary activity in this mode for this model type.
  - **For Performance Models**: This view is simpler; users just define the KPIs to be reviewed. Comparison functionality is hidden.
- **Layout**: A grid of `ElementCard` components. A header provides context and an "AI Assistant" button to suggest new elements.
- **Navigation**: Users navigate to this view via the "Modeling" tab in the main header.
- **Interactions**:
  - Click the "Edit" icon on an element card to open an editing modal.
  - Click "Compare" on an element card (Decision Models only) to open the `ComparisonModal`.
  - Click "Suggest Elements with AI" to open a modal where the user can input a topic to get AI-generated elements.
- **Success Indicators**: The view updates immediately when elements are added, edited, or deleted. The `DominanceFactor` on cards updates after a comparison is completed.

### Analyzing View
- **Purpose**: To enable users to evaluate a real-world scenario against the structure they built in the Modeling View.
- **Behavior**: Displays the same grid of element cards but with evaluation controls.
  - **For Decision Models**: Users mark each element as "Acceptable" (👍) or "Unacceptable" (👎). The app calculates and displays a final "YES" or "NO" decision based on these inputs and the pre-established dominance hierarchy.
  - **For Performance Models**: Users mark each element as "Acceptable"/"Unacceptable" AND set a trend: "Improving" (📈), "Stable" (➖), or "Declining" (📉).
- **Layout**: Grid of `ElementCard` components. A prominent header displays the final decision (for Type 1) or a summary title (for Type 2). An "AI Summary" button is available.
- **Navigation**: Users navigate to this view via the "Analyzing" tab in the main header.
- **Interactions**: Users click icon buttons on each card to set its evaluation state. Clicking the "AI Summary" button generates and displays a natural-language summary of the analysis.
- **Success Indicators**: The controls on the cards visually change to reflect the selected state. The AI summary appears in a new card with loading and error states.

### Structuring View
- **Purpose**: To present the results of the modeling and analysis in a clear, structured, and insightful way.
- **Behavior**: This view provides a dashboard that visualizes the model's data.
  - **For Decision Models**: Displays a horizontal bar chart ranking elements by their `DominanceFactor`, making the user's priority hierarchy explicit. A simple ranked list is also shown.
  - **For Performance Models**: Displays a "Performance Dashboard" which is a prioritized list of action items. Elements that are "Unacceptable" and/or "Declining" are sorted to the top. An AI assistant can be triggered to suggest concrete actions for the most critical issues.
- **Layout**: A dashboard layout. Type 1 shows a large chart and a list. Type 2 shows a two-column layout with a "Focus Hierarchy" summary and a detailed, color-coded list of all elements.
- **Navigation**: Users navigate to this view via the "Structuring" tab in the main header.
- **Interactions**: Hovering over the chart reveals tooltips. Users can trigger an "AI Action Suggestions" feature.
- **Success Indicators**: The chart and lists are rendered based on the latest model data. AI suggestions appear in a new card with loading and error states.

---
## Components
### Header
- **Purpose**: Provides global navigation and actions within an active model.
- **Behavior**: Allows switching between the three main modes (Modeling, Analyzing, Structuring). Provides buttons to return to the model list, toggle the theme, open the History Panel, and open the Conversational AI Analyst.
- **Styling**: A sticky header at the top of the page with clear, icon-driven buttons and a segmented control for mode switching.

### ElementCard
- **Purpose**: To be the primary visual representation of a single `DigitalElement`.
- **Behavior**: Its appearance and controls adapt based on the current `AppMode` and `DigitalThinkingModelType`. It shows title, description, and mode-specific controls (e.g., "Compare" button in Modeling, evaluation icons in Analyzing, no controls in Structuring).
- **Styling**: A distinct card with a header, body, and footer section. Uses color and borders to indicate state (e.g., a blue border when being compared).

### ComparisonModal (HierarchyBuilderModal)
- **Purpose**: To provide the unique pairwise comparison workflow that is the core of the Decision Making model.
- **Behavior**: Presents the user with a series of questions in the format: "If you have [Base Element] but you don't have [Other Element]... Is the decision still YES?". The user's "YES/NO" answer determines which of the two elements is more dominant.
- **Styling**: A full-screen modal that focuses the user on the current comparison, showing the two elements being compared and two large "YES" / "NO" buttons.

### AI Assistants (GeminiAssistant, Summaries, Suggestions)
- **Purpose**: To reduce user effort and provide intelligent insights.
- **Behavior**: A suite of features integrated throughout the app. They take the current model context, send it to the Gemini API with a carefully crafted prompt, and then display the result. All AI interactions show clear loading and error states.
- **Styling**: AI features are consistently identified with a "sparkles" icon and often use a purple color accent.

### HistoryPanel
- **Purpose**: To provide version control for a model, allowing users to undo changes.
- **Behavior**: Slides out from the side of the screen. It displays a chronological list of all saved changes to the model. Users can click a "Revert" button on any entry to restore the model to that state.
- **Styling**: A slide-in side panel with a list of history entries.

### ConversationalAnalyst
- **Purpose**: To allow users to ask ad-hoc questions about their model in natural language.
- **Behavior**: A chat widget that opens in the corner of the screen. The AI is primed with the context of the current model. Users can ask questions like "What is my most important factor?" and receive a conversational answer.
- **Styling**: A familiar chat interface with user and assistant message bubbles.

---
## Global Behaviors
### Data Management
- **Intent**: To ensure user work is never lost and that the application state is predictable and maintainable.
- **Behavior**: The application uses a centralized Zustand store as the single source of truth. All models and their data are persisted to the browser's `localStorage` via a `modelService`. Every change to a model (editing, comparing, analyzing) triggers an auto-save.
- **Flow**: Components trigger actions in the Zustand store -> The store updates its state -> The store calls the `modelService` to persist the change to `localStorage` -> React components subscribed to the store re-render with the new state.

### Error Handling
- **Intent**: To keep the user informed and maintain a stable experience, even when external services fail.
- **Behavior**: API calls to the Gemini service have `try...catch` blocks. If an API call fails, an error message is stored in the state and displayed to the user within the relevant component (e.g., an error message appears in the AI summary card). Invalid imported files trigger a browser alert.

### Performance Characteristics
- **Intent**: To provide a fluid and responsive user experience.
- **Behavior**: The core application logic (everything except AI features) runs entirely in the browser using `localStorage`, making it very fast. All asynchronous operations (loading models, AI calls) display clear loading indicators (e.g., spinners, disabled buttons) so the user is never left wondering if the app is working.

### Accessibility Features
- **Intent**: To make the application usable for a wider range of users.
- **Behavior**: The application supports both light and dark themes, respecting the user's operating system preference on first load. It uses semantic HTML and buttons, but could be improved with more explicit ARIA attributes.
