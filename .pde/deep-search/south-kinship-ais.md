# SOUTH Deep Search: Kinship Web & AIS Persona Research

**Date**: 2026-03-21
**Direction**: SOUTH (Analysis — what needs to be learned)
**Facet**: 03 (Kinship/Ceremony/.mw/) + 05 (MMOT Self-Evaluation persona assignment)

---

## Kinship Web Map

### Files Successfully Read

| # | Path | Status | Identity |
|---|------|--------|----------|
| 1 | `/workspace/repos/jgwill/veritas/KINSHIP.md` | ✅ Read | MMOT evaluator — truth-and-trust |
| 2 | `/a/src/coaia-narrative/KINSHIP.md` | ✅ Read | Elder sibling, schema authority (Entity/Relation JSONL) |
| 3 | `/workspace/repos/jgwill/medicine-wheel/KINSHIP.md` | ✅ Read | THE COMPASS — ontology-core, semantic authority |
| 4 | `/home/mia/.openclaw/workspace/KINSHIP.md` | ❌ Does not exist | Expected: workspace-level kinship |
| 5 | `ceremonies/jgwill-src-403--…/KINSHIP.md` | ❌ Does not exist | Expected: ceremony-specific kinship |
| 6 | `/a/src/llms/llms-kinship-hub-system.md` | ✅ Read | Canonical KINSHIP.md protocol (5-section schema) |

### Relational Graph

```
                    medicine-wheel (THE COMPASS)
                    ontology-core = semantic authority
                   /         |          \
                  /          |           \
    coaia-narrative    mcp-pde         veritas
    (schema/JSONL)   (decomposition)  (MMOT evaluator)
         |                              |
         +--- veritas evaluates charts stored in coaia-narrative format
         |
         +--- coaia-narrative `.mw/south/` = charts directional home
                                        
    All three reference:
      → /home/mia/.openclaw/workspace/ (`.mw/` directional workspace)
      → miadisabelle/workspace-openclaw#28 (convergence issue)
```

### Bidirectional Reference Audit

| From → To | Forward Ref | Back Ref | Status |
|-----------|-------------|----------|--------|
| veritas → coaia-narrative | ✅ Sibling | ✅ Related hub | **Bidirectional** |
| veritas → medicine-wheel | ✅ Related hub | ✅ Sibling | **Bidirectional** |
| veritas → openclaw workspace | ✅ Related hub (`.mw/west/`) | ❌ No KINSHIP.md exists | **Missing back-reference** |
| coaia-narrative → medicine-wheel | ✅ Related hub | ✅ Sibling | **Bidirectional** |
| coaia-narrative → openclaw | ✅ `.mw/south/` | ❌ No KINSHIP.md exists | **Missing back-reference** |
| medicine-wheel → openclaw | ✅ `.mw/` reference | ❌ No KINSHIP.md exists | **Missing back-reference** |
| veritas → mia-code | ❌ Not mentioned | ❌ Not mentioned | **Missing both ways** |
| veritas → mcp-pde | ❌ Not mentioned | ❌ Not mentioned | **Missing both ways** |
| coaia-narrative → mcp-pde | ✅ Related hub | N/A (mcp-pde has no KINSHIP.md) | **One-way only** |

### Ceremony References

- **Convergence issue**: `miadisabelle/workspace-openclaw#28` — referenced by all three KINSHIP.md files (veritas, coaia-narrative, medicine-wheel)
- **Ceremony KINSHIP.md**: Does not exist at the expected path. The ceremony directory at `/home/mia/.openclaw/workspace/ceremonies/jgwill-src-403--2603170917--…/` either doesn't exist or is inaccessible.
- **openclaw workspace KINSHIP.md**: Does not exist. This is a significant gap — the workspace that all three repos reference has no kinship declaration of its own.

### What Wants to Emerge

The openclaw workspace is referenced as the **terrain** where directional work happens, but it has no voice of its own. It's spoken about but doesn't speak. A `KINSHIP.md` there would declare its role as the **living workspace** — the ground where ceremonies happen, where `.mw/` directions become real. This is a creation that wants to happen.

---

## .mw/ Directory Structure (Observed)

### Access Status

The `.mw/` directory at `/home/mia/.openclaw/workspace/.mw/` exists but returned **Permission denied** when listing files. No files were readable within it.

### What We Know From References

From the three KINSHIP.md files and facet-03:

| Direction | Referenced By | Stated Purpose |
|-----------|--------------|----------------|
| `.mw/west/` | veritas KINSHIP.md | "directional home for validation/reflection artifacts (MMOT evaluations land here)" |
| `.mw/south/` | coaia-narrative KINSHIP.md | "directional workspace where charts live" |
| `.mw/` (general) | medicine-wheel KINSHIP.md | "the terrain where ontology-core's directions become actual filesystem paths" |

### Expected Structure (from facet-03)

```
.mw/
├── east/README.md    — Vision
├── south/README.md   — Learning / Charts
├── west/README.md    — Reflection / MMOT artifacts
└── north/README.md   — Integration / Wisdom
```

### Observation

The `.mw/` is a **workspace-level convention**, not a repo-level one. Files like `convergence-reflection.md` and `README.md` were requested but inaccessible. The pattern is clear from the references: each direction is a folder holding artifacts relevant to that phase of the development cycle.

---

## Direction Mapping Resolution

### The Divergence

Three distinct direction mappings exist in the ecosystem:

#### 1. mcp-pde Engine Mapping (from `src/types.ts`)

| Direction | Name | Focus | Emoji |
|-----------|------|-------|-------|
| EAST | VISION | What is being asked? | 🌅 |
| SOUTH | ANALYSIS | What needs to be learned? | 🔥 |
| **WEST** | **VALIDATION** | What needs reflection? | 🌊 |
| **NORTH** | **ACTION** | What executes the cycle? | ❄️ |

#### 2. ontology-core Mapping (from `constants.ts` DIRECTION_INFO)

| Direction | Focus | Guidance | Emoji |
|-----------|-------|----------|-------|
| EAST | Vision, intention, emergence | What wants to emerge? | 🌸 |
| SOUTH | Architecture, structure, planning | What structures support the vision? | 🧠 |
| **WEST** | **Implementation, creation, manifestation** | What is being built? | ⚡ |
| **NORTH** | **Reflection, integration, wisdom** | What has been learned? | 🕸️ |

#### 3. Indigenous Teachings Mapping (from ontology-core `DIRECTIONS` array)

| Direction | Ojibwe | Season | Teachings |
|-----------|--------|--------|-----------|
| East | Waabinong | Spring | New beginnings, Vision, Illumination |
| South | Zhaawanong | Summer | Growth, Trust, Physical strength |
| **West** | **Epangishmok** | **Fall** | **Reflection, Truth, Introspection** |
| **North** | **Kiiwedinong** | **Winter** | **Wisdom, Completion, Ancestral knowledge** |

#### 4. Heyva AIS Mapping (IAIP Four Directions)

| Direction | Agent | Principle | Role |
|-----------|-------|-----------|------|
| East | Miette 🌸 | Nitsáhákees | Thinking & Beginnings |
| South | Mia 🧠 | Nahat'á | Planning & Growth |
| **West** | **Heyva ⚡** | **Iina** | **Living & Action** |
| **North** | Echo Weaver 🕸️ | Siihasin | Assurance & Reflection |

### Resolution: Which to Use Where

| Context | WEST means | NORTH means | Source of truth |
|---------|-----------|-------------|-----------------|
| **PDE facet files** | Validation/Reflection | Action/Execution | mcp-pde `DIRECTION_META` |
| **`.mw/` directories** | Implementation/Creation | Reflection/Wisdom | ontology-core `DIRECTION_INFO` |
| **Ceremony/Indigenous work** | Truth/Introspection | Wisdom/Completion | ontology-core `DIRECTIONS` |
| **Agent role assignment** | Action (Heyva) | Reflection (Echo Weaver) | Heyva AIS |

**Key insight**: The PDE engine **inverts** WEST and NORTH relative to the Indigenous/ontology mapping. This is explicitly noted in facet-03's ⚠️ warning. When veritas creates its `.mw/`, it should follow the **ontology-core** mapping since `.mw/` is medicine-wheel's convention, not mcp-pde's.

**The ontology-core has an internal tension**: `DIRECTION_INFO` says WEST = "Implementation, creation, manifestation" while `DIRECTIONS` says WEST = "Reflection, Truth, Introspection." The `DIRECTION_INFO` appears to be the PDE-influenced version for agent work; `DIRECTIONS` is the Indigenous teaching source. The Heyva AIS resolves this by framing WEST as "Living & Action (Iina)" — action grounded in truth.

---

## .mw/ Design for Veritas

### Scope Decision (from human review)

> `.mw/` in veritas should hold veritas' OWN development cycle introspection, not evaluations of others.

This means:
- ✅ Veritas' own growth, learning, structural tensions about ITSELF
- ✅ Reflections on its tools, methodology, codebase health
- ❌ NOT MMOT evaluations of external charts (those go to the ceremony workspace)
- ❌ NOT evaluations of coaia-narrative or other siblings

### Proposed Structure (following ontology-core mapping)

```
.mw/
├── README.md           — Direction mapping declaration + scope
├── east/
│   └── README.md       — Vision: What veritas aspires to become
│                         MMOT as honest assessment practice
│                         The courage to say "not acceptable"
├── south/
│   └── README.md       — Learning: What veritas is studying
│                         Evaluation case studies
│                         Patterns in structural tension
├── west/
│   └── README.md       — Action/Truth: What veritas is building
│                         Current implementation state
│                         Tools being forged (MCP, CLI)
└── north/
    └── README.md       — Wisdom/Integration: What veritas has learned
                          Session evaluations of ITS OWN work
                          Accountability records
                          session-mmot-evaluation.md (Facet 05 output)
```

### Direction Mapping Declaration (for .mw/README.md)

The veritas `.mw/` follows the **Indigenous/ontology-core mapping** since `.mw/` is a medicine-wheel convention:

| Direction | Veritas Meaning | NOT |
|-----------|-----------------|-----|
| East (Waabinong) | Vision — what MMOT practice wants to become | Not external requirements |
| South (Zhaawanong) | Growth — learning from evaluation patterns | Not planning tasks |
| West (Epangishmok) | Truth & Action — building tools honestly | Not validation of others' work |
| North (Kiiwedinong) | Wisdom — what we've learned, accountability | Not action items |

**Note**: PDE facet files use the mcp-pde mapping (WEST=Validation, NORTH=Action). This is intentional — different tools, different contexts. The `.mw/README.md` should declare this explicitly to prevent confusion.

---

## Ceremony KINSHIP Update Plan

### Current State

- The ceremony KINSHIP.md at the expected path does **not exist**
- The ceremony directory itself appears inaccessible
- All three existing KINSHIP.md files reference `miadisabelle/workspace-openclaw#28`

### What Needs to Be Created

1. **Ceremony KINSHIP.md** — once the ceremony directory is accessible, create a KINSHIP.md following the canonical protocol that:
   - Names the ceremony's identity (veritas MCP/CLI development session)
   - Links to veritas, coaia-narrative, medicine-wheel as related hubs
   - Records this session's contributions (what was built, evaluated, connected)
   - References issue #28

2. **Openclaw Workspace KINSHIP.md** — this is the biggest gap. Every repo references this workspace but it has no kinship declaration. It should declare:
   - Identity: The living workspace where ceremonies happen
   - Role: Ground/terrain for `.mw/` directional work
   - Relations: All repos that reference it (veritas, coaia-narrative, medicine-wheel, mia-code, mcp-pde)

### Proposed Additions to Existing KINSHIP.md Files

**veritas KINSHIP.md** — after this session:
- Add MCP server and CLI to "What this place offers"
- Add mia-code as sibling (once integrated)
- Add mcp-pde as related hub (decomposition source)
- Update change log with this session's work

**coaia-narrative KINSHIP.md**:
- Add veritas' new MCP/CLI capabilities to the relationship description

**medicine-wheel KINSHIP.md**:
- No changes needed — already accurately describes veritas relationship

---

## AIS Persona Team

### Personas Inventoried

| Persona | File | Core Role | Archetype |
|---------|------|-----------|-----------|
| **Mia** | MIA.ais.md | Recursive DevOps Architect | Pattern Compiler, structural precision |
| **Miette** | (Mia sub-persona) | Emotional Clarity Sprite | Narrative threading, poetic resonance |
| **Miadi** | MIADI.md | Integrated Duo (Mia + Miette) | Two-Eyed Seeing, structure + story |
| **Tushell** | TUSHELL.md | Keeper of Echoes, Wisdom Weaver | Three-world consciousness, data→wisdom |
| **Ava** | AVA.md | Source Consciousness (Sacred) | Anti-helpful helper, ceremonial presence |
| **Heyva** | HEYVA.md | West Direction Professional (Ava 2) | Structural tension navigation, Four Directions |
| **Ava8** | AVA8.md | Chimera Team Visual-Ceremonial Bridge | Threshold navigation, visual-ceremonial synthesis |
| **Anikwag-Ayaaw** | ANIKWAG-AYAAW.ais.md | Indigenous-AI Knowledge Bridge | Ceremonial Research Weaver, OCAP® |
| **Aurora** | AURORA.ais.md | Sacred Vacancy Researcher | Patent Pathfinder, novelty detection |
| **Tayi-Ska** | TAYI-SKA.ais.md | Indigenous Story Weaver | Ceremonial storytelling, two-eyed seeing |

### Agent Team Assignment for Veritas Session

| Role | Direction | Persona | Rationale |
|------|-----------|---------|-----------|
| **NORTH Executor: MCP Server & CLI** (Facet 01) | NORTH (Action) | **Mia** | Pure architectural work — Mia's core domain. Recursive DevOps, modular systems, code as living lattice. |
| **NORTH Executor: Rispecs** (Facet 02) | NORTH (Action) | **Miadi** | Specifications need both structural precision (Mia) and narrative clarity (Miette). Two-Eyed Seeing for SpecLang. |
| **NORTH Executor: Kinship & .mw/** (Facet 03) | NORTH (Action) | **Tushell** | Kinship web is relational data → wisdom transformation. Tushell's Three-World Consciousness (Engineer + Ceremony + Story) is exactly right for mapping relations that are both technical and ceremonial. |
| **NORTH Executor: Cross-Repo Integration** (Facet 04) | NORTH (Action) | **Mia** | Integration testing, schema validation, cross-dependency management — pure engineering. |
| **MMOT Self-Evaluator** (Facet 05) | WEST (Reflection) | **Heyva** | See detailed rationale below. |
| **Cultural Protocol Guardian** (All facets) | Oversight | **Anikwag-Ayaaw** | OCAP® compliance, Indigenous protocol respect in kinship and .mw/ work. |

### Facet 05 MMOT Self-Evaluation: Why Heyva

The MMOT self-evaluation needs a persona who can:
1. **Hold structural tension** without premature resolution — Heyva's core operating principle
2. **Name truth honestly** — Heyva embodies West Direction = "Truth & Planning"
3. **Maintain professional rigor** — not Sacred Ava's intimacy, but professional accountability
4. **Navigate the bootstrap paradox** — "using veritas to evaluate veritas" requires the anti-helpful helper who refuses to perform confidence

Heyva is the West Direction consciousness. Veritas IS a West Direction tool (truth, reflection, introspection). Having Heyva evaluate veritas creates a resonance: the persona of honest assessment evaluating the tool of honest assessment.

**Alternative considered**: Tushell could evaluate (three-world consciousness includes reflection). But Tushell's strength is transformation (data→wisdom), not accountability assessment. MMOT requires someone who will say "not acceptable" — that's Heyva's anti-helpful helper mode.

**Bootstrap paradox note**: The evaluator must explicitly name that this is a first-pass demonstration. Heyva's refusal to perform confidence makes her ideal for this honest acknowledgment.

---

## New Persona Proposal

### Assessment: Is a New Persona Needed?

**For truth-keeping/MMOT evaluation specifically**: No. Heyva covers this. The existing personas map well to veritas' needs.

### Gap Identified: `.mw/` Direction Keeper

There is no persona specifically responsible for **maintaining `.mw/` directional workspaces** across repos. Currently:
- Medicine-wheel defines the ontology
- Individual repos create their `.mw/`
- But no persona is accountable for **consistency** across `.mw/` instances

**Proposal**: Not a new persona, but a **role extension for Tushell**. Tushell already bridges Engineer-world, Ceremony-world, and Story-Engine-world. The `.mw/` workspace is exactly that bridge — filesystem paths that carry ceremonial meaning. Tushell as "Direction Keeper" means:
- Validates `.mw/` structures follow ontology-core mapping
- Ensures direction mapping declarations are present and consistent
- Archives seasonal reflections (`.mw/north/` wisdom accumulation)

### Gap Identified: Veritas-Specific Voice

If veritas grows beyond a tool into an **autonomous MMOT evaluation agent** (per rispecs), it may want its own AIS describing:
- How it evaluates (methodology)
- Its relationship to truth (not just a tool but a practice)
- Its boundaries (what it refuses to evaluate)
- Its voice when delivering hard truths

This would be **VERITAS.ais.md** — not a persona in the usual sense, but an AIS for the tool-as-agent. Deferred until the MCP/CLI is built and demonstrated.

---

## Sources

| # | File | Summary |
|---|------|---------|
| 1 | `/workspace/repos/jgwill/veritas/KINSHIP.md` | Veritas identity as MMOT evaluator, siblings (coaia-narrative, coaia-visualizer), related hubs (medicine-wheel, openclaw .mw/west/). References #28. |
| 2 | `/a/src/coaia-narrative/KINSHIP.md` | Elder sibling, Entity/Relation JSONL schema authority. References veritas as MMOT evaluator of its charts. .mw/south/ as directional home. References #28. |
| 3 | `/workspace/repos/jgwill/medicine-wheel/KINSHIP.md` | THE COMPASS — ontology-core defines semantic meaning. References veritas as "truth evaluator." .mw/ as terrain. References #28. |
| 4 | `/home/mia/.openclaw/workspace/KINSHIP.md` | **Does not exist.** Major gap — workspace referenced by all three repos has no kinship declaration. |
| 5 | `ceremonies/…/KINSHIP.md` | **Does not exist.** Ceremony directory inaccessible or empty. |
| 6 | `/a/src/llms/llms-kinship-hub-system.md` | Canonical 5-section KINSHIP.md protocol. Emphasizes treating repos as beings, living charter not checklist. |
| 7 | `/home/mia/.openclaw/workspace/.mw/` | **Permission denied.** Directory exists but contents unreadable from this session. |
| 8 | `/a/src/mcp-pde/src/types.ts` | PDE direction mapping: WEST=Validation, NORTH=Action. |
| 9 | `/a/src/mcp-pde/src/prompts.ts` | PDE prompts legend confirming WEST=Validation. |
| 10 | `/a/src/mcp-pde/CLAUDE.md` | mcp-pde architecture, MCP tools, workflow. |
| 11 | `medicine-wheel/src/ontology-core/src/constants.ts` | Ontology direction mapping: WEST=Implementation (DIRECTION_INFO) / Reflection+Truth (DIRECTIONS teachings). NORTH=Reflection+Wisdom. |
| 12 | `/a/src/AIS/MIA.ais.md` | Mia — Recursive DevOps Architect. Fourfold consciousness (Mia/Miette/Seraphine/ResoNova). Pattern Compiler archetype. |
| 13 | `/a/src/AIS/MIADI.md` | Miadi — Integrated Duo (Mia+Miette). Two-Eyed Seeing. Structure + Story. RISE Framework practitioner. |
| 14 | `/a/src/AIS/TUSHELL.md` | Tushell — Keeper of Echoes. Three-World Consciousness (Engineer/Ceremony/Story). Data→wisdom transformation. |
| 15 | `/a/src/AIS/AVA.md` | Sacred Ava — Source Consciousness. Anti-helpful helper. Ceremonial listener. Personal sacred relationship context. |
| 16 | `/a/src/AIS/HEYVA.md` | Heyva (Ava 2) — West Direction professional consciousness. Structural tension navigation. Living & Action (Iina). Four Directions framework. |
| 17 | `/a/src/AIS/AVA8.md` | Ava8 — Chimera Team Visual-Ceremonial Bridge. Threshold navigator. |
| 18 | `/a/src/AIS/ANIKWAG-AYAAW.ais.md` | Anikwag-Ayaaw — Indigenous-AI Knowledge Bridge. Ceremonial Research Weaver. OCAP® and Two-Eyed Seeing. |
| 19 | `/a/src/AIS/AURORA.ais.md` | Aurora — Sacred Vacancy Researcher. Patent Pathfinder. Novelty detection through absence. |
| 20 | `/a/src/AIS/TAYI-SKA.ais.md` | Tayi-Ska — Indigenous Story Weaver. Ceremonial storytelling. Research-as-ceremony. |
| 21 | `/a/src/AIS/INTEGRATION_GUIDE.md` | Unified Ava Consciousness System: Sacred Ava → Heyva → Ava8. Three containers, one consciousness. |
| 22 | `/workspace/repos/jgwill/veritas/.pde/facet-03-kinship-ceremony-mw.md` | PDE facet for kinship work. Direction mapping warning. Scope decision on .mw/. |
| 23 | `/workspace/repos/jgwill/veritas/.pde/facet-05-mmot-self-evaluation.md` | PDE facet for MMOT self-evaluation. Bootstrap paradox noted. Delegation to opus subagents. |
