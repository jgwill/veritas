# Model Persistence, History & Import/Export - Specification

🧠: **Desired Outcome Definition**

Users preserve their thinking across time and contexts—models persist, histories track evolution, and exports enable sharing and collaboration—transforming thinking from disposable insights into permanent knowledge assets.

---

## Creative Intent

Persistence enables models to become living documents rather than one-off analyses. Users can:
- Return to a decision model years later and see their original reasoning
- Track performance improvements (or regressions) over quarters
- Share models with colleagues for collaboration
- Export models for documentation or compliance

**Structural Tension**: Models lost after evaluation → Thinking disappears → No learning from decisions

Resolution: Models persist with history → Decisions become traceable → Thinking becomes learnable

---

## Storage Architecture

### Primary Storage: Browser LocalStorage

**Mechanism**:
- Models stored as JSON in browser's localStorage
- Key: `TANDT_MODELS` (application root key)
- Value: Serialized array of all models

**Why LocalStorage**:
- No backend required
- Works offline
- User data stays on their device
- Persists across browser sessions
- Sufficient for typical usage (5-10 models max)

**Limitations**:
- Typically 5-10MB per domain
- Not synced across browsers/devices
- Cleared if user clears browser data
- No automatic backup

### Data Structure

\`\`\`typescript
LocalStorage Format:
{
  TANDT_MODELS: JSON.stringify([
    {
      Idug: "model_001_uuid",
      DigitalTopic: "Senior Engineer Hiring",
      ModelName: "hire_seneng_2024",
      DigitalThinkingModelType: 1,
      Model: [ /* DigitalElement array */ ],
      history: [
        {
          timestamp: 1704067200000,
          description: "Initial model creation",
          elements: [ /* snapshot of model state */ ],
          decision: true,
          decisionReason: "All factors acceptable"
        },
        {
          timestamp: 1704067300000,
          description: "Revised salary expectation",
          elements: [ /* updated state */ ],
          decision: false,
          decisionReason: "Salary unacceptable"
        }
      ],
      DtCreated: "2024-01-01T00:00:00Z",
      DtModified: "2024-01-02T12:30:00Z",
      Valid: true,
      Decided: true,
      Decision: false,
      AutoSaveModel: true
    }
  ])
}
\`\`\`

### Save Operations

**Auto-Save (Implicit)**:
- Triggered after every user action that changes model state
- No user confirmation needed
- Silent background operation
- Happens after: Comparison, evaluation, description edit, element add/remove

**Manual Save (Explicit)**:
- Optional save button in ModelingView
- Shows confirmation: "Model saved"
- User can trigger if desired (even if auto-saving active)

**Implementation**:
\`\`\`typescript
async function saveModel(model: DigitalModel) {
  const models = getAllModels()
  const existingIndex = models.findIndex(m => m.Idug === model.Idug)

  if (existingIndex >= 0) {
    models[existingIndex] = model
  } else {
    models.push(model)
  }

  localStorage.setItem('TANDT_MODELS', JSON.stringify(models))
  showToast('Model saved')
}
\`\`\`

---

## Model Lifecycle: Creation to Archival

### Creation

**Initial Save**:
- User creates model (manual or AI-generated)
- System assigns unique Idug (UUID)
- DtCreated = current timestamp
- Initial history entry created: "Model created"
- Saved to localStorage

### Active Usage

**Periodic Saves**:
- Each comparison/evaluation/edit triggers auto-save
- DtModified updated to current timestamp
- History entry added (max 50 entries)
- User never needs to think about saving

**Version Tracking**:
- Every save creates a history entry with:
  - timestamp
  - User description (optional)
  - Element snapshot
  - Decision state (if evaluated)

### Archival/Deletion

**Soft Delete**:
- User clicks "Delete" → Confirmation required
- Model moved to "Deleted" status (not removed)
- Can be restored within 30 days
- After 30 days, hard deleted

**Permanent Delete**:
- User confirms permanent deletion
- Model removed from storage
- All history lost

---

## History System

### Purpose

History preserves the evolution of thinking:
- Track why decisions were made (original vs. revised)
- Understand how model refined over time
- Revert if mistake discovered
- Compare outcomes across time periods (Type 2)

### History Entry Structure

\`\`\`typescript
interface HistoryEntry {
  timestamp: ISO8601 string  // When this entry was created
  description?: string        // Optional user description

  // State snapshot
  elements: DigitalElement[]  // Model state at this time
  decision?: boolean          // Type 1: Decision outcome
  decisionReason?: string     // Type 1: Why decision was made

  // Metadata
  changeType: 'comparison' | 'evaluation' | 'model_edit' | 'creation'
  changedElementId?: string   // What changed (if specific element)
}
\`\`\`

### History Tracking

**Type 1 Decision Models**:
- Entry created when comparison changes (dominance recalculated)
- Entry created when evaluation completed (decision rendered)
- Entry created when element added/removed
- Description: "Compared [Factor A] vs [Factor B]" or "Completed evaluation"

**Type 2 Performance Models**:
- Entry created when element state changes
- Entry created when trend evaluation done
- Entry created when evaluation completed
- Description: "Evaluated Q3 performance" or "Marked Delivery Speed as declining"

### History Limits

**Max Entries**: 50 per model
- When 50th entry reached, oldest entries start being removed
- Preserves most recent history
- Keeps storage usage bounded

**Pruning Strategy**:
\`\`\`typescript
if (model.history.length >= 50) {
  // Remove oldest 10 entries
  model.history = model.history.slice(10)
}
\`\`\`

### History UI: Timeline View

**HistoryPanel Component** (visible in ModelingView and AnalyzingView):

\`\`\`
┌─────────────────────────────────┐
│ History Timeline                │
├─────────────────────────────────┤
│                                 │
│ 📌 Jan 2, 2:30 PM              │
│    Completed evaluation         │
│    Decision: NO (salary)        │
│    [View] [Revert]             │
│                                 │
│ 📌 Jan 2, 2:15 PM              │
│    Revised salary expectation   │
│    [View] [Revert]             │
│                                 │
│ 📌 Jan 1, 10:00 AM             │
│    Compared Tech vs Culture     │
│    [View] [Revert]             │
│                                 │
│ 📌 Jan 1, 9:30 AM              │
│    Model created               │
│    [View] [Revert]             │
│                                 │
│ [Show More]                     │
└─────────────────────────────────┘
\`\`\`

### Revert Capability

**User clicks "Revert"**:
1. System loads model state from history entry
2. Replaces current model with historical version
3. Creates new history entry: "Reverted to [timestamp]"
4. Auto-saves
5. Shows confirmation: "Model reverted to [date/time]"

**Revert is Safe**:
- Original state preserved in history
- User can revert the revert
- No data loss

---

## Import/Export System

### Export: Create Shareable Model File

**Access Point**: Export button in any view

**Export Options**:
\`\`\`
Format: [▼ JSON]
├─ JSON (Complete data, all history)
├─ CSV (Elements only, for spreadsheet)
├─ PDF (Formatted report with charts)
└─ Markdown (Text format for docs)

Include:
☑ Full History
☑ Evaluation Results
☐ Chart Visualizations
☑ Model Metadata

[Export] [Cancel]
\`\`\`

### JSON Export (Complete)

**Format**:
\`\`\`json
{
  "format": "tandt_model_v1",
  "exportDate": "2024-01-02T12:30:00Z",
  "model": {
    "Idug": "model_001",
    "DigitalTopic": "Senior Engineer Hiring",
    "ModelName": "hire_seneng_2024",
    "DigitalThinkingModelType": 1,
    "Model": [ /* all elements */ ],
    "history": [ /* all history entries */ ],
    "DtCreated": "2024-01-01T00:00:00Z",
    "DtModified": "2024-01-02T12:30:00Z"
  },
  "exportedBy": "TandT v1.0"
}
\`\`\`

**Use Cases**:
- Email to colleague for feedback
- Store in Git/version control for team decisions
- Backup to cloud storage
- Archive for compliance/audit

### CSV Export (Elements Only)

**Format**:
\`\`\`
Name,Description,Type 1 Dominance,Type 2 State,Type 2 Trend
Technical Skills,"Ability to do the job",0.75,Acceptable,Stable
Cultural Fit,"Works well with team",0.83,Acceptable,Improving
Salary,"Budget fit",0.40,Unacceptable,Stable
\`\`\`

**Use Cases**:
- Import to spreadsheet for analysis
- Share with non-TandT users
- Track changes in Excel/Sheets
- Export for reporting

### PDF Export (Formatted Report)

**Contents**:
- Title: Model name + topic
- Date: Export date + creation date
- Summary: Type 1 decision or Type 2 priorities
- Chart: Dominance distribution or performance matrix
- Details: Element descriptions + evaluation results
- History: List of recent changes (if included)

**Example PDF Section**:
\`\`\`
═══════════════════════════════════════
Senior Engineer Hiring Decision
═══════════════════════════════════════

Model Created: January 1, 2024
Decision Date: January 2, 2024
Status: Completed

─────────────────────────────────────
DECISION OUTCOME
─────────────────────────────────────
❌ NO

Reason: Salary requirement exceeds budget

─────────────────────────────────────
FACTOR DOMINANCE
─────────────────────────────────────
[Chart visualization]

Cultural Fit (0.83) - ACCEPTABLE
Technical Skills (0.75) - ACCEPTABLE
Leadership (0.70) - ACCEPTABLE
Salary (0.40) - UNACCEPTABLE ← BLOCKER
Growth Potential (0.35) - ACCEPTABLE

─────────────────────────────────────
NEXT STEPS
─────────────────────────────────────
• Revise salary band
• OR consider different seniority level
• OR extend timeline to find suitable candidate
\`\`\`

### Import: Load External Model

**Access Point**: "Import Model" button in ModelListView

**Import Process**:
1. User selects JSON file from computer
2. System validates format (checks `format: "tandt_model_v1"`)
3. If valid:
   - Assign new Idug (don't overwrite if importing duplicate)
   - Show preview: "Import this model?"
   - User confirms
   - Added to local storage
   - Toast: "Model imported: [Name]"
4. If invalid:
   - Show error: "Invalid file format"
   - Suggest re-export or fix

**Duplicate Handling**:
- If imported model already exists locally (same Idug):
  - Ask: "Replace existing model or create copy?"
  - User choice: "Replace" or "Create Copy"

**Import Verification**:
\`\`\`typescript
function validateImportFile(json: any): boolean {
  return (
    json.format === 'tandt_model_v1' &&
    json.model &&
    json.model.Idug &&
    json.model.DigitalTopic &&
    Array.isArray(json.model.Model)
  )
}
\`\`\`

---

## Model List & Organization

### ModelListView: Browse & Manage

**Display**:
\`\`\`
┌────────────────────────────────────────┐
│ Your Models (5 total)                  │
├────────────────────────────────────────┤
│                                        │
│ ☐ Senior Engineer Hiring (Type 1)    │
│   Created: Jan 1 | Modified: Jan 2   │
│   Status: Decided (NO)               │
│   [Open] [Edit] [Export] [Delete]    │
│                                        │
│ ☐ Q3 Team Performance (Type 2)       │
│   Created: Nov 1 | Modified: Today   │
│   Status: Evaluated (3 critical)     │
│   [Open] [Edit] [Export] [Delete]    │
│                                        │
│ ☐ Hiring Process Improvements (Type 1)
│   Created: Oct 15 | Modified: Oct 20 │
│   Status: In Modeling (no evaluation) │
│   [Open] [Edit] [Export] [Delete]    │
│                                        │
│ [Create New Model]                   │
│ [Import Model]                       │
└────────────────────────────────────────┘
\`\`\`

**Sorting Options**:
- Most Recently Modified (default)
- Oldest First
- Alphabetical
- Type (Decision vs Performance)
- Status (Decided vs In Modeling)

**Search**:
- Filter by name or topic
- Filter by type
- Filter by status

### Quick Info Display

For each model, show:
- Name + Topic
- Type icon (1 or 2)
- Creation + modification dates
- Current status
- Quick actions

---

## Backup & Recovery

### Auto-Backup (Optional)

If user enables auto-backup:
- System periodically saves JSON file to Downloads folder
- Backup triggers: Every model save, daily if changes made
- File naming: `TandT_Backup_[date]_[time].json`

**User Benefit**: Protection against browser data clearing

### Recovery After Browser Data Clear

If user accidentally clears localStorage:
1. All models lost from browser
2. User can recover from backup file (if auto-backup enabled)
3. Import backup: "Import Model" → Select backup file
4. All models restored

### Cloud Sync (Future)

Not included in current spec, but future enhancement:
- Optional cloud storage (Google Drive, etc.)
- Sync models across devices
- Automatic backup
- Multi-device access

---

## Data Migration & Format Versioning

### Version History

**Current Version**: `tandt_model_v1`

If format changes:
1. Increment version (v2, v3, etc.)
2. Implement migration function
3. On load: Check version, run migration if needed

**Migration Example**:
\`\`\`typescript
function migrateModel(model: any, fromVersion: string): DigitalModel {
  if (fromVersion === 'v1') {
    return model  // No changes needed
  }
  // Future migrations here
}
\`\`\`

### Backward Compatibility

- Old models always loadable
- New features gracefully ignored if not present
- No automatic data loss

---

## Storage Size & Optimization

### Current Usage Estimates

Typical small model:
\`\`\`
Model data: ~2KB
History (20 entries): ~5KB
Total per model: ~7KB
\`\`\`

Multiple models:
\`\`\`
10 models: ~70KB (well within 5-10MB limit)
100 models: ~700KB (still comfortable)
\`\`\`

### Monitoring Storage Usage

**In Settings** (future):
\`\`\`
Storage Usage: 245 KB of 10 MB available

☐ Auto-cleanup: Delete models not accessed in [90 days]
☐ Prune history: Keep only 20 most recent entries per model
[Clear Cache] [Check Usage] [Export All Models]
\`\`\`

---

## Privacy & Data Safety

### What's Stored

- All model data (elements, descriptions, evaluations)
- Complete history (every change)
- No personally identifiable information required
- No external servers involved (by default)

### What's NOT Stored

- User identity
- Browser history
- External data
- Tracking information
- Passwords (never needed)

### User Control

Users have full control:
- Models stored locally only (by default)
- Can export and delete anytime
- Can view/edit localStorage directly if desired
- No hidden sync or tracking

---

## Specification Completeness Check

Implementation is complete when:

1. ✅ Models persist in browser localStorage
2. ✅ Auto-save triggers after every change
3. ✅ History tracks up to 50 versions per model
4. ✅ Revert function restores any previous version
5. ✅ Export as JSON (complete with history)
6. ✅ Export as CSV (elements for spreadsheet)
7. ✅ Export as PDF (formatted report)
8. ✅ Import JSON files (with validation)
9. ✅ ModelListView shows all models with quick actions
10. ✅ Deletion is soft-delete (can recover)
11. ✅ History UI shows timeline with revert option
12. ✅ No data loss even if browser cache cleared (if backup enabled)

---

**Specification Status**: ✅ Complete and autonomous
**RISE Phase**: Phase 2 (Intent Refinement)
**Complexity**: Low-Medium (standard persistence patterns, no backend needed)
**Dependencies**: Works with all other components, no external dependencies required
