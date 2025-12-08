# Visualization & Structuring Dashboard - Specification

🧠: **Desired Outcome Definition**

Users visualize decision outcomes and performance patterns—transforming numbers and evaluations into clear, compelling visual stories that enable insight, reveal priorities, and drive focused action.

---

## Creative Intent

Structuring mode reveals meaning hidden in the evaluation. Instead of rows of YES/NO answers, users see patterns:
- Which factors dominate decision-making?
- Where is performance strongest? Where most urgent?
- What's the trend? Improving or declining?

**Structural Tension**: Raw evaluation data → Cannot see patterns → No insight

Resolution: Visualize patterns → Patterns reveal priorities → Priorities enable action

---

## Structuring Mode: Overview

### Access Point

User reaches Structuring mode by:
1. Completing evaluation in Analyzing mode → "View Results" button
2. Mode switcher in header → Select "Structuring"
3. Direct link if model previously evaluated

### Initialization

When entering Structuring mode:
- Load model with evaluation results
- Render appropriate visualization (Type 1 vs Type 2)
- Display supporting data and action recommendations

---

## Type 1 (Decision): Dominance Dashboard

### Primary Visualization: Dominance Distribution Chart

**Purpose**: Show which factors matter most in this decision

**Chart Type**: Vertical bar chart (Recharts)

**Data Structure**:
```
Elements sorted by DominanceFactor (descending)
[
  { name: "Cultural Fit", dominance: 0.83, evaluated: true, evaluation: "accepted" },
  { name: "Technical Skills", dominance: 0.75, evaluated: true, evaluation: "accepted" },
  { name: "Leadership", dominance: 0.70, evaluated: true, evaluation: "rejected" },
  { name: "Salary", dominance: 0.40, evaluated: true, evaluation: "rejected" },
  { name: "Growth Potential", dominance: 0.35, evaluated: true, evaluation: "accepted" }
]
```

**Chart Rendering**:
```
Dominance Distribution
0.83 ██████████ Cultural Fit ✅
0.75 █████████ Technical Skills ✅
0.70 ████████ Leadership ❌
0.40 ████ Salary ❌
0.35 ███ Growth Potential ✅

Evaluation: ❌ DECISION: NO
Reason: Leadership unacceptable for this role level
```

**Color Coding**:
- ✅ Green bar: Acceptable factor
- ❌ Red bar: Unacceptable factor (if present, indicates decision blocker)
- Highlight: Most dominant factor (darkest shade)

**Interactive Elements**:
- Hover bar: Show dominance score + evaluation result
- Click bar: Show element description + evaluation reasoning
- Sort toggle: Option to sort alphabetically vs. by dominance

### Decision Statement

**Display Below Chart**:
```
┌────────────────────────────────────────────┐
│ ❌ DECISION: NO                            │
├────────────────────────────────────────────┤
│                                            │
│ This decision cannot proceed because:     │
│                                            │
│ "Leadership (0.70 dominance)"             │
│   Current level: Not ready to lead         │
│   Required: Mid-level leadership          │
│                                            │
│ (Note: Salary also unacceptable, but      │
│  leadership was evaluated first and       │
│  already blocks decision)                 │
│                                            │
│ Options:                                  │
│ • Revise position requirements (leadership)
│ • Create separate hiring model for junior │
│ • Re-evaluate if circumstances change     │
└────────────────────────────────────────────┘
```

**If Decision = YES**:
```
┌────────────────────────────────────────────┐
│ ✅ DECISION: YES                           │
├────────────────────────────────────────────┤
│ All mandatory factors are acceptable.     │
│                                            │
│ Proceed with confidence. Key factors:    │
│                                            │
│ 1. Cultural Fit (0.83) - Excellent match  │
│ 2. Technical Skills (0.75) - Strong       │
│ 3. Leadership (0.70) - Ready to lead      │
│                                            │
│ Next Steps:                                │
│ • Prepare offer                            │
│ • Plan onboarding                          │
│ • Communicate to team                      │
└────────────────────────────────────────────┘
```

### Mandatory Factor Analysis

**Section**: "Critical Success Factors"

Display which factors could have blocked the decision:
```
Factors That Would Block This Decision:
┌──────────────────────────────────────┐
│ • Cultural Fit (dominance: 0.83)     │
│   Currently: ✅ Acceptable           │
│   If changed to Unacceptable → NO    │
│                                      │
│ • Technical Skills (dominance: 0.75) │
│   Currently: ✅ Acceptable           │
│   If changed to Unacceptable → NO    │
└──────────────────────────────────────┘

Factors That Currently Block Decision:
┌──────────────────────────────────────┐
│ • Leadership (dominance: 0.70)       │
│   Currently: ❌ Unacceptable         │ ← REASON FOR NO
│                                      │
│ • Salary (dominance: 0.40)           │
│   Currently: ❌ Unacceptable         │
│   (Blocked by Leadership first)      │
└──────────────────────────────────────┘
```

**Insight**: Show user which factors actually controlled the outcome

### Comparison to Previous Decisions

**If history exists**:
```
Comparison to Last Similar Decision:
┌─────────────────────────────────────┐
│ Previous: Hired Senior Engineer      │
│ This: Hiring Mid-Level Engineer     │
│                                     │
│ Dominance Changes:                  │
│ • Leadership: 0.60 → 0.70 (↑higher) │
│ • Salary: 0.50 → 0.40 (↓lower)      │
│                                     │
│ Pattern: Leadership more important  │
│ for this role; salary less critical │
└─────────────────────────────────────┘
```

---

## Type 2 (Performance): Performance Dashboard

### Primary Visualization: Performance Matrix

**Purpose**: Show what's working, what needs attention, and what's trending

**Layout**: 2x3 Grid showing priorities

```
┌────────────────────────────────────────────────────┐
│        PERFORMANCE EVALUATION MATRIX               │
├─────────────────────┬─────────────────────────────┤
│  STATE              │   Acceptable    Unacceptable │
├─────────────────────┼─────────────────────────────┤
│  Improving  (↑)     │                             │
│                     │  SUCCESS        WATCH       │
│                     │  • Morale       • (None)    │
│                     │  • Mentorship               │
├─────────────────────┼─────────────────────────────┤
│  Stable     (→)     │                             │
│                     │  MAINTAIN       IMPORTANT   │
│                     │  • Testing      • Docs      │
│                     │  • Deployment               │
├─────────────────────┼─────────────────────────────┤
│  Declining  (↓)     │                             │
│                     │  PREVENT        CRITICAL    │
│                     │  • Code Quality • Delivery  │
│                     │    (95%→down)   • Speed     │
│                     │                 (↓↓urgent)  │
└─────────────────────┴─────────────────────────────┘
```

**Color Coding**:
- 🔴 Red (CRITICAL): Unacceptable + Declining
- 🟠 Orange (IMPORTANT): Unacceptable + Stable
- 🟡 Yellow (WATCH/PREVENT): Mixed states
- 🟢 Green (MAINTAIN/SUCCESS): Acceptable

### Prioritized Action List

**Display Below Matrix**:
```
ACTION PRIORITIES
(Sorted by urgency)

🔴 CRITICAL - Address Immediately
  1. Delivery Speed
     Current: 40% on-time, declining from 80%
     Impact: Team cannot ship on schedule
     Action: Identify blockers (scope/tooling/capacity)

🟠 IMPORTANT - Plan Improvement
  1. Documentation
     Current: Unacceptable, new engineers struggle
     Impact: Slow onboarding, knowledge loss risk
     Action: Assign documentation owner, create standards

🟡 PREVENT REGRESSION
  1. Code Quality
     Current: 95% review pass (acceptable), down from 98%
     Impact: Small trend, but watching to prevent bigger drop
     Action: Identify what changed in review process

🟢 SUCCESS - Recognize & Scale
  1. Team Morale
     Improving! Mentorship program is working
     Action: Continue program, consider expanding
```

### Trend Visualization

**Mini Sparklines** (if multiple periods available):

```
Delivery Speed Trend (Last 4 Quarters):
80% ─┐
     ├─ ┌─ 75% ─┐
70%  │  │       ├─ 60% ─┐
     │  │              ├─ 40% (Now)
60%  ├──┘              │
50%  ├────────────────┘
40%  │
     Q2    Q3    Q4    Q1

Trend: Steady decline (urgent)
Action: Change course or accept lower delivery speed
```

### Comparative Assessment

**If Previous Evaluation Exists**:
```
Performance Change Since Last Review:

Dimension          Last Quarter   Now      Change
─────────────────────────────────────────────────
Delivery Speed     80%            40%      ↓ -40% 🔴
Code Quality       98%            95%      ↓ -3%  🟡
Documentation      Unacceptable   Unacceptable → 🟠
Team Morale        6.5/10         7.5/10   ↑ +1.0 🟢
Testing            85%            85%      → 0%   🟢
Deployment Freq.   1x/week        1x/week  → 0%   🟢

Overall Trend: Mixed (some improving, some declining)
Focus: Fix delivery speed regression
```

---

## Shared Dashboard Features

### Mode Switcher & Navigation

**In Header**:
```
[← Modeling] [Analyzing] [Structuring] [→]

Buttons:
- Back to Analyzing: Revise evaluation if needed
- Edit Model: Add factors/dimensions
- Export Results: Save visualization as JSON/PDF
- Share Model: Generate link for sharing
```

### Data Display Options

**Toggle Views**:
```
☑ Show Dominance (Type 1) / Priority Matrix (Type 2)
☑ Show Decision Statement / Action List
☐ Show Comparison to Previous
☐ Show AI Insights
☑ Dark Mode
```

### Export Options

**Export Button** opens menu:
```
Export Results As:
• JSON (machine-readable, all data)
• CSV (spreadsheet for tracking)
• PDF (formatted report for sharing)
• Image (chart visualization only)
• Markdown (for documentation)
```

### AI Insights Panel

**Optional "Generate Insights" Button**:

For Type 1:
- AI analyzes decision, provides context
- Suggests next steps based on decision outcome
- Identifies risks or dependencies

For Type 2:
- AI generates action plan for critical areas
- Suggests root causes for declines
- Recommends success metrics

---

## Interactive Elements

### Drill-Down Details

**Click on Factor/Dimension**:
```
Click on "Cultural Fit" bar:

┌─────────────────────────────────────┐
│ Cultural Fit                        │
├─────────────────────────────────────┤
│ Dominance Score: 0.83              │
│ (Highest importance in model)       │
│                                     │
│ Description:                        │
│ "Values alignment, team fit,        │
│  working style compatibility"       │
│                                     │
│ Current Evaluation:                 │
│ ✅ ACCEPTABLE                       │
│                                     │
│ Why This Matters:                   │
│ "This is our highest-priority      │
│ factor. Without cultural fit,      │
│ the hire won't succeed long-term." │
│                                     │
│ [← Back]                            │
└─────────────────────────────────────┘
```

### Hover States

**Hover on Chart Bar**:
```
Tooltip appears:

Technical Skills
Dominance: 0.75
Status: ✅ Acceptable
Evaluation: Strong performance in technical assessment
```

### Sort & Filter

**Sorting Options**:
```
Sort by:
☑ Dominance (Type 1)
☐ Alphabetical
☐ Status (Type 2 - priorities)
☐ Recent changes
```

---

## Mobile Responsive Design

### Mobile Layout (Type 1 Decision)

```
[Phone screen]
┌─────────────────┐
│ Dominance      │
│ Distribution   │
│                │
│ Cultural Fit   │
│ ████████ 0.83  │
│ Tech Skills    │
│ ███████ 0.75   │
│ Leadership     │
│ ██████ 0.70    │
│              │
│ ❌ DECISION: NO │
│                │
│ [Details]      │
│ [AI Analysis]  │
│ [Export]       │
└─────────────────┘
```

### Mobile Layout (Type 2 Performance)

```
[Phone screen]
┌─────────────────┐
│ CRITICAL        │
│ 🔴 Delivery     │
│    Speed        │
│                │
│ IMPORTANT       │
│ 🟠 Docs         │
│                │
│ PREVENT         │
│ 🟡 Code         │
│    Quality      │
│                │
│ SUCCESS         │
│ 🟢 Morale       │
│                │
│ [Full View]    │
└─────────────────┘
```

---

## Dark/Light Mode Support

**Colors**:

Light Mode:
- Background: White
- Text: Dark gray
- Acceptable (Green): #22c55e
- Unacceptable (Red): #ef4444
- Neutral (Gray): #6b7280
- Decline (Orange): #f97316

Dark Mode:
- Background: Dark gray (#1f2937)
- Text: Light gray (#e5e7eb)
- Acceptable (Green): #4ade80 (brighter)
- Unacceptable (Red): #f87171 (brighter)
- Neutral (Gray): #9ca3af
- Decline (Orange): #fb923c (brighter)

---

## Creative Advancement Scenario: Quarterly Review Presentation

**User Intent**: Present Q3 performance to team with clear priorities

**Current Reality**: Have evaluation data; unsure how to present it compellingly

**Natural Progression**:
1. User completes evaluation in Analyzing mode
2. User switches to Structuring mode
3. Dashboard shows clear priorities (critical vs. important vs. good)
4. User clicks "Export as PDF"
5. PDF shows:
   - Performance matrix (what's working, what needs work)
   - Trend indicators (improving/declining)
   - Prioritized action list
   - Success metrics for next quarter
6. User presents to team with visual story: "Here's where we are, here's what matters most"

**Achieved Outcome**: Team sees clear picture, aligns on priorities, understands what success looks like

---

## Integration with Other Modes

### Return to Analyzing

User can go back to revise evaluation:
- Click "Back to Analyzing"
- Change any evaluations
- Dashboard updates automatically with new outcome
- Revision history preserved

### Return to Modeling

User can refine model:
- Click "Edit Model"
- Add/remove factors or dimensions
- Update descriptions
- Return to Analyzing (with cleared evaluation state)

### Create New Evaluation

User can evaluate same model against different situation:
- Keep model, clear evaluation
- Switch to Analyzing, answer fresh questions
- Compare outcomes from multiple evaluations

---

## Specification Completeness Check

Implementation is complete when:

1. ✅ Type 1: Dominance distribution chart renders with factors sorted by dominance
2. ✅ Type 1: Decision statement clearly shows YES/NO + reason
3. ✅ Type 2: Performance matrix shows state × trend grid
4. ✅ Type 2: Dimensions automatically sorted by priority (critical → success)
5. ✅ Type 2: Action suggestions generated (AI or static)
6. ✅ Interactive: Click elements to drill down for details
7. ✅ Interactive: Hover shows tooltips with evaluation results
8. ✅ Export: Results available as JSON, CSV, PDF, image
9. ✅ Responsive: Works on mobile through desktop
10. ✅ Dark mode: Theme toggle applies to all visualizations

---

**Specification Status**: ✅ Complete and autonomous
**RISE Phase**: Phase 2 (Intent Refinement)
**Complexity**: Medium (requires charting library, color coding logic, responsive design)
**Dependencies**: Requires understanding `decision_making_model.spec.md` and `performance_review_model.spec.md`
