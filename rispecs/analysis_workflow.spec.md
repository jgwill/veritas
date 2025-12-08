# Analysis & Evaluation Workflow - Specification

🧠: **Desired Outcome Definition**

Users systematically evaluate their decision or performance model against real-world reality—answering structured questions that transform subjective judgment into auditable evaluation, leading to clear outcomes and actionable insights.

---

## Creative Intent

The Analyzing mode enables users to apply their model to specific situations or time periods, creating an evaluation record that shows:
- What was acceptable and what wasn't
- How the thinking process unfolded
- What decision emerged from the facts

**Structural Tension**: Real-world situation + unclear evaluation criteria → Subjective judgment → Cannot defend outcome

Resolution: Model provides criteria → Structured evaluation → Clear outcome → Defensible decision

---

## Analyzing Mode: Workflow Overview

### Entry Point

User can enter Analyzing mode:
1. From ModelingView: Click "Analyze This Model" button
2. From Header: Mode switcher set to "Analyzing"
3. From StructuringView (after evaluation): Switch back to refine evaluation

### Initialization

When entering Analyzing mode, system:
- Resets all evaluation state:
  - Type 1: All TwoFlagAnswered = false
  - Type 2: All TwoFlagAnswered = false, ThreeFlagAnswered = false
- Preserves model structure (elements, descriptions, dominance)
- Clears previous evaluation (fresh session)

**Reasoning**: Each evaluation is independent. New analysis should start fresh.

---

## Type 1: Decision Evaluation Workflow

### Step 1: Present Element for Evaluation

**Interface**:
```
┌─────────────────────────────────────┐
│ Evaluate: [Factor Name]             │
├─────────────────────────────────────┤
│                                     │
│ [Factor Description]                │
│ Dominance Score: 0.75 (important)  │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Is this factor acceptable?      │ │
│ │                                 │ │
│ │ ☑ YES - Acceptable              │ │
│ │ ☐ NO - Unacceptable             │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [← Previous] [Next →]               │
└─────────────────────────────────────┘
```

### Step 2: Evaluation Question

**Question**: "Is [Factor Name] acceptable in this situation?"

User chooses:
- **YES** (TwoFlag = true): Factor meets acceptable threshold
- **NO** (TwoFlag = false): Factor is unacceptable, blocks decision

**Guidance Text** (below question):
```
Consider: [Factor Description]

Think about whether this situation meets or exceeds what's needed for a
successful outcome. If this factor is unacceptable, the decision will be NO.
```

### Step 3: Evaluate All Factors

System presents factors one at a time:
- Factors sorted by DominanceFactor (most important first)
- User evaluates each in sequence
- After each evaluation, system marks TwoFlagAnswered = true and auto-saves

**Navigation**:
- Click factor name to jump to specific factor
- Previous/Next buttons to traverse
- Visual progress indicator: "3 of 7 factors evaluated"

### Step 4: Decision Logic Runs

When all factors evaluated (all TwoFlagAnswered = true):
- System checks: Are any TwoFlag = false?
- If YES (unacceptable found):
  - Model.Decision = NO
  - Model.DecisionReason = Unacceptable factor name
  - Highlight unacceptable factor in red
- If NO (all acceptable):
  - Model.Decision = YES
  - Model.DecisionReason = "All mandatory factors acceptable"
  - Display success state

### Step 5: Display Decision

**Decision Banner**:
```
If YES:
┌─────────────────────────────────────────────┐
│ ✅ DECISION: YES                            │
├─────────────────────────────────────────────┤
│ All mandatory factors are acceptable.       │
│                                             │
│ ✅ Technical Skills: Acceptable             │
│ ✅ Cultural Fit: Acceptable                 │
│ ✅ Leadership: Acceptable                   │
│ ✅ Salary Fit: Acceptable                   │
│                                             │
│ [View Results] [AI Analysis] [Export]       │
└─────────────────────────────────────────────┘

If NO:
┌─────────────────────────────────────────────┐
│ ❌ DECISION: NO                             │
├─────────────────────────────────────────────┤
│ Reason: Salary Requirement unacceptable     │
│ (Exceeds available budget)                  │
│                                             │
│ ✅ Technical Skills: Acceptable             │
│ ✅ Cultural Fit: Acceptable                 │
│ ✅ Leadership: Acceptable                   │
│ ❌ Salary Requirement: Unacceptable ← Blocker
│                                             │
│ [View Results] [Revise Evaluation] [Export] │
└─────────────────────────────────────────────┘
```

### Step 6: Decision Reflection

After decision, user can:
- **View Results**: Switch to StructuringView to visualize outcome
- **Revise Evaluation**: Go back, change answers, see decision update
- **AI Analysis**: Get summary of why decision came out this way
- **Export Decision**: Save evaluation as JSON for documentation
- **Iterate Model**: Go back to Modeling, refine factors, re-evaluate

---

## Type 2: Performance Evaluation Workflow

### Step 1: Present Dimension for Evaluation

**Interface**:
```
┌──────────────────────────────────────┐
│ Evaluate: [Dimension Name]           │
├──────────────────────────────────────┤
│                                      │
│ What acceptable looks like:          │
│ [Dimension Description]              │
│                                      │
│ ┌────────────────────────────────┐   │
│ │ Current State:                 │   │
│ │ ☑ Acceptable    ☐ Unacceptable │   │
│ └────────────────────────────────┘   │
│                                      │
│ ┌────────────────────────────────┐   │
│ │ Trending Direction:            │   │
│ │ ☑ Improving  ☐ Stable  ☐ Down │   │
│ └────────────────────────────────┘   │
│                                      │
│ [← Previous] [Next →]                │
└──────────────────────────────────────┘
```

### Step 2: State Evaluation

**Question 1**: "Is this dimension currently acceptable?"

User chooses:
- **YES**: Meets acceptable threshold
- **NO**: Unacceptable, needs improvement

**Guidance**:
```
Consider what "acceptable" means:
[Dimension Description]

Is the current reality meeting this standard?
```

### Step 3: Trend Evaluation

**Question 2**: "How is this dimension trending?"

User chooses:
- **⬆️ Improving**: Getting better over time
- **➡️ Stable**: Staying about the same
- **⬇️ Declining**: Getting worse over time

**Guidance**:
```
Compare current state to:
- Last evaluation period
- Historical trend over 3+ months
- Direction of change

Is this improving, stable, or declining?
```

### Step 4: Evaluate All Dimensions

System presents dimensions in logical order:
- User evaluates state + trend for each
- After each dimension, TwoFlagAnswered + ThreeFlagAnswered = true
- Auto-save after each evaluation

**Progress Indicator**: "4 of 6 dimensions evaluated"

### Step 5: Calculate Priorities

When all dimensions evaluated:
- System runs priority algorithm
- Sorts dimensions by urgency:
  1. Unacceptable + Declining = CRITICAL
  2. Unacceptable + Stable = IMPORTANT
  3. Unacceptable + Improving = WATCH
  4. Acceptable + Declining = PREVENT
  5. Acceptable + Stable = MAINTAIN
  6. Acceptable + Improving = SUCCESS

### Step 6: Display Performance Summary

**Performance Dashboard**:
```
┌────────────────────────────────────┐
│ Performance Evaluation Complete    │
├────────────────────────────────────┤
│                                    │
│ 🔴 CRITICAL (Act Now)              │
│  • Delivery Speed: Unacceptable ⬇️ │
│                                    │
│ 🟠 IMPORTANT (Improve)             │
│  • Documentation: Unacceptable ➡️  │
│                                    │
│ 🟡 PREVENT REGRESSION              │
│  • Code Quality: Acceptable ⬇️     │
│                                    │
│ 🟢 MAINTAIN                        │
│  • Testing: Acceptable ➡️          │
│                                    │
│ 🟢 SUCCESS                         │
│  • Team Morale: Acceptable ⬆️      │
│                                    │
│ [View Details] [AI Actions] [Export]
└────────────────────────────────────┘
```

### Step 7: Performance Reflection

User can:
- **View Details**: See each dimension with state + trend
- **AI Actions**: Get suggestions for addressing critical areas
- **Compare to Previous**: See improvement/regression vs. last evaluation
- **Export Results**: Save evaluation for record-keeping
- **Iterate Model**: Refine descriptions, re-evaluate if needed

---

## Shared Evaluation Features

### Auto-Save on Each Answer

- System saves immediately after user selects YES/NO (or trend)
- No "Save" button needed
- User can close browser, return, continue where they left off

### Visual Feedback

**As user evaluates**:
- Current selection highlighted in green
- Unselected options in gray
- Visual progress bar showing % complete

**After evaluation**:
- ✓ checkmarks show evaluated factors
- Red highlighting for unacceptable factors
- Green highlighting for acceptable factors

### Revision Capability

User can return to Analyzing any time:
- Change any evaluation answer
- Decision/priorities recalculate immediately
- No penalty for revision—encourages reflection

### Element Card View

**In AnalyzingView**, elements shown as cards:
```
┌──────────────────────────┐
│ Technical Skills        │
├──────────────────────────┤
│ Status: ☑ Acceptable    │
│ Dominance: 0.75         │
│                          │
│ [Evaluate] [Edit]       │
└──────────────────────────┘
```

Each card:
- Shows element name
- Shows current evaluation state
- Links to modal for evaluation
- Shows dominance (Type 1 only)

### Keyboard Navigation

Users can evaluate without mouse:
- Tab: Move through evaluations
- Space/Enter: Select option
- Arrow keys: Navigate evaluation options

---

## Evaluation Context & History

### Timestamp Tracking

Each evaluation records:
- Evaluation start time
- Time for each element (how long deliberation)
- Evaluation complete time
- User notes (optional)

### Saved Evaluation State

When evaluation is complete:
- Create history entry in model
- Store: All TwoFlag/ThreeFlag values + timestamps
- Store: Decision outcome (Type 1) or priority list (Type 2)
- Store: Optional user reflection/notes

### Comparison Between Evaluations

User can compare current evaluation to previous:
- "Last time we evaluated this, salary was unacceptable. This time it's acceptable."
- Show delta: What changed? Why?
- Track patterns: Do we consistently struggle with same factors?

---

## Evaluation Scenarios

### Scenario 1: Hiring Decision (Type 1)

```
Model: "Hire Senior Engineer"
Factors: Technical Skills, Cultural Fit, Leadership, Salary, Growth Potential

Evaluation Session:
1. Technical Skills: YES (strong performance in assessment)
2. Cultural Fit: YES (values align, team likes them)
3. Leadership: NO (not yet at that level, but junior)
4. Salary: NO (wants $X, budget is $Y-20k)
5. Growth Potential: YES (trainable, eager to learn)

Decision Algorithm:
- Factor 3 (Leadership): NO → Decision blocks here
- Even though we skip factors 4, 5...
- Or: Both 3 + 4 are blockers

Model.Decision = NO
Model.Reason = "Leadership unacceptable for this role level"

User Insight: "We need a mid-level engineer who's ready to lead. This candidate
is junior. What if we created a different model for junior hires?"
```

### Scenario 2: Quarterly Performance Review (Type 2)

```
Model: "Q3 Engineering Team Performance"
Dimensions: Code Quality, Delivery Speed, Documentation, Testing, Morale, Mentorship

Evaluation Session:
1. Code Quality: State = YES, Trend = ⬇️ (down from 98% to 95%)
2. Delivery Speed: State = NO, Trend = ⬇️ (miss rate 40%, up from 20%)
3. Documentation: State = NO, Trend = ➡️ (still hard for new engineers)
4. Testing: State = YES, Trend = ➡️ (stable at 85%)
5. Morale: State = YES, Trend = ⬆️ (mentorship program working)
6. Mentorship: State = YES, Trend = ⬆️ (new program is successful)

Priority Calculation:
- 🔴 Delivery Speed: Unacceptable + Declining = CRITICAL
- 🟠 Documentation: Unacceptable + Stable = IMPORTANT
- 🟡 Code Quality: Acceptable + Declining = PREVENT
- 🟢 Testing: Acceptable + Stable = MAINTAIN
- 🟢 Morale: Acceptable + Improving = SUCCESS
- 🟢 Mentorship: Acceptable + Improving = SUCCESS

Action Focus:
1. Fix delivery speed (most urgent)
2. Improve documentation (important but less urgent)
3. Prevent code quality regression (watch)
4. Recognize morale/mentorship wins
```

---

## Integration with Other Workflows

### Transition to Structuring

After evaluation complete:
- User clicks "View Results" or "Switch to Structuring Mode"
- System transitions to StructuringView
- Visualization shows outcome (decision or performance dashboard)

### Transition to Modeling

User can return to refine model:
- Click "Revise Model" from any view
- System returns to ModelingView
- Evaluation state preserved (can return to Analyzing after refinement)

### History & Versioning

Each complete evaluation creates a version entry:
- Stored in model history
- Contains: All evaluation states, decision/priorities, timestamp
- User can view/compare/revert

---

## Evaluation Best Practices

### For Decision Models (Type 1)

1. **Start with context**: Remind yourself what the decision is about
2. **Evaluate honestly**: Answer based on actual reality, not hopes
3. **Consider deal-breakers**: Are there factors that would block any decision?
4. **Document reasoning**: Add notes about why factor is acceptable/not
5. **Accept the outcome**: Trust the model's logic, even if surprising

### For Performance Models (Type 2)

1. **Use baseline**: Define what "acceptable" meant in Modeling phase
2. **Assess state first**: Is current reality meeting standard?
3. **Then assess trend**: Is it moving in right direction?
4. **Be consistent**: Use same criteria as previous evaluation
5. **Focus on top priorities**: Act on critical items first

---

## Technical Notes

### State Machine: Evaluation Flow

```
State: NOT_EVALUATED
  ↓ User enters Analyzing
State: IN_EVALUATION
  ├─ User evaluates each element
  ├─ TwoFlagAnswered toggled true
  ├─ (Type 2 also: ThreeFlagAnswered toggled true)
  ↓
State: EVALUATION_COMPLETE
  ├─ All flags answered
  ├─ Decision algorithm runs (Type 1)
  ├─ Priority algorithm runs (Type 2)
  ↓
State: DECISION_RENDERED (Type 1)
  └─ Decision = YES/NO

State: PRIORITIES_RENDERED (Type 2)
  └─ Dimensions sorted by priority
```

### Auto-Save Mechanism

```typescript
function saveEvaluationState() {
  const evaluationEntry = {
    timestamp: Date.now(),
    elementEvaluations: elements.map(e => ({
      id: e.id,
      twoFlag: e.twoFlag,
      threeFlag: e.threeFlag
    })),
    decision: model.decision,
    decisionReason: model.decisionReason
  }
  model.history.push(evaluationEntry)
  persistModel()
}
```

---

## Specification Completeness Check

Implementation is complete when:

1. ✅ Type 1: Each element evaluated for acceptable/unacceptable (TwoFlag)
2. ✅ Type 2: Each dimension evaluated for state + trend
3. ✅ Decision algorithm runs correctly (all mandatory)
4. ✅ Priority algorithm calculates correct sort order (state × trend)
5. ✅ Evaluation auto-saves after each answer
6. ✅ User can navigate back/forth through evaluations
7. ✅ Visual feedback shows progress and current state
8. ✅ Can revise evaluations, decision/priorities recalculate immediately
9. ✅ History tracks all evaluation states with timestamps
10. ✅ Seamless transition to Structuring mode after complete

---

**Specification Status**: ✅ Complete and autonomous
**RISE Phase**: Phase 2 (Intent Refinement)
**Complexity**: Medium (requires understanding decision algorithm, priority calculation, evaluation state machine)
**Dependencies**: Requires understanding `decision_making_model.spec.md` and `performance_review_model.spec.md`
