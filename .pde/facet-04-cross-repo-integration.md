# PDE Facet 04: Cross-Repo Integration Proposals

**UUID**: facet-04-cross-repo-integration
**Direction**: SOUTH (Analysis) → NORTH (Proposals)
**Priority**: SECONDARY — enables ecosystem coherence

## What Wants to Be Created

Integration proposals that connect veritas MCP/CLI to the broader ecosystem: coaia-narrative (schema alignment), mia-code (operational integration), and medicine-wheel (type alignment). Each proposal takes the form of a rispec in the target repo or a kinship-linked document.

## Desired Outcome

- **mia-code integration proposal**: A spec at `/a/src/mia-code/rispecs/veritas-integration.spec.md` describing how miaco can invoke veritas MCP tools for MMOT evaluation
- **medicine-wheel relation proposal**: A spec at `/workspace/repos/jgwill/medicine-wheel/rispecs/veritas-mmot-bridge.spec.md` describing how ontology-core types align with veritas evaluation
- **coaia-narrative alignment**: Document how veritas MCP tools consume Entity/Relation JSONL format and align with `perform_mmot_evaluation` tool
- **Schema convergence**: Veritas operations use coaia-narrative's canonical JSONL format

## Current Reality

- coaia-narrative has `mmot_evaluation_loop.spec.md` defining MMOT evaluation — veritas should align with this
- mia-code's miaco can do chart operations but doesn't invoke external MMOT evaluation
- medicine-wheel's ontology-core defines `StructuralTensionChart` type — veritas evaluates these but no formal bridge exists
- Issue miadisabelle/workspace-openclaw#28 tracks schema convergence
- coaia-narrative KINSHIP.md names veritas as sibling but notes "overlap needs clarification"

## Action Stack

1. **SOUTH**: Analyze coaia-narrative's `mmot_evaluation_loop.spec.md` for alignment points
2. **SOUTH**: Analyze mia-code's `mcp.rispecs.md` and `core.rispecs.md` for integration patterns
3. **SOUTH**: Analyze medicine-wheel's `ontology-core.spec.md` for type bridges
4. **NORTH**: Author `veritas-integration.spec.md` for mia-code rispecs
5. **NORTH**: Author `veritas-mmot-bridge.spec.md` for medicine-wheel rispecs
6. **NORTH**: Document coaia-narrative schema alignment in veritas rispecs
7. **WEST**: Validate proposals don't conflict with existing specs
8. **WEST**: Verify kinship references are bidirectional

## Files Needed

- `/a/src/coaia-narrative/rispecs/mmot_evaluation_loop.spec.md`
- `/a/src/coaia-narrative/rispecs/mcp_api_specification.spec.md`
- `/a/src/mia-code/rispecs/mcp.rispecs.md`
- `/a/src/mia-code/rispecs/core.rispecs.md`
- `/workspace/repos/jgwill/medicine-wheel/rispecs/ontology-core.spec.md`
- All existing veritas rispecs

## Ambiguities

- [IMPLICIT] Should proposals be fully detailed or initial sketches? → Fully detailed rispecs following convention
- [IMPLICIT] Who approves cross-repo changes? → Guillaume (jgwill) as steward; proposals are committed but flagged
- [EXPLICIT] "propose something for what could be integrated" — create concrete rispecs, not just ideas

## WEST Direction (Validation)

- Proposals don't duplicate existing specs
- Cross-references between repos are consistent
- MMOT evaluation flow is clear end-to-end (coaia creates chart → veritas evaluates → mia-code acts on results)
