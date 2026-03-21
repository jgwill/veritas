# TandT – Digital Thinking Framework

TandT (Twos and Threes from Robert Fritz) is a comprehensive digital thinking and decision-making framework, not just a web application. It is designed to facilitate **structured, auditable, and extensible evaluation methodologies** for both individual and organizational scenarios. TandT is deeply rooted in the principles of **Structural Thinking** as developed in the CreerSaVie knowledge base, enabling users to move from subjective intuition to objective, systematic analysis.

---

## Philosophical Foundation: Structural Thinking & CreerSaVie

TandT operationalizes the core ideas of **Structural Thinking**: breaking down complex problems into elements, comparing and ranking them, and making thinking explicit, auditable, and improvable. The methodology is inspired by and directly connected to the CreerSaVie project, which provides the philosophical and practical foundation for systematic, iterative, and transparent decision processes.

---

## Core Model Types

TandT supports two fundamentally different model types, each with its own methodology and workflow:

### 1. Digital Decision Making Model (Type 1)
- **Purpose**: Make a clear YES/NO decision by establishing what is truly mandatory versus optional.
- **Methodology**: Uses **pairwise comparison** ("If you have [X] but not [Y], is the answer YES?") to build a **dominance hierarchy** among elements. This produces a ranked, auditable list of priorities and a clear decision output.
- **Workflow**: 
  - **Modeling**: Define elements, perform all pairwise comparisons, calculate dominance factors.
  - **Analyzing**: Evaluate real-world scenarios using binary Acceptable/Unacceptable flags, with the dominance hierarchy guiding the final decision.
  - **Structuring**: Visualize the dominance chart and element ranking.
- **Example**: Choosing a place to live, hiring decisions, investment analysis.

### 2. Digital Performance Review Model (Type 2)
- **Purpose**: Track and prioritize improvement areas in systems, projects, or organizations over time.
- **Methodology**: No dominance or pairwise comparison. Each element is evaluated for **acceptability** (1=Acceptable, 0=Unacceptable) and **trend** (-1=Getting Worse, 0=Same, 1=Getting Better). The system automatically prioritizes what needs attention.
- **Workflow**:
  - **Modeling**: Define the elements to be reviewed.
  - **Analyzing**: Assess each element for state and trend.
  - **Structuring**: Dashboard highlights unacceptable or declining elements for action.
- **Example**: Business performance review, employee evaluation, project health checks.

---

## Architecture & Workflow

TandT is architected for **robustness, extensibility, and auditability**:

- **State Machine Driven**: The application lifecycle is managed by a finite state machine, ensuring reliable transitions and workflow integrity.
- **Layered Design**:
  - **Data Layer**: Entity Framework models, JSON serialization, repository pattern, versioning, audit trails.
  - **Service Layer**: Business logic, validation, error handling, async operations, integration points.
  - **UI Layer**: Guided workflows, progressive disclosure, context-sensitive help, advanced navigation.
- **Plugin Architecture**: Extensible for custom elements, algorithms, UI themes, and export formats.
- **Integration**: Central charting, file system, database, reporting, and external APIs.
- **Persistence**: Models and results are stored as JSON, supporting import/export, backup, and sharing.

---

## Quality Attributes
- **Performance**: Efficient for models with 100+ elements.
- **Reliability**: Comprehensive validation, error recovery, and audit trails.
- **Security**: Data encryption, access control, and compliance.
- **Extensibility**: Plugin-ready, API-driven, and adaptable to new domains.

---

## Workflow Overview
- **Editing Mode**: Build/configure models, manage elements, set up comparisons (if applicable).
- **Analyzing Mode**: Evaluate elements against reality, make assessments, view results.
- **Structuring/Dashboard**: Visualize rankings, priorities, and action items.
- **Import/Export**: JSON-based sharing and backup.
- **Auditability**: Every change is tracked and reversible.

---

## Relationship to CreerSaVie
TandT is a direct software embodiment of the **Structural Thinking** principles developed in CreerSaVie. Both projects share the goal of making complex thinking explicit, improvable, and shareable. For more on the philosophy and methodology, see the CreerSaVie knowledge base.

---

## Further Reading & Specifications

{{ TODO link with ./rispecs }}


- **Sample Models**: See `samples/` for real-world JSON model examples.
- **Ledgers**: See `codex/ledgers/` for detailed iteration logs and technical decisions.
- **CreerSaVie**: For the philosophical and methodological foundation.

---

## Evolution
TandT has evolved from a legacy WinForms/.NET application to a modern, extensible digital thinking platform, with SpecLang as its specification backbone. The README is only a summary—**the specs are the real documentation**.


