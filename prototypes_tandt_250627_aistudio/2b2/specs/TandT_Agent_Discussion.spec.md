# TandT Digital Thinking Guidance (Agent Discussion Spec)
A sophisticated decision-making and performance review application that helps users externalize, structure, and analyze their thinking to move from subjective feelings to objective, data-driven conclusions. It is designed for individuals or teams facing complex choices or needing to assess performance systematically.

`[For Agent: This specification is designed for collaborative refinement. Review the discussion points and clarification questions to identify areas for enhancement.]`

## Overview
The application's primary value is its implementation of two distinct, systematic evaluation methodologies, embodied by two model types:

1.  **Decision Making Model**: Guides a user to a definitive **YES/NO** decision. This is achieved by first helping the user build a "dominance hierarchy" of critical factors through pairwise comparison. Then, a specific scenario is evaluated against this hierarchy to produce a clear outcome. This is for making choices.

2.  **Performance Review Model**: Guides a user to a prioritized list of action items. This is achieved by evaluating a set of Key Performance Indicators (KPIs) on two axes: their current state (Acceptable/Unacceptable) and their trend (Improving/Stable/Declining). This is for assessing systems or processes.

The user journey for any model follows a three-mode process:
- **Modeling**: Defining the elements (factors or KPIs) of the thought process.
- **Analyzing**: Evaluating a real-world scenario against the defined elements.
- **Structuring**: Visualizing the results in a structured format (a dominance chart or a prioritized dashboard) to reveal insights.

The application is enhanced with optional, robust AI-powered assistance for generating ideas, summarizing results, suggesting actions, and answering questions about the model.

`[Discussion Point: The core value proposition is strong. How can we make the distinction between the two model types even more obvious to a first-time user? Perhaps a guided onboarding experience?]`
`[Extension Opportunity: Consider a third model type for root cause analysis or strategic planning.]`

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
- `[Clarification Needed: What happens if an imported file is valid JSON but not a valid *model* structure? The current spec implies a simple alert. Should we provide more detailed validation feedback? e.g., "Missing 'DigitalTopic' field."]`

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
- `[Discussion Point: For Decision Models, when new elements are added, they are initialized with a neutral comparison value against all existing elements. Should we prompt the user to compare the new elements immediately to fully integrate them into the hierarchy?]`

### Analyzing View
- **Purpose**: To enable users to evaluate a real-world scenario against the structure they built in the Modeling View.
- **Behavior**: Displays the same grid of element cards but with evaluation controls.
  - **For Decision Models**: Users mark each element as "Acceptable" (👍) or "Unacceptable" (👎). The app calculates and displays a final "YES" or "NO" decision based on these inputs and the pre-established dominance hierarchy.
  - **For Performance Models**: Users mark each element as "Acceptable"/"Unacceptable" AND set a trend: "Improving" (📈), "Stable" (➖), or "Declining" (📉).
- **Layout**: Grid of `ElementCard` components. A prominent header displays the final decision (for Type 1) or a summary title (for Type 2). An "AI Summary" button is available.
- **Navigation**: Users navigate to this view via the "Analyzing" tab in the main header.
- **Interactions**: Users click icon buttons on each card to set its evaluation state. Clicking the "AI Summary" button generates and displays a natural-language summary of the analysis.
- **Success Indicators**: The controls on the cards visually change to reflect the selected state. The AI summary appears in a new card with loading and error states.
- `[Clarification Needed: In the Decision Model, the decision is "NO" if *any* dominant factor is unacceptable. Should there be a configurable threshold? e.g., "Decision is NO if more than 2 dominant factors are unacceptable."]` `[For Agent: This is a key business logic question that impacts the core algorithm.]`

### Structuring View
- **Purpose**: To present the results of the modeling and analysis in a clear, structured, and insightful way.
- **Behavior**: This view provides a dashboard that visualizes the model's data.
  - **For Decision Models**: Displays a horizontal bar chart ranking elements by their `DominanceFactor`.
  - **For Performance Models**: Displays a "Performance Dashboard" with a prioritized action list.
- **Layout**: A dashboard layout. Type 1 shows a chart and list. Type 2 shows a two-column layout with a summary and detailed list.
- **Navigation**: Users navigate to this view via the "Structuring" tab in the main header.
- **Interactions**: Hovering over the chart reveals tooltips. Users can trigger AI action suggestions.
- **Success Indicators**: The chart and lists render based on the latest model data.
- `[Extension Opportunity: The dashboards are excellent. Could we add an "Export to PDF" or "Share Dashboard" feature for reporting purposes? This would greatly increase its value in a business context.]`

---
## Components
`[For Agent: The following components are well-defined. Our focus should be on how they interact and whether any new components are needed to address the discussion points above.]`

### Header
- **Purpose**: Provides global navigation and actions.
- **Behavior**: Mode switching, back navigation, theme toggle, History Panel toggle, Chat Analyst toggle.

### ElementCard
- **Purpose**: Visual representation of a `DigitalElement`.
- **Behavior**: Adapts its controls and display based on the current mode and model type.

### ComparisonModal
- **Purpose**: The unique pairwise comparison workflow for Decision Models.
- **Behavior**: Asks the core question: "If you have X but not Y... is the decision still YES?".

### AI Assistants
- **Purpose**: Reduce cognitive load and provide insights.
- **Behavior**: A suite of features for suggesting elements, generating models, summarizing analysis, and suggesting actions. All handle loading/error states.
- `[Discussion Point: The AI prompts are hardcoded in `geminiService.ts`. Should we make these configurable or allow users to tweak the AI's persona/instructions for advanced use cases?]`

### HistoryPanel
- **Purpose**: Version control for a model.
- **Behavior**: A slide-out panel listing changes, with a "Revert" option for each.

### ConversationalAnalyst
- **Purpose**: Ad-hoc natural language analysis of the model.
- **Behavior**: A chat widget primed with the current model's context.

---
## Global Behaviors
### Data Management
- **Intent**: To ensure user work is never lost and the application state is predictable.
- **Behavior**: Uses a Zustand store for state management and `localStorage` for persistence. Auto-saves on every change.
- `[Clarification Needed: `localStorage` has size limits (usually 5-10MB). What is the strategy if a user creates many large models and exceeds this limit? We should specify a graceful failure mode, like showing a warning and disabling saves.]`

### Error Handling
- **Intent**: To keep the user informed and maintain a stable experience.
- **Behavior**: API call failures are handled with `try...catch` and displayed in the UI. Invalid file imports show an alert.
- `[Extension Opportunity: Implement a more robust, non-blocking notification system (e.g., toast messages) instead of using browser alerts for errors like failed imports.]`

### Performance Characteristics
- **Intent**: To provide a fluid and responsive user experience.
- **Behavior**: Core logic is client-side. Asynchronous operations display loading indicators.

### Accessibility Features
- **Intent**: To make the application usable for a wider range of users.
- **Behavior**: Supports light/dark themes.
- `[Discussion Point: Accessibility can be improved. We should schedule an audit to add more ARIA attributes for screen readers, ensure keyboard navigability for all interactive elements, and check color contrast ratios.]`
