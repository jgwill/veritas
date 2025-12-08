# TandT RISE Framework Specifications

🧠: **Welcome to the TandT specification suite**

This directory contains complete, autonomous RISE-framework specifications for the TandT (Twos and Threes) digital thinking application. These specifications describe the system entirely from a creative-intent perspective—focusing on what the application enables users to create, how structural dynamics drive progression, and what desired outcomes users achieve.

---

## What is TandT?

TandT transforms subjective thinking into systematic, auditable, evidence-based decision-making and performance management. It enables users to:

- **Make auditable decisions**: Decision models with mandatory factor logic ensure all critical factors are evaluated
- **Manage performance systematically**: Performance models reveal what's working, what needs attention, and what's declining
- **Preserve thinking over time**: Complete history tracking lets users revisit decisions and learn from outcomes
- **Apply AI as thinking partner**: Optional Gemini integration generates models, suggests factors, and provides analysis
- **Share structured thinking**: Export/import models for team collaboration and knowledge transfer

---

## Specification Structure

### Core Application Specs

**📋 [app.spec.md](./app.spec.md)** - Application Overview
- Creative intent: What TandT enables users to create
- Three application modes (Modeling, Analyzing, Structuring)
- Core data model and terminology
- Operating philosophy and design principles
- **Start here** for overall understanding

### Type 1: Decision Making

**🎯 [decision_making_model.spec.md](./decision_making_model.spec.md)** - Decision Model Specification
- Pairwise comparison system: How factors are compared to establish dominance
- Mandatory factor logic: How all factors must be acceptable for YES decision
- Dominance calculation: How importance naturally emerges from comparisons
- Decision algorithm: From evaluation to YES/NO outcome
- Complete lifecycle from creation through decision rendering

### Type 2: Performance Review

**📊 [performance_review_model.spec.md](./performance_review_model.spec.md)** - Performance Model Specification
- State × Trend evaluation: How dimensions are assessed (acceptable/unacceptable + improving/stable/declining)
- Priority matrix: How urgency automatically calculated (critical → success)
- Natural prioritization: How action priorities emerge from state × trend combination
- Quarterly workflow: How performance tracked and improved over time
- Complete lifecycle from creation through action planning

### Feature Specs

**🤖 [model_generation.spec.md](./model_generation.spec.md)** - AI Integration
- Model generation from natural language (removes creation friction)
- Element suggestions during modeling
- Analysis summaries showing decision drivers
- Action suggestions for performance improvements
- Conversational analysis: Follow-up questions about model implications
- Graceful degradation if API unavailable

**🔍 [analysis_workflow.spec.md](./analysis_workflow.spec.md)** - Evaluation Process
- Type 1: Evaluating factors (acceptable/unacceptable)
- Type 2: Evaluating state + trend
- Decision logic and priority calculation
- Visual feedback and progress tracking
- Revision capability (change answers, outcomes recalculate)
- Auto-save after each answer

**📈 [visualization_dashboard.spec.md](./visualization_dashboard.spec.md)** - Results & Visualization
- Type 1 dominance distribution chart
- Type 1 decision statement and mandatory factor analysis
- Type 2 performance matrix (state × trend)
- Type 2 prioritized action list
- AI-generated insights (optional)
- Export options (PDF, JSON, CSV)
- Responsive design for mobile through desktop

**💾 [model_persistence.spec.md](./model_persistence.spec.md)** - Storage & History
- LocalStorage-based persistence (no backend required)
- Auto-save after every change
- History tracking (up to 50 versions per model)
- Revert capability (restore previous versions)
- Import/export (JSON, CSV, PDF)
- Model organization and browsing
- Backup and recovery

---

## How Specifications Connect

### Data Flow Architecture

```
CREATE MODEL
├─ Manual: User provides name + adds elements
└─ AI-Generated: User describes goal → AI suggests elements

↓

MODELING MODE (Structure the thinking)
├─ Type 1: Make pairwise comparisons → Dominance emerges
└─ Type 2: Define what "acceptable" means for each dimension

↓

SAVE TO PERSISTENCE
└─ Auto-save creates history entry
    └─ Model persisted in localStorage with timestamp

↓

ANALYZING MODE (Apply model to reality)
├─ Type 1: Evaluate each factor (acceptable? YES/NO)
│   └─ Decision algorithm runs → YES/NO outcome
└─ Type 2: Evaluate each dimension (state + trend)
    └─ Priority algorithm runs → Sorted by urgency

↓

SAVE EVALUATION
└─ History entry created with evaluation results
    └─ Can revert to previous evaluation if needed

↓

STRUCTURING MODE (Visualize patterns)
├─ Type 1: Show dominance distribution + decision statement
└─ Type 2: Show performance matrix + action priorities

↓

EXPORT/SHARE
├─ JSON: Complete export with history for backup/sharing
├─ CSV: Elements for spreadsheet import
├─ PDF: Formatted report for presentation
└─ Import: Load external model or restore from backup

↓

OPTIONAL: AI ANALYSIS
├─ Generation: "Create model from this description"
├─ Suggestions: "What factors should I consider?"
├─ Summary: "What drove this decision?"
├─ Actions: "What should we do about this?"
└─ Chat: "What if we changed this factor?"
```

### Specification Dependencies

**All specs are autonomous** (can be read independently), but there are logical dependencies:

```
app.spec.md (READ FIRST - Overview)
    ├─→ decision_making_model.spec.md (Type 1 details)
    │   └─→ analysis_workflow.spec.md (Type 1 evaluation)
    │       └─→ visualization_dashboard.spec.md (Type 1 results)
    │
    ├─→ performance_review_model.spec.md (Type 2 details)
    │   └─→ analysis_workflow.spec.md (Type 2 evaluation)
    │       └─→ visualization_dashboard.spec.md (Type 2 results)
    │
    ├─→ model_generation.spec.md (AI features - optional)
    │
    ├─→ model_persistence.spec.md (Storage - all modes depend on this)
    │
    └─→ analysis_workflow.spec.md (Core evaluation workflow)

Suggested Reading Order:
1. app.spec.md (understand overall system)
2. decision_making_model.spec.md OR performance_review_model.spec.md
3. analysis_workflow.spec.md
4. visualization_dashboard.spec.md
5. model_generation.spec.md (if implementing AI)
6. model_persistence.spec.md (implementation detail for all)
```

---

## Key Concepts Across Specs

### Structural Tension Dynamics

Every spec describes how **structural tension** drives natural progression:

**General Pattern**:
```
Current Reality (problem, unclear situation)
         ↓ (tension)
Desired Outcome (clear, resolved, understood)
         ↓ (natural forces)
Natural Progression (steps user takes to get there)
```

**Examples**:

Type 1 Decision:
```
Current: "Which candidate should we hire?" (unclear)
         ↓
Desired: "Clear YES/NO with auditable reasoning"
         ↓
Progression: Create model → Compare factors → Evaluate → Decision renders
```

Type 2 Performance:
```
Current: "How is the team actually doing?" (scattered feedback)
         ↓
Desired: "Clear priorities (critical → success)"
         ↓
Progression: Define dimensions → Evaluate state+trend → Priorities calculated
```

### Three Application Modes

Every user journey progresses through these modes:

1. **Modeling**: Create/refine the framework
   - What are we deciding?
   - What dimensions matter?
   - What does acceptable look like?

2. **Analyzing**: Apply framework to reality
   - Is this factor acceptable?
   - Is this dimension improving or declining?
   - What does the decision say?

3. **Structuring**: Visualize patterns
   - Which factors dominate?
   - What needs attention first?
   - What action should we take?

### Two Model Types

The system supports two fundamentally different thinking patterns:

**Type 1: Binary Decisions**
- Pairwise comparison → Dominance
- Mandatory factor logic → YES/NO outcome
- Use: Hiring, vendor selection, investment decisions, location choice
- Question: "Is this factor acceptable?"

**Type 2: Performance Evaluation**
- State + Trend evaluation → Priority matrix
- Automatic prioritization (critical → success)
- Use: Quarterly reviews, team assessment, project health
- Questions: "Is this acceptable?" + "Is it improving?"

### Autonomous Specification Principle

Each specification can be read independently and provides enough detail for another engineer to implement that component **without seeing the codebase**. The specifications don't refer to file paths or existing code—they describe the system conceptually.

Example: A developer reading only `decision_making_model.spec.md` can implement pairwise comparison and dominance calculation without needing to read other specs (though context from `app.spec.md` helps).

---

## RISE Framework Alignment

These specifications follow the RISE Framework (Reverse-Engineer, Intent-Extract, Specify, Export):

### Phase 1: Reverse-Engineering ✅
- Analyzed TandT codebase
- Extracted creative intent: What does TandT enable users to create?
- Identified structural dynamics: How does thinking naturally progress?
- Documented desired outcomes: What results do users achieve?

### Phase 2: Intent Refinement ✅
- Transformed understanding into specifications
- Defined desired outcomes for each feature
- Documented structural dynamics for natural progression
- Created Creative Advancement Scenarios showing real usage patterns

### Phase 3: Export Optimization ✅
- Formatted specifications for different audiences:
  - **Developers**: Technical detail for implementation
  - **Architects**: System design and component relationships
  - **Product**: User workflows and desired outcomes
  - **QA**: Completeness checklist for testing

---

## Using These Specifications

### For Implementation

1. **Read app.spec.md** - Understand the overall vision and architecture
2. **Read relevant detail spec** - decision_making_model.spec.md OR performance_review_model.spec.md
3. **Read analysis_workflow.spec.md** - Understand evaluation flow
4. **Read visualization_dashboard.spec.md** - Understand visualization requirements
5. **Reference model_persistence.spec.md** - Implement storage layer

Each spec includes a "Specification Completeness Check" at the end—use this as your acceptance criteria.

### For Code Review

Use the "Creative Intent" section at the top of each spec to verify implementations preserve the original thinking intent.

Use "Completeness Check" to verify all requirements are met.

### For Documentation

Specs can be converted to user documentation:
- Reframe "Creative Intent" as "Why this feature matters"
- Reframe scenarios as tutorials
- Simplify technical sections for end users

### For Testing

Create test cases from "Creative Advancement Scenarios":
- Each scenario = test case
- Follow happy path through scenario
- Verify desired outcome achieved

---

## Specification Quality

### Design Principles Applied

✅ **Creative Orientation**: Focus on what users create, not problems solved
✅ **Structural Dynamics**: Explain natural progression, not forced steps
✅ **Advancing Patterns**: Describe momentum, not oscillation
✅ **Desired Outcomes**: Clear results users want to achieve
✅ **Complete Autonomy**: All specs readable independently

### Anti-Patterns Avoided

❌ No reactive problem-solving language ("eliminates the issue of...")
❌ No forced connections ("bridging the gap between...")
❌ No force-based language ("users must...")
❌ No oscillating patterns (back-and-forth without advancement)
❌ No code references (specs are implementation-agnostic)

---

## Version & Maintenance

**Specification Version**: 1.0 (RISE Framework aligned)
**Created**: December 2024
**Status**: Complete and autonomous

**Maintenance**:
- These specs are living documents
- Update when requirements change (major feature additions)
- Don't update for bug fixes or minor implementation changes
- Track changes in Git history for reference

---

## Questions & Extensions

### Reading These Specs

**Q: Where should I start?**
A: Start with `app.spec.md` for the complete picture, then dive into relevant detail specs.

**Q: Are these specs detailed enough to implement without the codebase?**
A: Yes. Each spec is self-contained. A developer with general web development knowledge should be able to implement from these specs alone.

**Q: Can I implement just Type 1 or just Type 2?**
A: Yes. Specs are modular. You could implement Type 1 decision models without Type 2 performance models.

**Q: How do I know my implementation is complete?**
A: Each spec includes a "Specification Completeness Check" section. Verify all items are met.

### Extensions & Future Features

Possible extensions not in current specs:
- Cloud sync across devices
- Team collaboration (shared models)
- Webhooks / API access
- Advanced analytics (aggregate decision patterns)
- Custom themes
- Mobile app (native iOS/Android)

To add features:
1. Write new specification following RISE Framework
2. Define Creative Intent and Desired Outcome
3. Document Structural Dynamics
4. Include Creative Advancement Scenarios
5. Add to this README with pointer

---

## License & Attribution

🧠 **Specifications created with RISE Framework**
- RISE Framework by Guillaume D.Isabelle (2025)
- Built upon SpecLang by GitHubNext team
- Autonomous specification format for LLM understanding

These specifications are open for sharing and adaptation. Preserve the creative intent principle when extending or modifying.

---

**Last Updated**: December 8, 2024
**Format**: Markdown (GitHub-flavored)
**Compliance**: RISE Framework v1.0, SpecLang Autonomy Principle
