# TandT (Twos and Threes) - Application Specification

🧠: **Desired Outcome Definition**

Users achieve transparent, auditable, and systematic thinking about complex decisions and performance management—transforming subjective judgment into explicit, comparable, evidence-based outcomes that can be revisited, modified, and improved over time.

---

## Specification Index

This specification describes the complete TandT digital thinking framework. Related specifications provide detailed requirements for each component system:

- **decision_making_model.spec.md** - Type 1 models: Structured decision-making with mandatory/optional factors
- **performance_review_model.spec.md** - Type 2 models: Performance evaluation and improvement prioritization
- **model_generation.spec.md** - AI-powered model creation from natural language descriptions
- **analysis_workflow.spec.md** - Evaluation and decision rendering workflows
- **visualization_dashboard.spec.md** - Result visualization, dashboards, and action planning
- **model_persistence.spec.md** - Storage, history tracking, import/export capabilities
- **conversational_analysis.spec.md** - AI chat interface for contextual model analysis

---

## Creative Orientation & Core Philosophy

TandT enables a shift from intuitive to systematic thinking by making three transformations:

**Invisible → Visible**: Hidden mental models become explicit, written elements that others can evaluate
**Subjective → Auditable**: Personal judgment becomes traceable through documented comparisons and evaluation states
**Static → Evolving**: Decision-making becomes a practice with history, version tracking, and continuous refinement

### Structural Tension: Current Reality → Desired Outcome

| Dimension | Current Reality | Desired Outcome |
|-----------|-----------------|-----------------|
| **Decision Making** | Hidden reasoning, untraceable judgment, forgotten rationale | Explicit mandatory factors ranked by dominance, auditable decision trail |
| **Performance Management** | Subjective performance assessments, unclear priorities | Systematic evaluation of what's acceptable/unacceptable + trending direction |
| **Knowledge Transfer** | Decisions lost with team member departure, inconsistent frameworks | Exportable models that preserve decision logic and can guide future decisions |
| **Continuous Improvement** | Decisions made once, rarely revisited | Models with change history enable iterative refinement and learning |

---

## Application Modes & User Progression

TandT structures thinking through three distinct modes that users naturally progress through:

### Mode 1: **Modeling** (Clarify What We're Deciding)
- User articulates decision factors or performance dimensions
- Builds explicit mental model through naming and describing elements
- For Type 1 (Decisions): Establishes all factors to be compared
- For Type 2 (Performance): Defines what acceptable/unacceptable looks like

**Desired Outcome**: Clear, shared understanding of what's being evaluated

**Natural Progression**: Understanding emerges through the act of articulation → Users naturally want to test their model

### Mode 2: **Analyzing** (Apply Model to Reality)
- User evaluates real-world situation against their model
- Answers structured questions: Is this factor acceptable? Is it improving?
- Model logic renders outcome: Clear YES/NO decision or priority ranking
- User sees whether mandatory factors create blockers

**Desired Outcome**: Specific, auditable decision or performance assessment

**Natural Progression**: Once evaluation is complete, users want to see patterns and visualize implications → Next mode

### Mode 3: **Structuring** (Visualize & Plan Forward)
- User sees results visualized: Which factors dominate? Which need attention?
- AI generates specific, actionable suggestions for improvement
- Users can export results or revise model based on insights

**Desired Outcome**: Understanding what to act on next, with priority and clarity

**Natural Progression**: Insights drive next iteration of model or inform decisions

---

## Core Data Structure: DigitalModel

Every model in TandT is built from a single entity type:

```
DigitalModel
├── Identity: Unique ID, topic, name
├── Configuration: Type (Decision vs Performance), element list
├── State: Valid, decided, decision flag
├── Analysis: History (up to 50 versions), creation/modification timestamps
└── Elements: Array of DigitalElement (decision factors or performance dimensions)
```

Each **DigitalElement** contains:
- **Display Identity**: Name, description
- **Evaluation State**: TwoFlag (acceptable/unacceptable for Type 1) or ThreeFlag (trend for Type 2)
- **Comparative Position**: Dominance factor (how much this element matters in decisions)
- **Analysis Metadata**: Sort order, custom metadata

---

## Operating Philosophy

### Creating vs Correcting
TandT focuses on creating useful decision frameworks, not fixing broken thinking. The framework succeeds when users:
1. **Articulate** their thinking clearly (Modeling)
2. **Test** that thinking against reality (Analyzing)
3. **Refine** based on what they learn (return to Modeling with new insight)

### Advancement Pattern: Iteration Toward Clarity
Users naturally progress through cycles:
```
Modeling → Analyzing → Structuring → (Insight) → Back to Modeling (refined)
```

Each cycle deepens understanding because users see how their model performs against reality.

### Structural Dynamics
- **Choice Clarity Enables Action**: Until a decision is made explicit, no action is possible. TandT forces clarity.
- **Comparisons Reveal Values**: By comparing factors pairwise, dominance naturally emerges without subjective weighting.
- **History Enables Learning**: Preserved decisions enable learning: "What did we think then? Did it work out?"

---

## Type 1: Decision Making Models

### Creative Enablement
Type 1 models enable users to make binary (YES/NO) decisions that are:
- **Auditable**: Which factors led to this outcome?
- **Reversible**: History preserved if decision needs to be revisited
- **Mandatory-aware**: Explicit which factors are deal-breakers vs. nice-to-have

### Structural Tension: Clarity → Action
Unclear decision → Cannot proceed with confidence → Paralysis

Clear decision with auditable reasoning → Proceed with confidence → Action

### Mandatory Factor Logic
A decision is YES only if all mandatory factors evaluate to YES (TwoFlag = true).
If any mandatory factor is unacceptable (TwoFlag = false), decision = NO.

This natural logic reflects real-world constraints: If one critical factor fails, the decision fails.

### Pairwise Comparison System
Users compare all pairs of factors (A vs B, A vs C, B vs C, etc.) to establish dominance.
This forces explicit prioritization without arbitrary weighting scales.

---

## Type 2: Performance Review Models

### Creative Enablement
Type 2 models enable users to systematically evaluate performance and identify improvement priorities:
- **What's Acceptable**: Which dimensions are in good shape?
- **What Needs Attention**: Which are unacceptable?
- **What's Trending**: Which dimensions are improving, stable, or declining?

**Natural Outcome**: Action priorities emerge automatically from the intersection of unacceptability + declining trend

### Structural Tension: Awareness → Improvement
Scattered performance feedback → Cannot prioritize → Scattered improvement efforts

Systematic evaluation showing clear priorities → Natural focus on highest-impact areas → Measurable improvement

### State & Trend Logic
Each performance dimension has two evaluations:
- **State**: Is this acceptable right now?
- **Trend**: Is it improving, stable, or declining?

**Natural Prioritization**:
1. Unacceptable + Declining = Urgent (fix now)
2. Unacceptable + Stable = Important (need to improve)
3. Acceptable + Declining = Watch (preventing regression)
4. Acceptable + Stable = Maintain (good work)
5. Acceptable + Improving = Success (reward/expand)

---

## AI Integration: Model Generation & Analysis

### Creative Intent
AI serves as a thinking partner—not replacing human judgment, but accelerating the model creation process and providing context-aware analysis.

### Model Generation
When creating a new model, users can describe their decision in natural language:
- **Input**: "We need to hire a software engineer for our team"
- **AI Process**: Extracts key factors (skills, culture fit, experience, communication, learning ability, etc.)
- **Output**: Pre-populated model with suggested elements

**Desired Outcome**: 10-minute model creation instead of 1-hour brainstorming session

**Natural Progression**: User refines generated elements based on their context → Model becomes truly theirs

### Element Suggestions
During modeling, users can ask AI: "What factors should I consider for [topic]?"
AI suggests relevant factors, but user explicitly chooses what matters for their decision.

### Analysis Summaries
After evaluation, AI generates context-aware summaries showing:
- Which factors were most decisive
- Patterns in the evaluation (e.g., "All technical factors were acceptable, but cultural fit concerns were not")
- Implications of the decision

### Action Suggestions
For Type 2 (Performance), AI generates specific, prioritized actions:
- "Customer response time is declining and unacceptable. This is the highest priority to address."
- Suggestions emerge from the intersection of state + trend data

### Conversational Analysis
Users can ask follow-up questions: "What if we changed our tolerance for X?" or "How does this compare to our previous evaluation?"
AI responds with model-specific context, treating the conversation as structured thinking support.

---

## Persistence & Knowledge Transfer

### Local-First Architecture
Models persist in browser localStorage as JSON, enabling:
- **Offline operation**: No network required to create/edit models
- **Privacy**: Data stays on user's device
- **Portability**: Export as JSON file for sharing or backup

### History & Reversibility
Each save creates a version record (max 50 per model). Users can:
- View what changed between versions
- Revert to previous versions if evaluation was wrong
- See how their thinking evolved

### Import/Export
Models export as JSON files that can be:
- **Shared**: Email model to colleague for feedback
- **Versioned**: Store in Git/cloud storage for team decisions
- **Reimported**: Load previous version or colleague's model

---

## Integration Points

### External Systems
- **Google Gemini API**: Powers model generation, element suggestions, analysis summaries, action suggestions
- **Browser Storage**: localStorage provides persistent storage without backend
- **Chart Library**: Recharts visualizes dominance distributions and trends

### API Resilience
All AI features degrade gracefully:
- Missing API key → Mock data returned, features still functional
- API failure → Fallback suggestions provided
- Malformed response → Parser recovers or uses defaults

---

## User Experience Principles

### Progressive Disclosure
Users aren't overwhelmed with options:
1. **Modeling**: Simple name + description + elements interface
2. **Analyzing**: Mode-specific evaluation questions only
3. **Structuring**: Results visualizations with drill-down options

### Reversibility
Nearly all actions are reversible:
- Delete model → Still in history (can reimport)
- Change evaluation → Revert to previous version
- Undo comparison → Just change it in the modal

### Dark/Light Mode Support
Theme preference persists and applies to all visualizations and components.

### Responsive Design
Works on mobile (model creation) through desktop (comparison tables, dashboards).

---

## Success Metrics

A successful TandT implementation:

1. **Clarity of Outcome**: User completes model, analysis, and can explain decision rationale to others
2. **Reduced Decision Time**: Model creation + evaluation faster than unstructured approach
3. **Audit Trail**: Future reviewer can understand decision without asking original decision-maker
4. **Iteration Frequency**: Users return to refine models based on real-world outcomes
5. **Knowledge Preservation**: Models survive team member departure, team member turnover
6. **Confidence in Decisions**: Users report higher confidence in outcomes with TandT vs. intuitive approach

---

## Anti-Patterns to Avoid

- **Forced Completion**: Users should never feel required to use AI features; local-only workflows are valid
- **Complexity Creep**: Don't add factors that don't meaningfully affect the decision
- **History Bloat**: Maintain history for learning, but don't encourage constant saves
- **AI Over-Reliance**: AI suggestions should spark thinking, not replace it
- **Oscillating Decisions**: Model shouldn't require constant revision; revisions should represent real learning, not indecision

---

## Technical Foundation

- **Frontend**: React 18 + TypeScript (type-safe component interactions)
- **State**: Zustand (simple, performant, no boilerplate)
- **Storage**: Browser localStorage + JSON export (portable, privacy-preserving)
- **Styling**: Tailwind CSS + shadcn/ui (consistent, accessible components)
- **AI**: Google Gemini API (@google/generative-ai SDK)
- **Visualization**: Recharts (responsive, data-driven charts)
- **Build**: Vite (fast, zero-config development)

---

## Implementation Quality Criteria

**A new developer implementing from this specification should produce:**

1. ✅ A React application with three distinct modes (Modeling, Analyzing, Structuring)
2. ✅ Local storage persistence with import/export capability
3. ✅ Support for two model types (Decision vs Performance) with type-specific logic
4. ✅ Optional AI integration that gracefully degrades
5. ✅ History tracking with revert capability
6. ✅ Responsive UI that works mobile through desktop
7. ✅ Accessible components with proper ARIA attributes
8. ✅ Type-safe code structure with clear service/component separation

The specification is complete when another engineer can read it and implement TandT's core functionality without needing to examine the existing codebase.

---

**Specification Status**: ✅ Complete and autonomous
**RISE Phase**: Phase 2 (Intent Refinement) + Phase 3 (Export Optimization)
**Implementation Complexity**: Medium (requires understanding of state management, two distinct model types, optional AI integration)
