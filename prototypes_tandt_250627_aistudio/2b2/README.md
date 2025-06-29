# TandT - Digital Thinking Guidance Application

TandT (Think and Think) is a sophisticated web-based application designed to facilitate structured, data-driven decision-making and performance analysis. It implements systematic evaluation methodologies to help users move from subjective feelings to objective analysis.

This tool is powerful for everything from personal choices, like choosing a place to live, to complex business evaluations.

---

## Core Concepts & Model Types

The application's logic fundamentally changes based on the type of model you are working with.

### 1. Digital Decision Making Model (Type 1)

This model type is designed to help you make a clear **"YES" or "NO"** decision.

-   **Purpose**: To make a definitive choice by first establishing what's most important to you (e.g., "Should we hire this candidate?", "Is this the right apartment for me?").
-   **Modeling Mode**: The core of this mode is **building a dominance hierarchy**. For a chosen element, you are asked a series of questions: "If you have [this element] but you don't have [another element], would you still decide YES?". Your "YES" or "NO" answers systematically determine which elements are more critical than others. This process calculates a **Dominance Factor** for each element, giving you a clear, ranked list of your priorities.
-   **Analyzing Mode**: You evaluate a real-world scenario (e.g., a specific apartment listing) against your model using simple **Acceptable (👍) / Unacceptable (👎)** flags. The final decision is heavily influenced by the dominance hierarchy you built.
-   **Structuring/Dashboard View**: This view shows the results of your modeling phase—a **Dominance Chart** and a ranked list of factors, visually representing your established hierarchy of importance.

### 2. Digital Performance Review Model (Type 2)

This model type is designed to evaluate the current state of a system, project, or process and to identify what needs attention. It **does not use comparison or dominance**.

-   **Purpose**: To get a clear, prioritized list of what to work on (e.g., "How is our company performing this quarter?").
-   **Modeling Mode**: This mode is simple: you only **define the elements** that need to be reviewed. There is no comparison.
-   **Analyzing Mode**: You evaluate the current performance of each element using a two-tiered system:
    1.  **State**: Is the current state **Acceptable (👍)** or **Unacceptable (👎)**?
    2.  **Trend**: Is performance **Getting Better (📈)**, **Staying the Same (➖)**, or **Getting Worse (📉)**?
-   **Structuring/Dashboard View**: This view presents a **Performance Dashboard**. It's an automatically prioritized action list, highlighting elements that are "Unacceptable" or "Getting Worse" so you know exactly where to focus your efforts.

---

## Development & Architecture

This section provides a high-level overview of the project's structure, making it easier for future developers to understand and contribute.

### Core Technologies
- **React 18**: For building the user interface.
- **TypeScript**: For static typing and improved code quality.
- **Tailwind CSS**: For utility-first styling.
- **@google/genai**: For integrating Gemini AI features.

### Project Structure
- **`index.tsx`**: The main entry point of the React application.
- **`App.tsx`**: The root component that manages global state, routing between views, and the main application lifecycle.
- **`components/`**: Contains all reusable React components.
  - **Views (`ModelingView`, `AnalyzingView`, `StructuringView`, `ModelListView`)**: Top-level components for each of the main application screens.
  - **Modals (`ComparisonModal`, `EditElementModal`, `CreateNewModelModal`)**: Components for interactive dialogs.
  - **Shared (`Header`, `ElementCard`)**: Common UI elements used across multiple views.
- **`services/`**: Contains business logic decoupled from the UI.
  - **`modelService.ts`**: Acts as the data access layer. It handles all CRUD (Create, Read, Update, Delete) operations for models by interfacing with `localStorage`.
  - **`geminiService.ts`**: Manages all interactions with the Google Gemini API, including generating element suggestions and creating full models from user descriptions.
- **`types.ts`**: Defines all core TypeScript interfaces (`DigitalModel`, `DigitalElement`, etc.) used throughout the application.
- **`constants.ts`**: Holds initial/default model data.

### State Management
The application uses a centralized state management approach within the `App.tsx` component, leveraging React Hooks (`useState`, `useEffect`, `useCallback`). The `model` state is held here and passed down as props to the active view. Callbacks like `handleSaveModel` are passed down to allow child components to trigger state updates in the parent.

### Persistence
All application data (models, elements, etc.) is persisted in the browser's **`localStorage`**. The `modelService.ts` abstracts all interactions with `localStorage`, making the rest of the application agnostic to the storage mechanism. On first load, the service initializes `localStorage` with two default models. Every subsequent change is saved automatically.

### Gemini Integration
The `geminiService.ts` provides functions that construct specific prompts for the Gemini API (`gemini-2.5-flash-preview-04-17`). It requests structured JSON responses and includes parsing logic to handle the API's output gracefully. API calls are designed to be asynchronous, with loading and error states managed in the UI components.