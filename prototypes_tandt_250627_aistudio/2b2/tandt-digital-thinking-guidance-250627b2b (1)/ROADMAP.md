# TandT Application Development Roadmap

This document outlines the phased development plan for the TandT (Think and Think) digital thinking guidance application.

---

## Phase 1: Core Modeling and Analysis Engine (MVP)

This phase focuses on building the fundamental features required for a user to create, structure, and analyze a decision model, with clear differentiation between the two model types.

### Core Features
- [x] **Project Setup**: Initialize React 18 with TypeScript and Tailwind CSS.
- [x] **Data Structures**: Define TypeScript interfaces for `DigitalModel` and `DigitalElement`.
- [x] **Model Loading**: Implement functionality to load pre-defined model data (`Decision Making` & `Performance Review`).
- [x] **Mode Switching UI**: Create the main header with navigation between "Modeling", "Analyzing", and "Structuring/Dashboard" modes.
- [*] **Modeling View**:
  - [x] Display all model elements as interactive cards.
  - [*] **Full Text Editing**: Allow editing of element titles and descriptions via a modal.
  - [x] **For Decision Making Models**:
      - [x] Implement the core pairwise comparison mechanism via a modal.
      - [x] Update `ComparationTableData` and `DominanceFactor` based on user input.
      - [x] Update comparison modal prompt to reflect a trade-off question.
  - [x] **For Performance Review Models**:
      - [x] Simplify the view to hide all comparison and dominance-related UI elements.
- [*] **Analyzing View**:
  - [x] Differentiate UI controls based on `DigitalThinkingModelType`.
    - **Decision Making (Type 1)**: Show only Acceptable/Unacceptable (👍/👎) controls.
    - **Performance Review (Type 2)**: Show both Acceptable/Unacceptable (👍/👎) and Trend (📈/➖/📉) controls.
  - [x] Implement the core decision algorithm for Decision Making models.
  - [x] Display a context-aware title (e.g., "Decision Is:" vs. "Analysis Summary").
- [*] **Dashboard/Structuring View**:
  - [x] **For Decision Making Models**:
      - [x] Create a bar chart to visualize the `DominanceFactor` of each element.
      - [x] Display a simple ranked list of elements.
  - [x] **For Performance Review Models**:
      - [x] Create a "Performance Dashboard" that shows a prioritized list of action items based on analysis results (unacceptable/getting worse).
- [x] **State Reset**: Automatically reset evaluation flags when a new model is loaded for a clean analysis session.

### Architecture & API
- **[x] Component-Based Architecture**: Decompose UI into reusable components.
- **[x] State Management**: Utilize React Hooks for managing the active `DigitalModel` state.
- **[ ] Local API Endpoints (Conceptual)**: Structure services as if they were hitting APIs.

### Gemini Integration
- **[x] Element Generation**:
  - [x] Add a "Suggest Elements with AI" feature in the Modeling view.
  - [x] UI to input a topic.
  - [x] Service call to Gemini API to generate a JSON list of relevant factors.
  - [x] Functionality to add the suggested elements to the current model.
  - [ ] Tweak Gemini prompt based on the `DigitalThinkingModelType`.

---

## Phase 2: Enhanced Analysis, UX, and Persistence

This phase builds on the MVP to enhance the user experience, add more detailed analysis views, and introduce persistence.

### Features
- [ ] **Full Three-State Analysis**: Incorporate the `ThreeFlag` (trend) data into the Performance Dashboard with better visuals.
- [ ] **"You Have / You Don't Have" View**: For Decision Making models, create the detailed summary screen seen in mockups, showing which criteria are met and which are not.
- [ ] **Model Management**:
    - [ ] Create a dedicated landing page to list, create, edit, and delete models.
    - [ ] Implement a guided model creation workflow (choosing type, step-by-step element addition).
- [ ] **Local Persistence**: Integrate `localStorage` or `IndexedDB` to save all model changes, so work is not lost on refresh.

### Architecture & API
- **[ ] API Expansion**:
  - `GET /api/models`, `POST /api/models`, `DELETE /api/models/:id`, `PUT /api/models/:id`
- **[ ] Refactor State Management**: Introduce a more robust state management solution if complexity demands it (e.g., Zustand or Redux Toolkit).

### Gemini Integration
- **[ ] AI-Powered Model Generation**:
    - During model creation, allow users to describe their goal in natural language.
    - Use Gemini to generate a complete starter `DigitalModel` JSON, including relevant elements.
    - Tweak the prompt based on whether it's a "Decision Making" or "Performance Review" model.
- **[ ] AI-Powered Analysis Summary**:
    - After an analysis is complete, send the results to Gemini.
    - Prompt Gemini to generate a natural-language paragraph explaining *why* the decision was reached or summarizing the performance review.
    - Display this summary on the results page.

---

## Phase 3: Collaboration, Advanced Features, and Deployment

This phase focuses on turning the tool into a collaborative, enterprise-ready platform.

### Features
- [ ] **User Accounts & Authentication**.
- [ ] **Backend & Database**: Transition to a full backend (e.g., Node.js/Express) with a database (e.g., PostgreSQL/MongoDB).
- [ ] **Real-time Collaboration**: Allow multiple users to view and edit a model simultaneously.
- [ ] **Import/Export**: Implement functionality to import/export models as JSON files.
- [ ] **History / Versioning**: Keep a history of changes to a model.

### Architecture & API
- **[ ] Full RESTful/GraphQL API**: Formalize the backend API with authentication middleware.
- **[ ] Cloud Deployment**: Prepare the application for deployment on a cloud platform (e.g., Vercel, Netlify, AWS).

### Gemini Integration
- **[ ] AI-Powered Action Suggestions**:
  - For Performance Review models, have Gemini suggest actionable steps based on the results.
- **[ ] Conversational AI Analyst**: Create a chat interface where a user can ask questions about their model in natural language.



--------
IMPORTED IDEA and CONCEPTS to Explore
---------






**1. Digital Performance Review Models**
- Purpose: Track performance trends over time
- Evaluation Methods:
  - Binary acceptability (1=Acceptable, 0=Unacceptable) 
  - Performance trend tracking (-1=Getting Worse, 0=Stay Same, 1=Getting Better)
- **NO dominance calculations required**
- Focus: Review performance and identify what's primary to work on