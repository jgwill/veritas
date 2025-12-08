# Model Generation & AI Integration - Specification

🧠: **Desired Outcome Definition**

Users generate complete, thoughtful decision or performance models from natural language descriptions—reducing the time to create a structured thinking framework from hours to minutes, while preserving their ability to refine and personalize the model for their context.

---

## Creative Intent

AI model generation removes friction from the Modeling phase by providing intelligent starting points. Instead of blank-page paralysis, users describe their decision and receive a pre-populated model they can immediately refine.

**Structural Tension**: Empty model → Unclear where to start → Model creation takes long time

Resolution: User describes goal → AI suggests elements → User refines → Model ready quickly → Natural progression to Analyzing phase

---

## Model Generation Interface

### Access Point: Create New Model Modal

User flow:
1. Click "Create New Model" button
2. Modal shows two options:
   - **Manual**: Enter name only → Create blank model → Add elements manually
   - **With AI Help**: Enter description → AI generates → Review suggestions → Create model

### AI Generation Path

**Step 1: Collect User Input**

```
Modal Form:
├── Model Type: [Decision Making] or [Performance Review]
├── Topic/Goal: [Text field]
│   Placeholder: "e.g., Hire a senior engineer for our team"
│                "e.g., Quarterly engineering team performance"
└── Optional Context: [Text field - multiline]
    Placeholder: "e.g., Remote role, will lead junior engineers"
                 "e.g., Focus on delivery velocity"
```

**Step 2: Call AI (Gemini)**

System sends to Gemini API:

```
Prompt Template (Type 1 - Decision):
"Create a decision-making model for: [USER_TOPIC]
Context: [USER_CONTEXT if provided]

Generate 5-7 decision factors that would be important for this decision.
For each factor, provide a name and brief description of why it matters.

Return as JSON:
{
  elements: [
    { name: "Factor Name", description: "Why this matters for decision" },
    ...
  ]
}

Focus on factors that would actually block or enable this decision."
```

```
Prompt Template (Type 2 - Performance):
"Create a performance review model for: [USER_TOPIC]
Context: [USER_CONTEXT if provided]

Generate 5-7 performance dimensions to evaluate.
For each dimension, provide a name and description of what acceptable looks like.

Return as JSON:
{
  elements: [
    { name: "Dimension Name", description: "What acceptable means" },
    ...
  ]
}

Focus on dimensions that reveal whether performance is healthy."
```

**Step 3: Parse AI Response**

System processes response:
- Extract JSON (handles markdown code blocks, escaped JSON, etc.)
- Validate: At least 2 elements, each with name and description
- Fallback: If parsing fails, return sensible defaults

**Step 4: Display Suggestions for Review**

```
Modal shows:
┌─────────────────────────────────────────┐
│ Suggested Elements for [Topic]          │
├─────────────────────────────────────────┤
│ ☐ Technical Skills                      │
│   Why: Ability to do the job            │
│                                         │
│ ☐ Cultural Fit                          │
│   Why: Working with team successfully   │
│                                         │
│ ☐ Communication                         │
│   Why: Clarity in discussions           │
│                                         │
│ ☐ Cost (Salary)                         │
│   Why: Budget constraint                │
│                                         │
│ ☐ Experience Level                      │
│   Why: Can hit ground running           │
│                                         │
│ [+ Add Custom Element]                  │
│ [← Back] [Create Model] [Cancel]        │
└─────────────────────────────────────────┘
```

**Step 5: User Refinement**

Before creating model, user can:
- ☑️/☐ Toggle which elements to include
- Edit element names and descriptions
- Add custom elements not in suggestions
- Remove unwanted suggestions

**Step 6: Create Model**

System creates model with:
- Selected/refined elements
- Type (Decision or Performance)
- Topic and context saved for reference
- Initialized with appropriate structure (Type 1 gets empty comparison tables; Type 2 gets no comparisons)

---

## Element Suggestions (In-Model)

### Access Point: "Get Suggestions" Button in ModelingView

While in Modeling mode, user can ask AI to suggest elements for their model:

**Trigger**:
```
Button: "Get AI Suggestions for [Topic]"
Modal: Shows AI-generated suggestions for this specific model
User: Can add any suggestions to their current model
```

**Prompt Structure**:
```
User Topic: "Hiring for product manager role"
Current Elements: ["Technical Understanding", "Product Sense"]

Prompt to AI:
"For hiring a product manager with these existing factors:
- Technical Understanding
- Product Sense

Suggest 3-5 additional factors to consider.
Focus on factors that would affect the hiring decision.

Return as simple list of suggestions."
```

**Display Format**:
```
Suggestions for Your Model:

+ Communication & Storytelling
  → Add to model

+ Cross-functional Leadership
  → Add to model

+ Data-Driven Decision Making
  → Add to model
```

---

## Analysis Summaries (In Analysis)

### Creative Intent

After evaluating a model, user can ask AI to provide contextual analysis showing:
- Which factors were most decisive
- Patterns in the evaluation
- Implications of the outcome
- Suggestions for next steps

### Access Point: "AI Analysis" Button in AnalyzingView

**Prompt to Gemini**:

```
Type 1 (Decision) Prompt:
"Model Topic: [Topic]
Elements Evaluated: [List of elements, sorted by DominanceFactor]
Evaluation Results: [Which factors were acceptable/unacceptable]
Final Decision: [YES/NO]

Provide a 3-4 sentence summary of:
1. The key decision factors and their importance
2. Which factors drove the YES/NO outcome
3. Any patterns or insights from the evaluation

Keep it concise and actionable."
```

```
Type 2 (Performance) Prompt:
"Model Topic: [Topic]
Performance Dimensions: [List of dimensions]
Current Evaluation: [State and trend for each]

Provide a 3-4 sentence summary of:
1. The overall performance picture (what's working, what needs attention)
2. The most critical area needing improvement
3. Any positive trends worth reinforcing

Keep it concise and actionable."
```

**Display Format**:
```
AI Analysis Summary

This team shows strong morale and communication, which is improving after
your mentorship program launch. However, delivery speed has become critical—
it's both unacceptable (40% miss rate) and declining (down from 20% last
quarter). Focus immediate attention here before regression cascades to
other metrics. Consider whether external factors (scope creep, tooling)
are the root cause.
```

---

## Action Suggestions (In Structuring)

### Creative Intent

In Structuring mode, user can ask AI to generate specific, actionable recommendations based on their performance evaluation (Type 2) or decision outcome (Type 1).

### Type 2: Performance-Driven Actions

**Trigger**: "Generate Action Plan" button in StructuringView

**Prompt to Gemini**:
```
Model Topic: [Topic]
Current Performance State: [Dimensions sorted by priority]

Critical Issues (Unacceptable + Declining):
- [Dimension]: Current status, why it matters

Important Issues (Unacceptable + Stable):
- [Dimension]: Current status, why it matters

For each critical issue, suggest:
1. Root cause hypothesis
2. Specific, measurable action to improve
3. Success metric (how to know it's working)

Format: Markdown with clear sections for each action."
```

**Example Output**:
```
## Action Plan: Q3 Team Performance

### 🔴 CRITICAL: Delivery Speed
**Current State**: 40% on-time delivery (target: 80%), declining from 20% miss rate last quarter

**Root Cause Hypothesis**: Scope creep in sprint planning or team context-switching due to
production issues

**Action**:
1. Audit last 3 sprints: What % of committed work completed? What blocked completion?
2. Implement "no meetings" block (2 hours/day) for focused work
3. Hold daily standup with focus on blockers (5 min only)

**Success Metric**: Hit 70% on-time delivery next sprint, 80% within 3 sprints

### 🟠 IMPORTANT: Documentation
**Current State**: New engineers report hard time understanding architecture

**Root Cause**: No single source of truth, system knowledge in people's heads

**Action**:
1. Assign documentation owner (2 hours/week allocation)
2. Create architecture decision record (ADR) template
3. Require one ADR per major decision for next month

**Success Metric**: New engineer onboarding time drops from 3 weeks to 2 weeks
```

### Type 1: Decision-Focused Context

**Prompt to Gemini**:
```
Decision Model: [Topic]
Decision Result: [YES/NO]
Factors & Dominance: [Ranked list with dominance scores]

Decision Outcome: [Decision + reason]

Provide context for next steps:
1. If YES: What needs to be done to execute this decision?
2. If NO: What would need to change to make this decision YES?
3. Key risks or dependencies to monitor

Keep it brief (2-3 sentences per section)."
```

**Example Output**:
```
## Decision Outcome: YES - Hire Candidate

Decision Made: All factors acceptable. Proceed with offer.

Next Steps:
- Prepare offer package (include mentorship plan)
- Schedule onboarding (4 weeks, pair with senior engineer)
- Brief team on start date and role expectations

Key Risks:
- New hire may take longer to ramp than expected (mitigate with mentorship)
- Team capacity to onboard in parallel with delivery (plan sprint accordingly)
```

---

## Conversational Analysis (Chat Interface)

### Creative Intent

Users can ask follow-up questions in natural language to deepen their understanding of the model and its implications.

**Examples of User Questions**:
```
Type 1 (Decision):
- "What if we could improve communication skills in candidate A?"
- "How does this compare to our last hiring decision?"
- "What if we lowered salary requirements?"

Type 2 (Performance):
- "What's the average performance on delivery speed in similar teams?"
- "If we keep declining at this rate, when would this be critical?"
- "Which dimension should we improve first?"
```

### Chat Session Structure

**Initialization** (when user opens ConversationalAnalyst):
- System creates Gemini chat session
- System provides model context to AI (topic, elements, evaluation results)
- Each message includes full context (stateless conversation)

**Message Format**:
```
User Input: "What if we changed our expectations for this factor?"

System Context Added:
{
  modelTopic: "Senior Engineer Hiring",
  modelType: "Decision",
  elements: [
    { name: "Technical Skills", dominance: 0.75, evaluation: true },
    { name: "Cultural Fit", dominance: 0.70, evaluation: true },
    { name: "Salary", dominance: 0.40, evaluation: false } ← Blocked decision
  ],
  decision: "NO",
  conversationHistory: [...]
}

Prompt to Gemini:
"Model Context: [Above]

User Question: [User Input]

Respond conversationally, staying focused on this specific model and decision.
Keep response to 2-3 sentences."
```

**Response Display**:
```
Chat Panel:

You: "What if we raised our salary offer to match candidate expectations?"