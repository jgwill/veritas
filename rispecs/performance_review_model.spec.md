# Performance Review Model (Type 2) - Specification

🧠: **Desired Outcome Definition**

Users systematically evaluate performance across multiple dimensions and identify improvement priorities—revealing what's working, what needs immediate attention, and what's trending in the wrong direction, enabling focused action rather than scattered feedback.

---

## Creative Intent

Type 2 models enable performance management by making two critical transformations:

**From**: Subjective feedback → Unclear priorities → Scattered improvement efforts
**To**: Systematic evaluation → Clear priorities → Focused action

**Structural Tension**: Performance scattered across many dimensions → Cannot prioritize → Team lacks focus

Resolution: Model makes state (acceptable/unacceptable) + trend (improving/stable/declining) explicit → Priorities emerge automatically → Team focuses action where it matters most

---

## Model Architecture

### Type 2 Configuration
\`\`\`
DigitalModel {
  ModelType: 2  // Identifies this as performance review
  Elements: DigitalElement[]  // Performance dimensions
  Valid: boolean  // Is model ready for evaluation
  Decided: boolean  // Has evaluation been performed
}
\`\`\`

### Type 2 DigitalElement Structure
\`\`\`
DigitalElement {
  // Identity
  Idug: string  // Unique element ID
  DisplayName: string  // Performance dimension (e.g., "Code Quality", "Delivery Speed")
  Description: string | null  // What acceptable looks like for this dimension

  // Evaluation State: State (Acceptable/Unacceptable)
  TwoFlag: boolean  // Current state: Is this dimension acceptable? (YES/NO)
  TwoFlagAnswered: boolean  // Has user evaluated state?

  // Evaluation State: Trend (Getting Better/Stable/Getting Worse)
  ThreeFlag: -1 | 0 | 1  // Trend: -1 (declining), 0 (stable), +1 (improving)
  ThreeFlagAnswered: boolean  // Has user evaluated trend?

  // Analysis Metadata
  evaluation?: 'accepted' | 'rejected' | 'neutral'  // Rendering state

  // Note: Type 2 does NOT use ComparationTableData or DominanceFactor
  // All dimensions are evaluated independently

  // Metadata
  SortNo: number  // Display ordering
  Status: number  // Custom status code
  Meta: any  // Extensible metadata
}
\`\`\`

### Key Difference from Type 1

Type 2 models **do not use pairwise comparison**. Each performance dimension is evaluated independently:
- **State**: Is it acceptable right now?
- **Trend**: Is it improving, stable, or declining?

This reflects how performance management works: Each dimension matters in its own context, not as a comparison against other dimensions.

---

## Evaluation Framework: State + Trend

### State Evaluation (TwoFlag)

**Question**: "Is [Performance Dimension] at an acceptable level right now?"

**Valid Answers**:
- **YES** (TwoFlag = true): Dimension meets acceptable threshold
- **NO** (TwoFlag = false): Dimension is unacceptable, needs attention

**Example States**:
\`\`\`
Code Quality: YES (code passes review standards, bugs low)
Delivery Speed: NO (consistently missing sprint deadlines)
Team Morale: YES (low turnover, positive feedback)
Documentation: NO (hard to understand how systems work)
\`\`\`

### Trend Evaluation (ThreeFlag)

**Question**: "Is [Performance Dimension] trending positively, staying stable, or declining?"

**Valid Answers**:
- **+1** (improving): Getting better over time
- **0** (stable): Staying about the same
- **-1** (declining): Getting worse over time

**How Trending is Determined**:
- Compare current state to previous evaluation period
- Look at trajectory: Is the metric moving up, flat, or down?
- Consider velocity: Is it improving/declining rapidly or slowly?

**Example Trends**:
\`\`\`
Code Quality: -1 (declining - bug reports up 40% vs. last quarter)
Delivery Speed: -1 (declining - cycle time increased from 5 to 8 days)
Team Morale: +1 (improving - new mentorship program showing results)
Documentation: 0 (stable - hasn't improved but not getting worse)
\`\`\`

---

## Action Priority Matrix

### Automatic Priority Ranking

Combining state × trend reveals action priorities:

| State | Trend | Priority | Action Type |
|-------|-------|----------|------------|
| ❌ Unacceptable | ⬇️ Declining | 🔴 **Critical** | Fix immediately (urgent + worsening) |
| ❌ Unacceptable | ➡️ Stable | 🟠 **Important** | Improve (unacceptable, not changing) |
| ❌ Unacceptable | ⬆️ Improving | 🟡 **Watch** | Support momentum (unacceptable but heading right direction) |
| ✅ Acceptable | ⬇️ Declining | 🟡 **Prevent Regression** | Stop decline (acceptable but trending wrong) |
| ✅ Acceptable | ➡️ Stable | 🟢 **Maintain** | Keep doing what works |
| ✅ Acceptable | ⬆️ Improving | 🟢 **Success** | Recognize/expand (good and getting better) |

### Natural Progression of Action

This ranking naturally emerges from the data:

1. **Unacceptable + Declining** = Urgent (both dimensions bad)
2. **Unacceptable + Stable** = Important (bad but not worsening)
3. **Acceptable + Declining** = Prevent Regression (good but at risk)
4. **Acceptable + Stable** = Maintain (working fine)
5. **Acceptable + Improving** = Success (working and improving)

**Example Team Performance Review**:
\`\`\`
Dimension Evaluation Results:

Code Quality: Acceptable, Declining
├─ Status: ✅ YES (passes code review 95% of time)
├─ Trend: ⬇️ -1 (down from 98% last quarter)
├─ Priority: Prevent Regression (watch carefully)
└─ Action: "Identify what changed. Has review process weakened?"

Delivery Speed: Unacceptable, Declining
├─ Status: ❌ NO (missing 40% of sprint targets)
├─ Trend: ⬇️ -1 (was 20% miss rate last quarter)
├─ Priority: 🔴 CRITICAL (most urgent)
└─ Action: "Diagnose why speed is dropping. What blocked velocity?"

Documentation: Unacceptable, Stable
├─ Status: ❌ NO (new engineers struggle to understand systems)
├─ Trend: ➡️ 0 (same complaints as last quarter)
├─ Priority: 🟠 IMPORTANT (needs improvement)
└─ Action: "Assign ownership. Create documentation standard."

Team Morale: Acceptable, Improving
├─ Status: ✅ YES (engagement score 7.5/10)
├─ Trend: ⬆️ +1 (up from 6.0 last quarter after mentorship program)
├─ Priority: 🟢 SUCCESS (recognize & expand)
└─ Action: "Continue mentorship program. Consider scaling to other teams."

Deployment Frequency: Acceptable, Stable
├─ Status: ✅ YES (deploying weekly)
├─ Trend: ➡️ 0 (same cadence for 3 quarters)
├─ Priority: 🟢 MAINTAIN (keep current approach)
└─ Action: "No changes needed. Team is steady."
\`\`\`

---

## Model Lifecycle in Type 2

### Creation Phase

**Manual Creation**:
1. User provides: Model name, topic (e.g., "Q3 Team Performance Review")
2. User adds dimensions: Each aspect of performance to evaluate
3. For each dimension: User adds description of what "acceptable" means
4. System initializes: All evaluation flags to false

**AI-Generated Creation**:
1. User provides: Description of what to evaluate (e.g., "Software engineering team quarterly review")
2. AI suggests dimensions based on context (e.g., Code Quality, Speed, Documentation, Morale, Testing)
3. AI suggests descriptions for each dimension
4. User reviews, keeps/removes/edits suggestions
5. Same initialization as manual

### Modeling Phase

User refines descriptions:
- What does "acceptable" mean for Code Quality?
- What does "acceptable" mean for Delivery Speed?
- Clear descriptions enable consistent evaluation

No comparisons needed (unlike Type 1).

### Validation

Model.Valid = true when:
- At least 2 dimensions exist
- Each dimension has DisplayName set
- Model is ready for evaluation (No completion of comparisons required)

### Analyzing Phase

User switches to Analyzing Mode:
- System shows each dimension
- User evaluates state: "Is this acceptable right now?"
- User evaluates trend: "Is it improving, stable, or declining?"
- After all evaluations: Priorities calculated automatically
- Model.Decided = true

### Structuring Phase (Visualization)

User sees:
- Dashboard showing state × trend matrix
- Automatic prioritization by urgency
- AI-generated action suggestions for critical dimensions
- Trend indicators showing which areas need attention

---

## Performance Review Interface & Interaction

### Analyzing Mode View

**Format per dimension**:
\`\`\`
┌─────────────────────────────────────────┐
│ Code Quality                            │
│ What acceptable looks like: Passes code │
│ review 95% of time, <2% production bugs │
│                                         │
│ State: ✓ Acceptable ○ Unacceptable     │
│                                         │
│ Trend: ⬆️ Improving ➡️ Stable ⬇️ Declining
└─────────────────────────────────────────┘
\`\`\`

User selects:
1. State (acceptable/unacceptable)
2. Trend (improving/stable/declining)

### Structuring Mode View

**Performance Dashboard**:
\`\`\`
┌────────────────────────────────────────────────────┐
│         Q3 Team Performance Review                 │
├────────────────────────────────────────────────────┤
│                                                    │
│ 🔴 CRITICAL (Unacceptable + Declining)             │
│  • Delivery Speed: Down from 80% to 40% on-time   │
│                                                    │
│ 🟠 IMPORTANT (Unacceptable + Stable)               │
│  • Documentation: Still hard for new engineers    │
│                                                    │
│ 🟡 PREVENT REGRESSION (Acceptable + Declining)    │
│  • Code Quality: Dropped from 98% to 95% review   │
│                                                    │
│ 🟢 MAINTAIN (Acceptable + Stable)                 │
│  • Testing: Consistent 85% coverage               │
│                                                    │
│ 🟢 SUCCESS (Acceptable + Improving)               │
│  • Team Morale: Up 25% since mentorship started  │
│                                                    │
└────────────────────────────────────────────────────┘
\`\`\`

---

## Creative Advancement Scenario: Q3 Team Performance Review

**User Intent**: Understand team performance holistically, identify what needs immediate attention vs. what's working

**Current Structural Reality**: Manager receives scattered feedback (some about slow delivery, some about morale improvements, some about documentation issues); doesn't know where to focus improvement effort

**Natural Progression Steps**:

1. User creates model: "Q3 Team Performance Review"
2. User defines dimensions: Code Quality, Delivery Speed, Documentation, Team Morale, Testing, Deployment Frequency
3. For each dimension, user writes what "acceptable" means (sets clear standards)
4. User evaluates state: Which dimensions meet standard right now?
   - Code Quality: ✅ YES (95% review pass rate)
   - Delivery Speed: ❌ NO (missing 40% of targets, slipped from 80%)
   - Documentation: ❌ NO (new engineers still struggling)
   - Team Morale: ✅ YES (positive feedback, mentorship program working)
   - Testing: ✅ YES (85% coverage maintained)
   - Deployment Frequency: ✅ YES (weekly cadence)

5. User evaluates trends: How are things moving?
   - Code Quality: ⬇️ Declining (dropping from 98% last quarter)
   - Delivery Speed: ⬇️ Declining (got worse, not better)
   - Documentation: ➡️ Stable (still bad, not improving)
   - Team Morale: ⬆️ Improving (mentorship program working)
   - Testing: ➡️ Stable (consistently good)
   - Deployment Frequency: ➡️ Stable (steady weekly release)

6. Model calculates priorities automatically:
   - 🔴 CRITICAL: Delivery Speed (unacceptable + declining = urgent)
   - 🟠 IMPORTANT: Documentation (unacceptable + stable = fix needed)
   - 🟡 PREVENT: Code Quality (acceptable but declining = watch)
   - 🟢 SUCCESS: Team Morale (acceptable + improving = recognize)
   - 🟢 MAINTAIN: Testing, Deployment (working fine)

7. Insight emerges: Focus on speed + documentation (urgent), protect code quality momentum, celebrate morale wins

8. Next steps: Create action plan for delivery speed (why did it drop?) and documentation (assign ownership)

**Achieved Outcome**: Clear performance picture + prioritized action areas + recognition of what's working well

**Supporting Features**:
- Performance dashboard showed priorities visually (no guessing what matters)
- Trend tracking prevented missing regression in code quality
- AI action suggestions (if enabled) provided specific recommendations
- Model can be saved and compared to previous quarters to see improvement trajectory

---

## Type-Specific Analysis Views

### In ModelingView
- List all dimensions with descriptions
- Show: [Dimension Name] | [What Acceptable Means] | [Edit]
- Add/Remove dimensions as needed
- No comparisons required (unlike Type 1)

### In AnalyzingView
- List all dimensions in evaluation order
- For each: State selector (Acceptable/Unacceptable) + Trend selector (Improving/Stable/Declining)
- Visual: Show evaluation progress (X of Y dimensions evaluated)
- After evaluation: Show prioritized action list

### In StructuringView
- Performance Matrix: Show all dimensions mapped by state × trend
- Color-coded: Red (critical), Orange (important), Yellow (watch), Green (good)
- AI-generated actions: "Focus on Delivery Speed immediately—it's unacceptable and declining"
- Trend indicators: Visual showing which metrics are moving in right direction

---

## Edge Cases & Handling

### Incomplete Evaluation
**Scenario**: User evaluates state but not trend for some dimensions
**Handling**: System treats unanswered trend as unknown (doesn't render priority)
**UX**: Warning: "Complete trend evaluation for all dimensions to see full priority picture"

### Changing Descriptions Mid-Evaluation
**Scenario**: User edits what "acceptable" means for Code Quality while in Analyzing mode
**Handling**: Allowed—reflection is learning. No reset needed (unlike Type 1).
**UX**: System auto-saves on each description change

### Comparing to Previous Review
**Scenario**: User loads Q3 review, realizes they want to compare to Q2 results
**Handling**: Export Q3, then create new Q4 model. System can show side-by-side comparison in structuring view
**UX**: Optional comparison feature shows delta (improved/declined by X%)

### Trend Without Prior State
**Scenario**: User is evaluating first-time; how can they assess trend without prior period?
**Handling**: Allow "Stable" as default for first evaluation. Trend matters more on repeat evaluations.
**UX**: Hint: "On first evaluation, mark as Stable unless you have prior data"

---

## Distinction from Type 1

| Aspect | Type 1 (Decision) | Type 2 (Performance) |
|--------|-------------------|---------------------|
| **Purpose** | Make YES/NO decision | Evaluate performance, prioritize improvements |
| **Comparison** | All factors compared pairwise | Each dimension independent |
| **Mandatory Logic** | One unacceptable factor = NO | State + trend create priorities |
| **Output** | Binary decision + reason | Performance matrix + action priorities |
| **Reversibility** | Can re-evaluate if circumstances change | Can re-evaluate periodically (quarterly, annually) |
| **Time Sensitivity** | Made once, in context | Repeated evaluation shows improvement over time |

---

## Technical Implementation Notes

### State + Trend Storage
\`\`\`typescript
element.TwoFlag: boolean  // State (acceptable = true, unacceptable = false)
element.ThreeFlag: -1 | 0 | 1  // Trend (declining = -1, stable = 0, improving = +1)
\`\`\`

### Priority Calculation
\`\`\`typescript
function getPriority(state: boolean, trend: -1 | 0 | 1): string {
  if (!state && trend === -1) return 'CRITICAL'    // Unacceptable + Declining
  if (!state && trend === 0) return 'IMPORTANT'    // Unacceptable + Stable
  if (!state && trend === 1) return 'WATCH'        // Unacceptable + Improving
  if (state && trend === -1) return 'PREVENT'      // Acceptable + Declining
  if (state && trend === 0) return 'MAINTAIN'      // Acceptable + Stable
  if (state && trend === 1) return 'SUCCESS'       // Acceptable + Improving
}
\`\`\`

### Dashboard Sorting
\`\`\`typescript
// Sort dimensions by priority for display
const priorityOrder = ['CRITICAL', 'IMPORTANT', 'WATCH', 'PREVENT', 'MAINTAIN', 'SUCCESS']
dimensions.sort((a, b) =>
  priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority)
)
\`\`\`

### Trend Indicator Display
\`\`\`typescript
// Visual representation of trend
const trendIcon = {
  '-1': '⬇️ Declining',
  '0': '➡️ Stable',
  '1': '⬆️ Improving'
}
\`\`\`

---

## Specification Completeness Check

An implementation is complete when:

1. ✅ Type 2 models can be created manually or from AI description
2. ✅ Each dimension evaluated independently (no pairwise comparison)
3. ✅ State evaluation (TwoFlag): Acceptable/Unacceptable
4. ✅ Trend evaluation (ThreeFlag): Improving/Stable/Declining
5. ✅ Priorities calculated from state × trend combination
6. ✅ Dashboard displays dimensions sorted by priority
7. ✅ Color coding shows urgency (red/orange/yellow/green)
8. ✅ Model persists across sessions
9. ✅ History tracks state + trend changes between evaluations
10. ✅ Comparison to previous period available (shows delta)

---

**Specification Status**: ✅ Complete and autonomous
**RISE Phase**: Phase 2 (Intent Refinement)
**Complexity**: Medium (requires understanding state × trend logic, priority calculation, performance dashboard visualization)
**Dependencies**: Requires reading `model_persistence.spec.md` for storage understanding
