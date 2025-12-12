# Decision Making Model (Type 1) - Specification

🧠: **Desired Outcome Definition**

Users make binary YES/NO decisions that are auditable, defensible, and traceable—where they can point to specific mandatory factors that drove the outcome, and revisit their decision logic when circumstances change.

---

## Creative Intent

Type 1 models enable structured decision-making by making two critical transformations:

**From**: Intuitive judgment → Unclear which factors mattered most
**To**: Explicit factor comparison → Clear dominance hierarchy that reveals actual priorities

**Structural Tension**: Unclear decision criteria → Cannot defend decision → Team loses confidence in decision-maker

Resolution: Model makes criteria explicit → Decision becomes defensible → Team gains confidence

---

## Model Architecture

### Type 1 Configuration
\`\`\`
DigitalModel {
  ModelType: 1  // Identifies this as decision-making
  Elements: DigitalElement[]  // Decision factors
  Valid: boolean  // Is model complete/ready for evaluation
  Decided: boolean  // Has evaluation been performed
  Decision: boolean  // Final YES/NO outcome
}
\`\`\`

### Type 1 DigitalElement Structure
\`\`\`
DigitalElement {
  // Identity
  Idug: string  // Unique element ID
  DisplayName: string  // Factor name (e.g., "Cultural Fit", "Technical Skills")
  Description: string | null  // Why this factor matters

  // Evaluation State
  TwoFlag: boolean  // User evaluation: Is this factor acceptable? (YES/NO)
  TwoFlagAnswered: boolean  // Has user evaluated this factor?
  evaluation?: 'accepted' | 'rejected' | 'neutral'  // Rendering state

  // Comparative Position (Dominance)
  ComparationTableData: { [elementId]: -1 | 0 | 1 }
  // Key insight: Stores pairwise comparisons with every other element
  // -1: This element loses to other element
  //  0: This element equals other element
  //  1: This element beats other element

  DominanceFactor: number  // Calculated score: (wins - losses) / total_comparisons
  // Range: -1 (loses all) to +1 (wins all)
  // Higher dominance = more important factor in the decision

  // Metadata
  SortNo: number  // Display ordering
  Status: number  // Custom status code
  Meta: any  // Extensible metadata
}
\`\`\`

---

## Pairwise Comparison System

### Creative Intent

Pairwise comparison forces explicit prioritization without arbitrary weighting. Instead of asking "How important is factor A?" (subjective), the system asks "Does A matter more than B?" (comparative, concrete).

### How Dominance is Calculated

For a model with N elements, there are N×(N-1)/2 unique pairs.

Example with 4 factors (Salary, Culture, Growth, Location):
- Salary vs Culture
- Salary vs Growth
- Salary vs Location
- Culture vs Growth
- Culture vs Location
- Growth vs Location

For each pair comparison, user chooses:
- **+1**: This factor beats the other (is more important for decision)
- **0**: These factors are equivalent (equally important)
- **-1**: This factor loses to the other (is less important)

### Dominance Score Calculation

\`\`\`
DominanceFactor = (total_wins - total_losses) / total_comparisons

Example:
Salary comparison results: [+1, +1, -1, 0, +1, +1]  (against 6 other elements)
Wins: 4, Losses: 1, Ties: 1
DominanceFactor = (4 - 1) / 6 = 0.50  (middle-high importance)

Culture comparison results: [+1, +1, +1, +1, 0, +1]
Wins: 5, Losses: 0, Ties: 1
DominanceFactor = (5 - 0) / 6 = 0.83  (very important)
\`\`\`

### Natural Progression

This system naturally surfaces priorities without requiring users to assign arbitrary weights. The dominance distribution emerges from genuine comparative judgment.

---

## Decision Logic: From Evaluation to Outcome

### Evaluation Phase

User switches to **Analyzing Mode** and answers for each factor:
- **Question**: "Is [Factor Name] acceptable?"
- **Valid Answers**: YES (TwoFlag = true) or NO (TwoFlag = false)
- **User Action**: Reviews element description, marks acceptable/unacceptable

### Decision Algorithm

\`\`\`
Algorithm: Calculate Decision Outcome

INPUT: Model with all elements having TwoFlagAnswered = true
LOGIC:
  For each element in model (sorted by DominanceFactor descending):
    If element.TwoFlag === false:
      Model.Decision = NO
      Model.DecisionReason = "Unacceptable factor: [Element Name]"
      Return NO

  Model.Decision = YES
  Model.DecisionReason = "All mandatory factors acceptable"
  Return YES

OUTPUT: Model.Decision (boolean) + DecisionReason (string)
\`\`\`

### Key Insight: Mandatory Factors

This logic treats all factors as mandatory by default. A single unacceptable factor blocks the entire decision.

This reflects real-world constraints: If one critical factor fails, the decision fails.

**Example Decision Scenario**:
\`\`\`
Factors Evaluated:
✓ Technical Skills: YES (acceptable)
✓ Cultural Fit: YES (acceptable)
✓ Leadership Experience: YES (acceptable)
✗ Salary Requirement: NO (unacceptable - exceeds budget)

Model.Decision = NO
Reason: Unacceptable factor - Salary Requirement

Sorted by Dominance (if this was real):
1. Leadership Experience (0.75) - YES
2. Cultural Fit (0.70) - YES
3. Technical Skills (0.50) - YES
4. Salary (0.40) - NO ← Blocks decision

Decision Output: "Cannot proceed. Salary requirement exceeds available budget."
\`\`\`

---

## Comparison Modal & User Interaction

### Comparison Interface

During **Modeling Mode**, user opens comparison modal for each pair:

**Presentation**:
\`\`\`
[Factor A Name] vs [Factor B Name]

[Factor A Description]          [Factor B Description]

[< A Wins] [Equal] [B Wins >]

Current State: [Factor A]: 0.45  [Factor B]: 0.60
\`\`\`

### Comparison Storage

Comparisons are stored bidirectionally:

\`\`\`
Element_A.ComparationTableData[Element_B] = +1   (A wins)
Element_B.ComparationTableData[Element_A] = -1   (B loses)
\`\`\`

This ensures symmetry: If A beats B, then B loses to A.

### Comparison Table Data Structure

\`\`\`typescript
ComparationTableData: {
  "element_id_2": -1,   // Lost to element 2
  "element_id_3": 0,    // Tied with element 3
  "element_id_4": 1,    // Beat element 4
  "element_id_5": 1,    // Beat element 5
}
\`\`\`

---

## Model Lifecycle in Type 1

### Creation Phase

**Manual Creation**:
1. User provides: Model name, topic
2. User adds elements (factor names + descriptions)
3. System initializes: ComparationTableData for all pairs (all 0)
4. DominanceFactor defaults to 0 (no comparisons yet)

**AI-Generated Creation**:
1. User provides: Description of decision
2. AI suggests factors based on context
3. System creates elements with AI-suggested descriptions
4. User can add/remove/edit factors
5. Same initialization as manual

### Modeling Phase

User makes pairwise comparisons:
- Open modal for each pair
- Choose: A beats B, equal, or B beats A
- System updates ComparationTableData both directions
- DominanceFactor recalculated automatically
- Model auto-saved after each comparison

### Validation

Model.Valid = true only when:
- At least 2 elements exist
- Every pairwise comparison is answered (all entries != 0 or =)
- All elements have DisplayName set

### Analyzing Phase

User switches to Analyzing Mode:
- System resets all TwoFlagAnswered to false (fresh evaluation session)
- User evaluates each element: Is it acceptable?
- After all evaluations: Decision algorithm runs
- Model.Decided = true, Model.Decision shows result

### Structuring Phase (Visualization)

User sees:
- Dominance hierarchy chart (bar chart, sorted by DominanceFactor)
- Which factor blocked decision (if NO)
- Which factors were most decisive in outcome

---

## Natural Progression Pattern

\`\`\`
Create Model
  ↓ User names factors
  ↓
Make Comparisons
  ↓ User answers: "Does A beat B?"
  ↓ Dominance hierarchy emerges from comparisons
  ↓
Switch to Analyzing
  ↓ User evaluates: "Is this factor acceptable in real situation?"
  ↓
Decision Renders
  ↓ System shows YES/NO based on mandatory factor logic
  ↓
Insight Gained
  ↓ User sees which factor was deal-breaker OR all green lights
  ↓ User gains confidence in decision (or finds issue with model)
  ↓
Optional: Revise Model
  ↓ User realizes important factor was missing
  ↓ Go back to Modeling, add factor, redo comparisons
\`\`\`

---

## Type-Specific Analysis Views

### In ModelingView
- List all elements with their current DominanceFactor
- Show: [Element Name] | [Description] | [Dominance: 0.50] | [Edit] [Compare]
- Compare button opens modal for pairwise comparison with next element

### In AnalyzingView
- List all elements with evaluation status
- Show: [Element Name] | [Acceptable? YES/NO] | [Dominance: 0.50]
- Highlight unacceptable factors in red
- After evaluation: Show Decision banner (YES in green or NO in red)

### In StructuringView
- Dominance Distribution Chart: Bar chart showing all factors sorted by DominanceFactor
- Highlighting: Unacceptable factors highlighted in red
- Decision Statement: Clear text explaining decision outcome
- Export Option: User can export model for sharing or documentation

---

## Creative Advancement Scenario: Hiring Decision

**User Intent**: Make auditable hire/no-hire decision that team can understand and defend

**Current Structural Reality**: Interview team has conflicting opinions; some like candidate A for technical skills, others prefer candidate B for cultural fit; no clear process for deciding

**Natural Progression Steps**:

1. User creates model: "Software Engineer Hiring Decision"
2. User adds factors: Technical Skills, Cultural Fit, Communication, Learning Ability, Salary Fit, Experience Level
3. User makes comparisons: Which factors matter most to this team?
   - Through comparison, technical skills emerges as highest dominance (0.75)
   - Cultural fit emerges as secondary (0.70)
   - Salary emerges as constraint (0.40)
4. User evaluates candidates separately:
   - Candidate A evaluation: ✓ Technical (YES), ✓ Cultural (YES), ✗ Salary (NO)
   - Candidate B evaluation: ✗ Technical (NO), ✓ Cultural (YES), ✓ Salary (YES)
5. Model outcome:
   - Candidate A: Decision = NO (salary unacceptable)
   - Candidate B: Decision = NO (technical unacceptable)
   - Result: Team realizes neither candidate meets all criteria
6. Insight: Team revisits salary band OR technical requirements
7. Next iteration: Add new candidates or adjust model tolerance

**Achieved Outcome**: Transparent, defensible hiring decisions that team understands and agrees with

**Supporting Features**:
- Pairwise comparison revealed team's true priorities (technical > cultural > salary)
- Mandatory factor logic ensured no deal-breaker was overlooked
- Model can be reused for future hiring rounds
- Comparison history preserved (if saved) for future reference

---

## Edge Cases & Handling

### Incomplete Comparisons
**Scenario**: User saves model before completing all pairwise comparisons
**Handling**: System marks Model.Valid = false, prevents switching to Analyzing mode
**UX**: Warning message: "Complete all pairwise comparisons to analyze this model"

### Tied Comparisons
**Scenario**: User chooses "Equal" for multiple factor pairs
**Handling**: Allowed—indicates genuine equivalence
**Effect**: DominanceFactor for tied factors converges toward 0
**UX**: Visualization shows which factors are in equivalent tier

### New Factor Added After Comparisons
**Scenario**: User adds 3rd factor after comparing A vs B only
**Handling**: New factor needs comparisons with A and B before model is Valid
**UX**: New element marked as "Needs Comparison" in list

### Evaluation with Changed Model
**Scenario**: User was analyzing, goes back to Modeling, adds factor, returns to Analyzing
**Handling**: System resets evaluation state (all TwoFlagAnswered = false) because model structure changed
**UX**: Warning: "Model was modified. Previous evaluation cleared. Re-evaluate with new structure."

---

## Technical Implementation Notes

### Comparison Modal Component
Must handle:
- Bidirectional storage (update both elements)
- Real-time dominance calculation
- Modal open/close without data loss
- Keyboard navigation (arrow keys to navigate pairs)

### Sorting Logic
When displaying factors sorted by DominanceFactor:
\`\`\`typescript
elements.sort((a, b) => b.DominanceFactor - a.DominanceFactor)
// Higher dominance first (most important factors first)
\`\`\`

### Decision Rendering
After all evaluations, render decision:
\`\`\`typescript
const unacceptableFactors = elements.filter(e => e.TwoFlagAnswered && !e.TwoFlag)
const decision = unacceptableFactors.length === 0 ? YES : NO
const reason = unacceptableFactors.length > 0
  ? `Unacceptable: ${unacceptableFactors[0].DisplayName}`  // List primary blocker
  : "All factors acceptable"
\`\`\`

### Dominance Recalculation Trigger
Recalculate dominance whenever:
- Comparison changes (user updates modal)
- Factor added or removed
- Factor name/description changes (doesn't affect dominance, but triggers save)

---

## Specification Completeness Check

An implementation is complete when:

1. ✅ Type 1 models can be created manually or from AI description
2. ✅ All pairwise comparisons are stored bidirectionally
3. ✅ DominanceFactor correctly calculated as (wins - losses) / total
4. ✅ Comparison modal allows user to evaluate every unique pair
5. ✅ Analyzing mode evaluates each factor as acceptable/unacceptable
6. ✅ Decision algorithm outputs NO if any factor is unacceptable, YES otherwise
7. ✅ Dominance distribution visualized in Structuring mode
8. ✅ Model cannot enter Analyzing until all comparisons complete (Valid = true)
9. ✅ Model persists across sessions
10. ✅ History tracks comparison changes and evaluation states

---

**Specification Status**: ✅ Complete and autonomous
**RISE Phase**: Phase 2 (Intent Refinement)
**Complexity**: Medium (requires understanding pairwise comparison logic, dominance calculation, mandatory factor decision algorithm)
**Dependencies**: Requires reading `model_persistence.spec.md` for storage understanding
